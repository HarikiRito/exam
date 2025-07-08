package test

import (
	"context"
	"errors"
	"template/internal/ent/db"
	"template/internal/ent/questioncollection"
	"template/internal/ent/test"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

// AddMultiCollectionToTest adds multiple question collections to a test.
// Requires user authentication and authorization (user must own the course containing the test).
func UpdateQuestionCollectionsForTest(ctx context.Context, userId uuid.UUID, input model.AddMultiCollectionToTestInput) (bool, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return false, err
	}

	testExists, err := tx.Test.Query().
		Where(test.ID(input.TestID)).
		Exist(ctx)
	if err != nil || !testExists {
		return false, db.Rollback(tx, errors.New("test not found"))
	}

	collectionIds := slice.Unique(input.CollectionIds)

	// Get the count of collections that are owned by the user
	collectionCount, err := tx.QuestionCollection.Query().
		Where(
			questioncollection.IDIn(collectionIds...),
			questioncollection.CreatorID(userId),
		).Count(ctx)
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	if collectionCount != len(collectionIds) {
		return false, db.Rollback(tx, errors.New("one or more collections not found or unauthorized"))
	}

	// Add collections to the test
	_, err = tx.Test.UpdateOneID(input.TestID).ClearQuestionCollections().
		AddQuestionCollectionIDs(collectionIds...).
		Save(ctx)
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return false, db.Rollback(tx, err)
	}

	return true, nil
}
