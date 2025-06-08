package question

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/question"

	"github.com/google/uuid"
)

// GetQuestionsByCollectionIDs fetches questions for multiple collection IDs.
func GetQuestionsByCollectionIDs(ctx context.Context, collectionIDs []uuid.UUID) ([]*ent.Question, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	questions, err := client.Question.Query().
		Where(question.CollectionIDIn(collectionIDs...)).
		All(ctx)
	if err != nil {
		return nil, err
	}

	return questions, nil
}
