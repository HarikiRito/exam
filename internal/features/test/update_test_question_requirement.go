package test

import (
	"context"
	"errors"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/schema/mixin"
	"template/internal/ent/test"
	"template/internal/ent/testquestioncount"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// UpdateTestQuestionRequirement updates the number of questions requirement based on points per question for a test.
// Requires user authentication and authorization (user must own the course containing the test).
func UpdateTestQuestionRequirement(ctx context.Context, userId uuid.UUID, testID uuid.UUID, input []model.UpdateTestQuestionRequirementInput) (bool, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return false, err
	}

	// Get the test and verify ownership through course or course_section
	testExists, err := tx.Test.Query().
		Where(test.ID(testID)).
		Exist(ctx)
	if err != nil || !testExists {
		return false, db.Rollback(tx, errors.New("test not found"))
	}

	// Delete existing TestQuestionCount records for this test
	_, err = tx.TestQuestionCount.Delete().
		Where(testquestioncount.TestID(testID)).
		Exec(mixin.SkipSoftDelete(ctx))
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	// Bulk create new TestQuestionCount records
	createQueries := make([]*ent.TestQuestionCountCreate, 0, len(input))
	for _, requirement := range input {
		createQueries = append(createQueries, tx.TestQuestionCount.Create().
			SetTestID(testID).
			SetNumberOfQuestions(requirement.NumberOfQuestions).
			SetPoints(requirement.PointsPerQuestion))
	}

	_, err = tx.TestQuestionCount.CreateBulk(createQueries...).
		Save(ctx)

	if err != nil {
		return false, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return false, db.Rollback(tx, err)
	}

	return true, nil
}
