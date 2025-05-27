package question

import (
	"context"
	"errors"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/question"
	"template/internal/ent/questioncollection"
	"template/internal/ent/questionoption"
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

	// Check if the collection exists and the user has access to it (now required)
	collection, err := tx.QuestionCollection.Query().
		Where(
			questioncollection.ID(input.QuestionCollectionID),
			questioncollection.CreatorID(userId),
		).
		Only(ctx)
	if err != nil {
		return nil, db.Rollback(tx, errors.New("collection not found or you don't have access to it"))
	}

	// Create the question with the required collection
	newQuestion, err := tx.Question.Create().
		SetQuestionText(input.QuestionText).
		SetCollectionID(collection.ID).
		Save(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	// Create question options if provided
	if len(input.Options) > 0 {
		questionOptionCreateQueries := slice.Map(input.Options, func(option *model.QuestionOptionInput) *ent.QuestionOptionCreate {
			return tx.QuestionOption.Create().
				SetOptionText(option.OptionText).
				SetIsCorrect(option.IsCorrect).
				SetQuestionID(newQuestion.ID)
		})

		_, err = tx.QuestionOption.CreateBulk(questionOptionCreateQueries...).Save(ctx)
		if err != nil {
			return nil, db.Rollback(tx, err)
		}
	}

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
		Where(question.ID(questionID), question.HasCollectionWith(questioncollection.CreatorID(userId))).
		Only(ctx)
	if err != nil {
		return nil, err
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

	// Verify the question exists and user has access to it
	exists, err := client.Question.Query().
		Where(question.ID(questionID), question.HasCollectionWith(questioncollection.CreatorID(userId))).
		Exist(ctx)
	if err != nil {
		return false, err
	}

	if !exists {
		return false, errors.New("question not found or you don't have access to it")
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
	// 1. Not associated with any collection
	// 2. Associated with a collection created by the user
	query = query.Where(
		question.HasCollectionWith(
			questioncollection.CreatorID(userId),
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

// GetQuestionOptionsByQuestionIDs fetches question options for multiple question IDs.
func GetQuestionOptionsByQuestionIDs(ctx context.Context, questionIDs []uuid.UUID) ([]*ent.QuestionOption, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	options, err := client.QuestionOption.Query().
		Where(questionoption.QuestionIDIn(questionIDs...)).
		All(ctx)
	if err != nil {
		return nil, err
	}

	return options, nil
}
