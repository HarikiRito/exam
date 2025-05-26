package question_collection

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/questioncollection"

	"github.com/google/uuid"
)

// GetQuestionCollectionByID fetches a question collection by its ID, only if the user is the creator.
func GetQuestionCollectionByID(ctx context.Context, userId uuid.UUID, collectionId uuid.UUID) (*ent.QuestionCollection, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	collection, err := client.QuestionCollection.Query().
		Where(questioncollection.ID(collectionId), questioncollection.CreatorID(userId)).
		First(ctx)
	if err != nil {
		return nil, err
	}

	return collection, nil
}
