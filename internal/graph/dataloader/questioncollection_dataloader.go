package dataloader

import (
	"context"
	"template/internal/ent"
	"template/internal/features/question_collection"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

func getQuestionCollectionsByQuestionIDs(ctx context.Context, questionIDs []uuid.UUID) ([]*model.QuestionCollection, []error) {
	lu := NewLoaderByIds[ent.QuestionCollection, model.QuestionCollection](questionIDs)

	lu.LoadItemsOneToOne(ctx, question_collection.GetQuestionCollectionByQuestionIDs, func(id uuid.UUID, items []*ent.QuestionCollection) *ent.QuestionCollection {
		for _, item := range items {
			questions := item.Edges.Questions
			question := slice.Find(questions, func(question *ent.Question) bool {
				return question.ID == id
			})
			if question != nil {
				return item
			}
		}
		return nil
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
