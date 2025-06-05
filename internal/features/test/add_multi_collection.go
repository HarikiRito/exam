package test

import (
	"context"
	"errors"
	"template/internal/ent/db"
	"template/internal/ent/questioncollection"
	"template/internal/ent/test"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// AddMultiCollectionToTest adds multiple question collections to a test.
// Requires user authentication and authorization (user must own the course containing the test).
func AddMultiCollection(ctx context.Context, userId uuid.UUID, input model.AddMultiCollectionToTestInput) (bool, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return false, err
	}
	defer db.CloseTransaction(tx)

	_, err = tx.Test.Query().
		Where(test.ID(input.TestID)).
		Exist(ctx)
	if err != nil {
		return false, db.Rollback(tx, errors.New("test not found"))
	}

	// Get the count of collections that are owned by the user
	collectionCount, err := tx.QuestionCollection.Query().
		Where(
			questioncollection.IDIn(input.CollectionIds...),
			questioncollection.CreatorID(userId),
		).Count(ctx)
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	if collectionCount != len(input.CollectionIds) {
		return false, db.Rollback(tx, errors.New("one or more collections not found or unauthorized"))
	}

	// Add collections to the test
	_, err = tx.Test.UpdateOneID(input.TestID).ClearQuestionCollections().
		AddQuestionCollectionIDs(input.CollectionIds...).
		Save(ctx)
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return false, db.Rollback(tx, err)
	}

	return true, nil
}
