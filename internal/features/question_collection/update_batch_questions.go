package question_collection

import (
	"context"
	"errors"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/question"
	"template/internal/ent/questioncollection"
	"template/internal/ent/questionoption"
	"template/internal/ent/schema/mixin"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

type questionUpdateData struct {
	ID           uuid.UUID
	QuestionText string
	Options      []*model.UpdateQuestionOptionInput
}

type questionCreateData struct {
	QuestionText string
	Options      []*model.UpdateQuestionOptionInput
}

// UpdateBatchQuestionsByCollection handles batch updates of questions within a collection
func UpdateBatchQuestionsByCollection(ctx context.Context, userId uuid.UUID, input model.UpdateBatchQuestionsByCollectionInput) error {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return err
	}
	defer db.CloseTransaction(tx)

	// Verify the collection exists and user has access to it
	collection, err := tx.QuestionCollection.Query().
		Where(
			questioncollection.ID(input.CollectionID),
			questioncollection.CreatorID(userId),
		).
		Select(questioncollection.FieldID).
		Only(ctx)
	if err != nil {
		return db.Rollback(tx, errors.New("collection not found or you don't have access to it"))
	}

	// Separate questions by operation type
	var questionsToUpdate []questionUpdateData
	var questionsToCreate []questionCreateData
	var questionIDsToDelete []uuid.UUID

	for _, questionData := range input.Questions {
		if questionData.ID != nil {
			if questionData.QuestionText == nil {
				// Delete operation
				questionIDsToDelete = append(questionIDsToDelete, *questionData.ID)
			} else {
				// Update operation
				questionsToUpdate = append(questionsToUpdate, questionUpdateData{
					ID:           *questionData.ID,
					QuestionText: *questionData.QuestionText,
					Options:      questionData.Options,
				})
			}
		} else if questionData.QuestionText != nil {
			// Create operation
			questionsToCreate = append(questionsToCreate, questionCreateData{
				QuestionText: *questionData.QuestionText,
				Options:      questionData.Options,
			})
		}
	}

	// Handle deletions
	if len(questionIDsToDelete) > 0 {
		err = handleBatchQuestionsDeletion(ctx, tx, questionIDsToDelete, userId)
		if err != nil {
			return db.Rollback(tx, err)
		}
	}

	// Handle updates
	if len(questionsToUpdate) > 0 {
		err = handleBatchQuestionsUpdate(ctx, tx, questionsToUpdate, userId)
		if err != nil {
			return db.Rollback(tx, err)
		}
	}

	// Handle creations
	if len(questionsToCreate) > 0 {
		err = handleBatchQuestionsCreation(ctx, tx, collection.ID, questionsToCreate)
		if err != nil {
			return db.Rollback(tx, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return db.Rollback(tx, err)
	}

	return nil
}

// handleBatchQuestionsDeletion deletes multiple questions and verifies user access
func handleBatchQuestionsDeletion(ctx context.Context, tx *ent.Tx, questionIDs []uuid.UUID, userId uuid.UUID) error {
	// Verify the questions exist and user has access to them
	questions, err := tx.Question.Query().
		Where(question.IDIn(questionIDs...), question.HasCollectionWith(questioncollection.CreatorID(userId))).
		Select(question.FieldID).
		All(ctx)
	if err != nil {
		return errors.New("questions not found or you don't have access to them")
	}

	validQuestionIDs := slice.Map(questions, func(question *ent.Question) uuid.UUID {
		return question.ID
	})

	_, err = tx.Question.Delete().
		Where(question.IDIn(validQuestionIDs...)).
		Exec(mixin.SkipSoftDelete(ctx))
	if err != nil {
		return err
	}

	return nil
}

// handleBatchQuestionsUpdate updates multiple questions and their options in batch
func handleBatchQuestionsUpdate(ctx context.Context, tx *ent.Tx, questionsToUpdate []questionUpdateData, userId uuid.UUID) error {
	questionIDs := slice.Map(questionsToUpdate, func(q questionUpdateData) uuid.UUID {
		return q.ID
	})

	// Verify all questions exist and user has access to them
	existingQuestions, err := tx.Question.Query().
		Where(question.IDIn(questionIDs...), question.HasCollectionWith(questioncollection.CreatorID(userId))).
		Select(question.FieldID).
		All(ctx)
	if err != nil {
		return errors.New("questions not found or you don't have access to them")
	}

	if len(existingQuestions) != len(questionIDs) {
		return errors.New("some questions not found or you don't have access to them")
	}

	// Batch update question texts
	for _, questionData := range questionsToUpdate {
		_, err = tx.Question.UpdateOneID(questionData.ID).
			SetQuestionText(questionData.QuestionText).
			Save(ctx)
		if err != nil {
			return err
		}
	}

	questionOptionsMap := make(map[uuid.UUID][]*model.UpdateQuestionOptionInput)
	for _, questionData := range questionsToUpdate {
		questionOptionsMap[questionData.ID] = questionData.Options
	}

	err = handleBatchOptionsUpdate(ctx, tx, questionOptionsMap)
	if err != nil {
		return err
	}

	return nil
}

// handleBatchQuestionsCreation creates multiple questions and their options in batch
func handleBatchQuestionsCreation(ctx context.Context, tx *ent.Tx, collectionID uuid.UUID, questionsToCreate []questionCreateData) error {
	// Validate all questions
	for _, questionData := range questionsToCreate {
		if len(questionData.Options) > 0 {
			hasCorrectOption := slice.Some(questionData.Options, func(option *model.UpdateQuestionOptionInput) bool {
				return option.IsCorrect != nil && *option.IsCorrect
			})
			if !hasCorrectOption {
				return errors.New("at least one option must be correct for each question")
			}
		}
	}

	// Batch create questions
	questionCreateQueries := slice.Map(questionsToCreate, func(questionData questionCreateData) *ent.QuestionCreate {
		return tx.Question.Create().
			SetQuestionText(questionData.QuestionText).
			SetCollectionID(collectionID)
	})

	createdQuestions, err := tx.Question.CreateBulk(questionCreateQueries...).Save(ctx)
	if err != nil {
		return err
	}

	// Batch create all options for all questions
	questionOptionsMap := make(map[uuid.UUID][]*model.UpdateQuestionOptionInput)
	for i, question := range createdQuestions {
		questionOptionsMap[question.ID] = questionsToCreate[i].Options
	}

	err = handleBatchOptionsUpdate(ctx, tx, questionOptionsMap)
	if err != nil {
		return err
	}

	return nil
}

// handleBatchOptionsUpdate handles batch updates/creates/deletes for question options
func handleBatchOptionsUpdate(ctx context.Context, tx *ent.Tx, questionOptionsMap map[uuid.UUID][]*model.UpdateQuestionOptionInput) error {

	// Validate that at least one option is correct
	for _, newOptions := range questionOptionsMap {
		hasCorrectOption := slice.Some(newOptions, func(option *model.UpdateQuestionOptionInput) bool {
			return option.IsCorrect != nil && *option.IsCorrect
		})
		if !hasCorrectOption {
			return fmt.Errorf("at least one option must be correct")
		}
	}

	// Delete all existing options for the questions
	for questionID := range questionOptionsMap {
		_, err := tx.QuestionOption.Delete().
			Where(questionoption.QuestionID(questionID)).
			Exec(mixin.SkipSoftDelete(ctx))
		if err != nil {
			return err
		}
	}

	// Create all new options query for bulk create
	var optionCreateQueries []*ent.QuestionOptionCreate
	for questionID, newOptions := range questionOptionsMap {
		for _, newOption := range newOptions {
			optionText := ""
			if newOption.OptionText != nil {
				optionText = *newOption.OptionText
			}
			isCorrect := false
			if newOption.IsCorrect != nil {
				isCorrect = *newOption.IsCorrect
			}

			optionCreate := tx.QuestionOption.Create().
				SetOptionText(optionText).
				SetIsCorrect(isCorrect).
				SetQuestionID(questionID)

			optionCreateQueries = append(optionCreateQueries, optionCreate)
		}
	}

	_, err := tx.QuestionOption.CreateBulk(optionCreateQueries...).Save(ctx)
	if err != nil {
		return err
	}

	return nil
}
