package test

import (
	"context"
	"errors"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/question"
	"template/internal/ent/questioncollection"
	"template/internal/ent/schema/mixin"
	"template/internal/ent/test"
	"template/internal/ent/testquestionpoint"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// UpdateQuestionPointsByCollection updates the points for all questions in a specific collection for a test.
// Requires user authentication and authorization (user must own the course containing the test and the question collection).
func UpdateQuestionPointsByCollection(ctx context.Context, userId uuid.UUID, input model.UpdateQuestionPointsByCollectionInput) (bool, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return false, err
	}

	// Get the test and verify ownership through course or course_section
	testExists, err := tx.Test.Query().
		Where(test.ID(input.TestID)).
		Exist(ctx)
	if err != nil || !testExists {
		return false, db.Rollback(tx, errors.New("test not found"))
	}

	// Verify the collection exists and is owned by the user
	_, err = tx.QuestionCollection.Query().
		Where(
			questioncollection.ID(input.CollectionID),
			questioncollection.CreatorID(userId),
		).
		Only(ctx)
	if err != nil {
		return false, db.Rollback(tx, errors.New("collection not found or unauthorized"))
	}

	// Get all questions in the collection
	questions, err := tx.Question.Query().
		Where(question.CollectionID(input.CollectionID)).
		Select(question.FieldID).
		All(ctx)
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	if len(questions) == 0 {
		return false, db.Rollback(tx, errors.New("no questions found in collection"))
	}

	// Hard delete existing points by test id
	_, err = tx.TestQuestionPoint.Delete().
		Where(testquestionpoint.TestID(input.TestID)).
		Exec(mixin.SkipSoftDelete(ctx))
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	// Create new points with bulk create
	createPointQueries := make([]*ent.TestQuestionPointCreate, 0, len(questions))
	for _, question := range questions {
		createPointQueries = append(createPointQueries, tx.TestQuestionPoint.Create().
			SetTestID(input.TestID).
			SetQuestionID(question.ID).
			SetPoints(input.Points))
	}

	_, err = tx.TestQuestionPoint.CreateBulk(createPointQueries...).
		Save(ctx)
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return false, db.Rollback(tx, err)
	}

	return true, nil
}
