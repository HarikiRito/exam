package dataloader

import (
	"context"
	"template/internal/ent"
	"template/internal/features/question"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

func getQuestions(ctx context.Context, questionIDs []uuid.UUID) ([]*model.Question, []error) {
	lu := NewLoaderByIds[ent.Question, model.Question](questionIDs)

	lu.LoadItemsOneToOne(ctx, question.GetByIDs, func(id uuid.UUID, items []*ent.Question) *ent.Question {
		return *slice.Find(items, func(item *ent.Question) bool {
			return item.ID == id
		})
	}, func(entQuestion *ent.Question) (*model.Question, error) {
		return model.ConvertQuestionToModel(entQuestion), nil
	})

	return lu.Items, lu.Errors
}

// GetQuestion returns a single question by ID using the dataloader.
func GetQuestion(ctx context.Context, questionID uuid.UUID) (*model.Question, error) {
	loaders := For(ctx)
	return loaders.QuestionLoader.Load(ctx, questionID)
}
