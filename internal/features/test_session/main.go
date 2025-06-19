package test_session

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/testsession"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// CreateTestSession creates a new test session with the given input.
func CreateTestSession(ctx context.Context, input model.CreateTestSessionInput) (*ent.TestSession, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	builder := client.TestSession.Create().
		SetTestID(input.TestID).
		SetNillableUserID(input.UserID)

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
