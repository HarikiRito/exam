package test_session

import (
	"context"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/testquestioncount"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

// CreateTestSession creates test session(s) with the given input.
// It supports both single session creation (using userId) and bulk creation (using userIds).
// Returns a slice of test sessions - single element for single creation, multiple for bulk.
func CreateTestSession(ctx context.Context, input model.CreateTestSessionInput) ([]*ent.TestSession, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return nil, err
	}

	// Get the test and calculate max points from test question counts
	maxPoints, err := calculateMaxPointsForTest(ctx, tx, input.TestID)
	if err != nil {
		return nil, db.Rollback(tx, fmt.Errorf("failed to calculate max points: %w", err))
	}

	if len(input.UserIds) == 0 {
		return nil, db.Rollback(tx, fmt.Errorf("at least one userID is required to create a test session"))
	}

	var sessions []*ent.TestSession

	for _, userID := range input.UserIds {
		builder := tx.TestSession.Create().
			SetTestID(input.TestID).
			SetUserID(userID).
			SetMaxPoints(maxPoints)

		session, err := builder.Save(ctx)
		if err != nil {
			return nil, db.Rollback(tx, fmt.Errorf("failed to create test session for user %s: %w", userID, err))
		}
		sessions = append(sessions, session)
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return sessions, nil
}

// calculateMaxPointsForTest calculates the maximum points for a test based on its question count requirements
func calculateMaxPointsForTest(ctx context.Context, tx *ent.Tx, testID uuid.UUID) (int, error) {
	testQuestionCounts, err := tx.TestQuestionCount.Query().
		Where(testquestioncount.TestID(testID)).
		Select(testquestioncount.FieldNumberOfQuestions, testquestioncount.FieldPoints).
		All(ctx)

	if err != nil {
		return 0, fmt.Errorf("test not found: %w", err)
	}

	if len(testQuestionCounts) == 0 {
		return 0, fmt.Errorf("no question count requirements found for test")
	}

	maxPoints := slice.Reduce(testQuestionCounts, func(acc int, tqc *ent.TestQuestionCount) int {
		return acc + (tqc.NumberOfQuestions * tqc.Points)
	}, 0)

	return maxPoints, nil
}
