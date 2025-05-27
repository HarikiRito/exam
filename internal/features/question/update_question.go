package question

import (
	"context"
	"errors"
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

func UpdateQuestion(ctx context.Context, userId uuid.UUID, questionID uuid.UUID, input model.UpdateQuestionInput) (*ent.Question, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return nil, err
	}
	defer db.CloseTransaction(tx)

	// Verify the question exists and user has access to it
	exists, err := tx.Question.Query().
		Where(question.ID(questionID), question.HasCollectionWith(questioncollection.CreatorID(userId))).
		Exist(ctx)
	if err != nil || !exists {
		return nil, db.Rollback(tx, errors.New("question not found or you don't have access to it"))
	}

	// Start building the update
	update := tx.Question.UpdateOneID(questionID)

	update.SetNillableQuestionText(input.QuestionText)

	// Update collection ID if provided
	if input.QuestionCollectionID != nil {
		collection, err := tx.QuestionCollection.Query().
			Where(
				questioncollection.ID(*input.QuestionCollectionID),
				questioncollection.CreatorID(userId),
			).
			Only(ctx)
		if err != nil {
			return nil, db.Rollback(tx, errors.New("collection not found or you don't have access to it"))
		}
		update.SetCollectionID(collection.ID)
	}

	// Save the changes
	_, err = update.Save(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	// Handle options replacement if provided
	if input.Options != nil {
		// Validate that at least one option is correct (if options are provided and not empty)
		if len(input.Options) > 0 {
			hasCorrectOption := slice.Some(input.Options, func(option *model.QuestionOptionInput) bool {
				return option.IsCorrect
			})
			if !hasCorrectOption {
				return nil, db.Rollback(tx, errors.New("at least one option must be correct"))
			}
		}

		// Delete all existing options for this question
		_, err = tx.QuestionOption.Delete().
			Where(questionoption.QuestionID(questionID)).
			Exec(mixin.SkipSoftDelete(ctx))
		if err != nil {
			return nil, db.Rollback(tx, err)
		}

		// Create new options in batch if any are provided
		if len(input.Options) > 0 {
			questionOptionCreateQueries := slice.Map(input.Options, func(option *model.QuestionOptionInput) *ent.QuestionOptionCreate {
				return tx.QuestionOption.Create().
					SetOptionText(option.OptionText).
					SetIsCorrect(option.IsCorrect).
					SetQuestionID(questionID)
			})

			_, err = tx.QuestionOption.CreateBulk(questionOptionCreateQueries...).Save(ctx)
			if err != nil {
				return nil, db.Rollback(tx, err)
			}
		}
	}

	// Fetch the updated question with all related data
	updatedQuestion, err := tx.Question.Query().
		Where(question.ID(questionID)).
		Only(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return nil, db.Rollback(tx, err)
	}

	return updatedQuestion, nil
}
