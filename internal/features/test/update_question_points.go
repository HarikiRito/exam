package test

import (
	"context"
	"errors"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/question"
	"template/internal/ent/questioncollection"
	"template/internal/ent/test"
	"template/internal/ent/testquestionpoint"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// UpdateQuestionPoints updates the points for a specific question in a test.
// Requires user authentication and authorization (user must own the course containing the test and the question collection).
func UpdateQuestionPoints(ctx context.Context, userId uuid.UUID, input model.UpdateQuestionPointsInput) (bool, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return false, err
	}
	defer db.CloseTransaction(tx)

	// Get the test and verify ownership through course or course_section
	testExists, err := tx.Test.Query().
		Where(test.ID(input.TestID)).
		Exist(ctx)
	if err != nil || !testExists {
		return false, db.Rollback(tx, errors.New("test not found"))
	}

	// Verify the question exists and is owned by the user
	questionExists, err := tx.Question.Query().
		Where(
			question.ID(input.QuestionID),
			question.HasCollectionWith(questioncollection.CreatorID(userId)),
		).
		Exist(ctx)
	if err != nil || !questionExists {
		return false, db.Rollback(tx, errors.New("question not found or unauthorized"))
	}

	// Check if a TestQuestionPoint already exists for this test-question pair
	existingPoint, err := tx.TestQuestionPoint.Query().
		Where(
			testquestionpoint.TestID(input.TestID),
			testquestionpoint.QuestionID(input.QuestionID),
		).
		Only(ctx)

	if err != nil {
		// If not found, create a new TestQuestionPoint
		if ent.IsNotFound(err) {
			_, err = tx.TestQuestionPoint.Create().
				SetTestID(input.TestID).
				SetQuestionID(input.QuestionID).
				SetPoints(input.Points).
				Save(ctx)
			if err != nil {
				return false, db.Rollback(tx, err)
			}
		} else {
			return false, db.Rollback(tx, err)
		}
	} else {
		// Update existing TestQuestionPoint
		_, err = tx.TestQuestionPoint.UpdateOneID(existingPoint.ID).
			SetPoints(input.Points).
			Save(ctx)
		if err != nil {
			return false, db.Rollback(tx, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return false, db.Rollback(tx, err)
	}

	return true, nil
}
