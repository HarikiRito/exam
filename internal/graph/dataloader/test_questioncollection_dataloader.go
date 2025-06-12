package dataloader

import (
	"context"
	"template/internal/ent"
	"template/internal/features/question_collection"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

func getQuestionCollectionsByTestIDs(ctx context.Context, testIDs []uuid.UUID) ([][]*model.QuestionCollection, []error) {
	lu := NewLoaderByIds[ent.QuestionCollection, model.QuestionCollection](testIDs)

	items, errs := lu.LoadItemsOneToMany(ctx, question_collection.GetQuestionCollectionsByTestIDs, func(id uuid.UUID, items []*ent.QuestionCollection) []*ent.QuestionCollection {
		return slice.Filter(items, func(item *ent.QuestionCollection) bool {
			// Check if this question collection is associated with the test
			for _, testEdge := range item.Edges.Test {
				if testEdge.ID == id {
					return true
				}
			}
			return false
		})
	}, func(items []*ent.QuestionCollection) ([]*model.QuestionCollection, error) {
		result := slice.Map(items, func(collection *ent.QuestionCollection) *model.QuestionCollection {
			return model.ConvertQuestionCollectionToModel(collection)
		})
		return result, nil
	})

	return items, errs
}

// GetQuestionCollectionsByTestID returns question collections for a test ID using the dataloader.
func GetQuestionCollectionsByTestID(ctx context.Context, testID uuid.UUID) ([]*model.QuestionCollection, error) {
	loaders := For(ctx)
	return loaders.QuestionCollectionsByTestLoader.Load(ctx, testID)
}
