package question_collection

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/question"
	"template/internal/ent/questioncollection"

	"github.com/google/uuid"
)

// GetQuestionCollectionByQuestionIDs fetches question collections for multiple question IDs.
func GetQuestionCollectionByQuestionIDs(ctx context.Context, questionIDs []uuid.UUID) ([]*ent.QuestionCollection, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	collections, err := client.QuestionCollection.Query().
		Where(questioncollection.HasQuestionsWith(question.IDIn(questionIDs...))).
		All(ctx)
	if err != nil {
		return nil, err
	}

	return collections, nil
}
