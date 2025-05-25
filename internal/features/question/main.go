package question

import (
	"context"
	"errors"
	"template/internal/ent"
	"template/internal/ent/course"
	"template/internal/ent/coursesection"
	"template/internal/ent/db"
	"template/internal/ent/question"
	"template/internal/features/common"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

// CreateQuestion creates a new question with the given input and userId.
func CreateQuestion(ctx context.Context, userId uuid.UUID, input model.CreateQuestionInput) (*ent.Question, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return nil, err
	}
	defer db.CloseTransaction(tx)

	// Start building the question
	newQuestionQuery := tx.Question.Create().
		SetQuestionText(input.QuestionText)

	// If a section ID is provided, validate it and set it
	if input.CourseSectionID != nil {
		// Check if the section exists and the user has access to it
		section, err := tx.CourseSection.Query().
			Where(
				coursesection.ID(*input.CourseSectionID),
				coursesection.HasCourseWith(course.CreatorID(userId)),
			).
			Only(ctx)
		if err != nil {
			return nil, db.Rollback(tx, errors.New("section not found or you don't have access to it"))
		}

		newQuestionQuery.SetSectionID(section.ID)
	}

	// Save the newQuestion
	newQuestion, err := newQuestionQuery.Save(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	questionOptionCreateQueries := slice.Map(input.Options, func(option *model.QuestionOptionInput) *ent.QuestionOptionCreate {
		return tx.QuestionOption.Create().
			SetOptionText(option.OptionText).
			SetIsCorrect(option.IsCorrect).
			SetQuestionID(newQuestion.ID)
	})

	questionOptions, err := tx.QuestionOption.CreateBulk(questionOptionCreateQueries...).Save(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	newQuestionQuery.AddQuestionOptions(questionOptions...)

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		return nil, db.Rollback(tx, err)
	}

	return newQuestion, nil
}

// GetQuestionByID fetches a question by its ID.
func GetQuestionByID(ctx context.Context, userId uuid.UUID, questionID uuid.UUID) (*ent.Question, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	q, err := client.Question.Query().
		Where(question.ID(questionID)).
		WithQuestionOptions().
		WithSection().
		Only(ctx)
	if err != nil {
		return nil, err
	}

	// If the question is linked to a section, verify the user has access
	if q.Edges.Section != nil {
		hasAccess, err := client.Course.Query().
			Where(
				course.ID(q.Edges.Section.CourseID),
				course.CreatorID(userId),
			).
			Exist(ctx)
		if err != nil || !hasAccess {
			return nil, errors.New("you don't have access to this question")
		}
	}

	return q, nil
}

// UpdateQuestion updates a question by its ID with the provided input.
func UpdateQuestion(ctx context.Context, userId uuid.UUID, questionID uuid.UUID, input model.UpdateQuestionInput) (*ent.Question, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return nil, err
	}
	defer db.CloseTransaction(tx)

	// Get the question
	q, err := tx.Question.Query().
		Where(question.ID(questionID)).
		WithSection().
		Only(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	// Verify user has access
	if q.Edges.Section != nil {
		hasAccess, err := tx.Course.Query().
			Where(
				course.ID(q.Edges.Section.CourseID),
				course.CreatorID(userId),
			).
			Exist(ctx)
		if err != nil || !hasAccess {
			return nil, db.Rollback(tx, errors.New("you don't have access to update this question"))
		}
	}

	// Start building the update
	update := tx.Question.UpdateOneID(questionID)

	// Update question text if provided
	if input.QuestionText != nil {
		update.SetQuestionText(*input.QuestionText)
	}

	// Update section ID if provided
	if input.CourseSectionID != nil {
		section, err := tx.CourseSection.Query().
			Where(
				coursesection.ID(*input.CourseSectionID),
				coursesection.HasCourseWith(course.CreatorID(userId)),
			).
			Only(ctx)
		if err != nil {
			return nil, db.Rollback(tx, errors.New("section not found or you don't have access to it"))
		}
		update.SetSectionID(section.ID)
	}

	// Save the changes
	q, err = update.Save(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	// Fetch the updated question with all related data
	q, err = tx.Question.Query().
		Where(question.ID(questionID)).
		WithQuestionOptions().
		WithSection().
		Only(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return nil, db.Rollback(tx, err)
	}

	return q, nil
}

// DeleteQuestion deletes a question by its ID.
func DeleteQuestion(ctx context.Context, userId uuid.UUID, questionID uuid.UUID) (bool, error) {
	client, err := db.OpenClient()
	if err != nil {
		return false, err
	}
	defer client.Close()

	// Get the question
	q, err := client.Question.Query().
		Where(question.ID(questionID)).
		WithSection().
		Only(ctx)
	if err != nil {
		return false, err
	}

	// Verify user has access
	if q.Edges.Section != nil {
		hasAccess, err := client.Course.Query().
			Where(
				course.ID(q.Edges.Section.CourseID),
				course.CreatorID(userId),
			).
			Exist(ctx)
		if err != nil || !hasAccess {
			return false, errors.New("you don't have access to delete this question")
		}
	}

	// Delete the question
	err = client.Question.DeleteOneID(questionID).Exec(ctx)
	if err != nil {
		return false, err
	}

	return true, nil
}

// PaginatedQuestions returns a paginated list of questions.
func PaginatedQuestions(ctx context.Context, userId uuid.UUID, input *model.PaginationInput) (*common.PaginatedResult[*ent.Question], error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	// Start building the query
	query := client.Question.Query()

	// Filter by questions that are either:
	// 1. Not associated with any section
	// 2. Associated with a section of a course created by the user
	query = query.Where(
		question.Or(
			question.Not(question.HasSection()),
			question.HasSectionWith(
				coursesection.HasCourseWith(
					course.CreatorID(userId),
				),
			),
		),
	)

	// Add search functionality if provided
	if input != nil && input.Search != nil && *input.Search != "" {
		query = query.Where(question.QuestionTextContainsFold(*input.Search))
	}

	// Use the default pagination input if none is provided
	newInput := common.FallbackValue(input, common.DefaultPaginationInput)

	// Paginate the results
	return common.EntQueryPaginated(ctx, query, *newInput.Page, *newInput.Limit)
}
