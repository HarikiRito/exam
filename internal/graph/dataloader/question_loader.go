package dataloader

import (
	"context"
	"template/internal/ent"
	"template/internal/features/question"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

func getQuestionsByCollectionIDs(ctx context.Context, collectionIDs []uuid.UUID) ([][]*model.Question, []error) {
	lu := NewLoaderByIds[ent.Question, model.Question](collectionIDs)

	items, errs := lu.LoadItemsOneToMany(ctx, question.GetQuestionsByCollectionIDs, func(id uuid.UUID, items []*ent.Question) []*ent.Question {
		return slice.Filter(items, func(item *ent.Question) bool {
			return item.CollectionID == id
		})
	}, func(items []*ent.Question) ([]*model.Question, error) {
		result := slice.Map(items, func(question *ent.Question) *model.Question {
			return model.ConvertQuestionToModel(question)
		})
		return result, nil
	})

	return items, errs
}

// GetQuestionsByCollectionID returns questions for a collection ID using the dataloader.
func GetQuestionsByCollectionID(ctx context.Context, collectionID uuid.UUID) ([]*model.Question, error) {
	loaders := For(ctx)
	return loaders.QuestionsByCollectionLoader.Load(ctx, collectionID)
}
