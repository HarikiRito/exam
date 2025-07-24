package question_collection

import (
	"context"
	"errors"
	"template/internal/ent/db"
	"template/internal/ent/questioncollection"

	"github.com/google/uuid"
)

// DeleteQuestionCollection deletes a question collection, only if the user is the creator.
func DeleteQuestionCollection(ctx context.Context, userId uuid.UUID, collectionId uuid.UUID) (bool, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return false, err
	}

	// Check if the collection exists and the user is the creator
	exists, err := tx.QuestionCollection.Query().
		Where(questioncollection.ID(collectionId), questioncollection.CreatorID(userId)).
		Exist(ctx)
	if err != nil {
		return false, db.Rollback(tx, err)
	}
	if !exists {
		return false, db.Rollback(tx, errors.New("question collection not found or unauthorized"))
	}

	// Delete the collection
	err = tx.QuestionCollection.DeleteOneID(collectionId).Exec(ctx)
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return false, err
	}

	return true, nil
}
