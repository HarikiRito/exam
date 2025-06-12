package test

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/testquestioncount"

	"github.com/google/uuid"
)

// GetTestQuestionCountsByTestIDs fetches test question counts for multiple test IDs.
func GetTestQuestionCountsByTestIDs(ctx context.Context, testIDs []uuid.UUID) ([]*ent.TestQuestionCount, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	counts, err := client.TestQuestionCount.Query().
		Where(testquestioncount.TestIDIn(testIDs...)).
		All(ctx)
	if err != nil {
		return nil, err
	}

	return counts, nil
}
