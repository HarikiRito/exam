package question_option

import (
	"context"
	"errors"
	"github.com/google/uuid"
	"template/internal/ent"
	"template/internal/ent/course"
	"template/internal/ent/coursesection"
	"template/internal/ent/db"
	"template/internal/ent/question"
	"template/internal/ent/questionoption"
	"template/internal/features/common"
	"template/internal/graph/model"
)

// CreateQuestionOption creates a new question option with the given input.
func CreateQuestionOption(ctx context.Context, userId uuid.UUID, input model.CreateQuestionOptionInput) (*ent.QuestionOption, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	// First verify that the user has access to the question
	query, err := client.Question.Query().
		Where(question.ID(input.QuestionID)).
		WithSection().
		Only(ctx)
	if err != nil {
		return nil, errors.New("question not found")
	}

	// If the question is linked to a section, verify the user has access
	if query.Edges.Section != nil {
		hasAccess, err := client.Course.Query().
			Where(
				course.ID(query.Edges.Section.CourseID),
				course.CreatorID(userId),
			).
			Exist(ctx)
		if err != nil || !hasAccess {
			return nil, errors.New("you don't have access to this question")
		}
	}

	// Create the question option
	option, err := client.QuestionOption.Create().
		SetQuestionID(input.QuestionID).
		SetOptionText(input.OptionText).
		SetIsCorrect(input.IsCorrect).
		Save(ctx)
	if err != nil {
		return nil, err
	}

	return option, nil
}

// GetQuestionOptionByID fetches a question option by its ID.
func GetQuestionOptionByID(ctx context.Context, userId uuid.UUID, optionID uuid.UUID) (*ent.QuestionOption, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	// Get the option with its associated question and section
	option, err := client.QuestionOption.Query().
		Where(questionoption.ID(optionID)).
		WithQuestion(func(q *ent.QuestionQuery) {
			q.WithSection()
		}).
		Only(ctx)
	if err != nil {
		return nil, err
	}

	// Verify the user has access to the associated question
	if option.Edges.Question.Edges.Section != nil {
		hasAccess, err := client.Course.Query().
			Where(
				course.ID(option.Edges.Question.Edges.Section.CourseID),
				course.CreatorID(userId),
			).
			Exist(ctx)
		if err != nil || !hasAccess {
			return nil, errors.New("you don't have access to this question option")
		}
	}

	return option, nil
}

// UpdateQuestionOption updates a question option by its ID with the provided input.
func UpdateQuestionOption(ctx context.Context, userId uuid.UUID, optionID uuid.UUID, input model.UpdateQuestionOptionInput) (*ent.QuestionOption, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	// Get the option with its associated question and section
	option, err := client.QuestionOption.Query().
		Where(questionoption.ID(optionID)).
		WithQuestion(func(q *ent.QuestionQuery) {
			q.WithSection()
		}).
		Only(ctx)
	if err != nil {
		return nil, err
	}

	// Verify the user has access to the associated question
	if option.Edges.Question.Edges.Section != nil {
		hasAccess, err := client.Course.Query().
			Where(
				course.ID(option.Edges.Question.Edges.Section.CourseID),
				course.CreatorID(userId),
			).
			Exist(ctx)
		if err != nil || !hasAccess {
			return nil, errors.New("you don't have access to update this question option")
		}
	}

	// Start building the update
	update := client.QuestionOption.UpdateOneID(optionID).
		SetNillableOptionText(input.OptionText).
		SetNillableIsCorrect(input.IsCorrect)

	// Save the changes
	updatedOption, err := update.Save(ctx)
	if err != nil {
		return nil, err
	}

	return updatedOption, nil
}

// DeleteQuestionOption deletes a question option by its ID.
func DeleteQuestionOption(ctx context.Context, userId uuid.UUID, optionID uuid.UUID) (bool, error) {
	client, err := db.OpenClient()
	if err != nil {
		return false, err
	}
	defer client.Close()

	// Get the option with its associated question and section
	option, err := client.QuestionOption.Query().
		Where(questionoption.ID(optionID)).
		WithQuestion(func(q *ent.QuestionQuery) {
			q.Select(question.FieldSectionID).WithSection(func(s *ent.CourseSectionQuery) {
				s.Select(coursesection.FieldCourseID)
			})
		}).
		Only(ctx)
	if err != nil {
		return false, err
	}

	// Verify the user has access to the associated question
	if option.Edges.Question.Edges.Section != nil {
		hasAccess, err := client.Course.Query().
			Where(
				course.ID(option.Edges.Question.Edges.Section.CourseID),
				course.CreatorID(userId),
			).
			Exist(ctx)
		if err != nil || !hasAccess {
			return false, errors.New("you don't have access to delete this question option")
		}
	}

	// Delete the option
	err = client.QuestionOption.DeleteOneID(optionID).Exec(ctx)
	if err != nil {
		return false, err
	}

	return true, nil
}

// PaginatedQuestionOptions returns a paginated list of question options for a specific question.
func PaginatedQuestionOptions(ctx context.Context, userId uuid.UUID, questionId *uuid.UUID, input *model.PaginationInput) (*common.PaginatedResult[*ent.QuestionOption], error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	// Start building the query
	query := client.QuestionOption.Query()

	// If a question ID is provided, filter by it
	if questionId != nil {
		// First verify that the user has access to the question
		q, err := client.Question.Query().
			Where(question.ID(*questionId)).
			WithSection(func(s *ent.CourseSectionQuery) {
				s.Select(coursesection.FieldCourseID)
			}).
			Only(ctx)
		if err != nil {
			return nil, errors.New("question not found")
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

		// Filter by the question ID
		query = query.Where(questionoption.QuestionID(*questionId))
	} else {
		// If no question ID is provided, filter by options for questions that the user has access to
		query = query.Where(
			questionoption.HasQuestionWith(
				question.Or(
					question.Not(question.HasSection()),
					question.HasSectionWith(
						coursesection.HasCourseWith(
							course.CreatorID(userId),
						),
					),
				),
			),
		)
	}

	// Add search functionality if provided
	if input != nil && input.Search != nil && *input.Search != "" {
		query = query.Where(questionoption.OptionTextContainsFold(*input.Search))
	}

	// Use the default pagination input if none is provided
	newInput := common.FallbackValue(input, common.DefaultPaginationInput)

	// Paginate the results
	return common.EntQueryPaginated(ctx, query, newInput.Page, newInput.Limit)
}
