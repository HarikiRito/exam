package test_session

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/testsessionanswer"

	"github.com/google/uuid"
)

func GetSessionAnswers(ctx context.Context, sessionID uuid.UUID) ([]*ent.TestSessionAnswer, error) {
	dbClient, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	answers, err := dbClient.TestSessionAnswer.Query().Where(testsessionanswer.SessionID(sessionID)).All(ctx)
	if err != nil {
		return nil, err
	}

	return answers, nil
}
