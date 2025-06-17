package test_session

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/testsession"
	"template/internal/ent/testsessionanswer"
	"template/internal/graph/model"
	"time"

	"github.com/google/uuid"
)

// CreateTestSession creates a new test session with the given input.
func CreateTestSession(ctx context.Context, userID uuid.UUID, input model.CreateTestSessionInput) (*ent.TestSession, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	builder := client.TestSession.Create().
		SetUserID(userID).
		SetTestID(input.TestID).
		SetNillableCourseSectionID(input.CourseSectionID)

	session, err := builder.Save(ctx)
	if err != nil {
		return nil, err
	}

	return session, nil
}

// GetTestSessionByID fetches a test session by its ID.
func GetTestSessionByID(ctx context.Context, sessionID uuid.UUID) (*ent.TestSession, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	// Start with the base query
	query := client.TestSession.Query().
		Where(testsession.ID(sessionID))

	selectFields := TestSessionSelectFields(ctx)

	return query.Select(selectFields...).Only(ctx)
}

// CompleteTestSession marks a test session as completed and calculates the total score.
func CompleteTestSession(ctx context.Context, sessionID uuid.UUID) (*ent.TestSession, error) {
	// Start a transaction
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return nil, err
	}

	// Verify the session exists within the transaction
	_, err = tx.TestSession.Get(ctx, sessionID)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	// Get all user answers for this session within the transaction
	answers, err := tx.TestSessionAnswer.Query().
		Where(
			testsessionanswer.SessionID(sessionID),
		).
		All(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	// Calculate the score
	totalScore := 0
	for _, answer := range answers {
		if answer.Edges.SelectedOption.IsCorrect {
			totalScore++
		}
	}

	selectFields := TestSessionSelectFields(ctx)

	// Update the session within the transaction
	now := time.Now()
	updatedSession, err := tx.TestSession.UpdateOneID(sessionID).
		SetCompletedAt(now).
		SetPointsEarned(totalScore).
		SetStatus(testsession.StatusCompleted).
		Select(testsession.FieldID, selectFields...).
		Save(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return updatedSession, nil
}

// DeleteTestSession deletes a test session by its ID.
func DeleteTestSession(ctx context.Context, sessionID uuid.UUID) (bool, error) {
	// Start a transaction
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return false, err
	}

	// Delete the test session within the transaction
	err = tx.TestSession.DeleteOneID(sessionID).Exec(ctx)
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		return false, err
	}

	return true, nil
}
