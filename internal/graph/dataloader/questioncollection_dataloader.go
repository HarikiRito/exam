package dataloader

import (
	"context"
	"template/internal/ent"
	"template/internal/features/question_collection"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

func getQuestionCollections(ctx context.Context, questionIDs []uuid.UUID) ([]*model.QuestionCollection, []error) {
	lu := NewLoaderByIds[ent.QuestionCollection, model.QuestionCollection](questionIDs)

	lu.LoadItems(ctx, question_collection.GetQuestionCollectionByQuestionIDs, func(item *ent.QuestionCollection) string {
		return item.ID.String()
	}, func(item *ent.QuestionCollection) (*model.QuestionCollection, error) {
		return &model.QuestionCollection{
			ID:          item.ID,
			Title:       item.Title,
			Description: item.Description,
			CreatedAt:   item.CreatedAt,
			UpdatedAt:   item.UpdatedAt,
		}, nil
	})

	return lu.Items, lu.Errors
}

// GetQuestionCollection returns a question collection for a question ID using the dataloader.
func GetQuestionCollection(ctx context.Context, questionID uuid.UUID) (*model.QuestionCollection, error) {
	loaders := For(ctx)
	return loaders.QuestionCollectionLoader.Load(ctx, questionID)
}
