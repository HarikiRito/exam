package test_session

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/testsessionanswer"

	"github.com/google/uuid"
)

// GetOrderedQuestionsBySessionIDs fetches test session answers for multiple session IDs to get question order.
func GetOrderedQuestionsBySessionIDs(ctx context.Context, sessionIDs []uuid.UUID) ([]*ent.TestSessionAnswer, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	answers, err := client.TestSessionAnswer.Query().
		Where(testsessionanswer.SessionIDIn(sessionIDs...)).
		Order(testsessionanswer.ByOrder()).
		All(ctx)
	if err != nil {
		return nil, err
	}

	return answers, nil
}
