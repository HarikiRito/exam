package question_collection

import (
	"context"
	"errors"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/questioncollection"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// UpdateQuestionCollection updates an existing question collection, only if the user is the creator.
func UpdateQuestionCollection(ctx context.Context, userId uuid.UUID, collectionId uuid.UUID, input model.UpdateQuestionCollectionInput) (*ent.QuestionCollection, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return nil, err
	}

	// Check if the collection exists and the user is the creator
	collection, err := tx.QuestionCollection.Query().
		Where(questioncollection.ID(collectionId), questioncollection.CreatorID(userId)).
		First(ctx)
	if err != nil {
		return nil, db.Rollback(tx, errors.New("question collection not found or unauthorized"))
	}

	// Update the collection
	collection, err = collection.Update().
		SetNillableTitle(input.Title).
		SetNillableDescription(input.Description).
		Save(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return nil, db.Rollback(tx, err)
	}

	return collection, nil
}
