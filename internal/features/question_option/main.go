package question_option

import (
	"context"
	"errors"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/question"
	"template/internal/ent/questioncollection"
	"template/internal/ent/questionoption"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// CreateQuestionOption creates a new question option with the given input and userId.
func CreateQuestionOption(ctx context.Context, userId uuid.UUID, input model.CreateQuestionOptionInput) (*ent.QuestionOption, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	// Verify that the question exists and the user has access to it
	q, err := client.Question.Query().
		Where(question.ID(input.QuestionID)).
		WithCollection(
			func(c *ent.QuestionCollectionQuery) {
				c.Select(questioncollection.FieldCreatorID)
			},
		).
		Only(ctx)
	if err != nil {
		return nil, errors.New("question not found")
	}

	// Verify the user has access to the question through its collection
	if q.Edges.Collection != nil && q.Edges.Collection.CreatorID != userId {
		return nil, errors.New("you don't have access to this question")
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

	// Get the option with its associated question and collection
	option, err := client.QuestionOption.Query().
		Where(questionoption.ID(optionID), questionoption.HasQuestionWith(question.HasCollectionWith(questioncollection.CreatorID(userId)))).
		Only(ctx)
	if err != nil {
		return nil, err
	}

	return option, nil
}

// UpdateQuestionOption updates a question option by its ID with the provided input.
func UpdateQuestionOption(ctx context.Context, userId uuid.UUID, optionID uuid.UUID, input model.UpdateQuestionOptionInput) (*ent.QuestionOption, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	// Verify the option exists and user has access to it
	exists, err := client.QuestionOption.Query().
		Where(questionoption.ID(optionID), questionoption.HasQuestionWith(question.HasCollectionWith(questioncollection.CreatorID(userId)))).
		Exist(ctx)
	if err != nil {
		return nil, err
	}

	if !exists {
		return nil, errors.New("question option not found or you don't have access to it")
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

	// Get the option with its associated question and collection
	exists, err := client.QuestionOption.Query().
		Where(questionoption.ID(optionID), questionoption.HasQuestionWith(question.HasCollectionWith(questioncollection.CreatorID(userId)))).
		Exist(ctx)
	if err != nil {
		return false, err
	}

	if !exists {
		return false, errors.New("question option not found")
	}

	// Delete the option
	err = client.QuestionOption.DeleteOneID(optionID).Exec(ctx)
	if err != nil {
		return false, err
	}

	return true, nil
}

func GetQuestionOptionsByQuestionIDs(ctx context.Context, questionIDs []uuid.UUID) ([]*ent.QuestionOption, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	options, err := client.QuestionOption.Query().
		Where(questionoption.QuestionIDIn(questionIDs...)).
		All(ctx)
	if err != nil {
		return nil, err
	}
	return options, nil
}
