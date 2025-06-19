package test_session

import (
	"context"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/graph/model"
)

// CreateTestSession creates a new test session with the given input.
func CreateTestSession(ctx context.Context, input model.CreateTestSessionInput) (*ent.TestSession, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	builder := client.TestSession.Create().SetTestID(input.TestID).SetNillableUserID(input.UserID)

	session, err := builder.Save(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create test session: %w", err)
	}

	return session, nil
}
