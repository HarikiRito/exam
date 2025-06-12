package test

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/testignorequestion"

	"github.com/google/uuid"
)

// GetTestIgnoreQuestionsByTestIDs fetches test ignore questions for multiple test IDs.
func GetTestIgnoreQuestionsByTestIDs(ctx context.Context, testIDs []uuid.UUID) ([]*ent.TestIgnoreQuestion, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	ignoreQuestions, err := client.TestIgnoreQuestion.Query().
		Where(testignorequestion.TestIDIn(testIDs...)).
		All(ctx)
	if err != nil {
		return nil, err
	}

	return ignoreQuestions, nil
}
