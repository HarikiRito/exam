package dataloader

import (
	"context"
	"template/internal/ent"
	"template/internal/features/test"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

func getTestIgnoreQuestionsByTestIDs(ctx context.Context, testIDs []uuid.UUID) ([][]*model.TestIgnoreQuestion, []error) {
	lu := NewLoaderByIds[ent.TestIgnoreQuestion, model.TestIgnoreQuestion](testIDs)

	items, errs := lu.LoadItemsOneToMany(ctx, test.GetTestIgnoreQuestionsByTestIDs, func(id uuid.UUID, items []*ent.TestIgnoreQuestion) []*ent.TestIgnoreQuestion {
		return slice.Filter(items, func(item *ent.TestIgnoreQuestion) bool {
			return item.TestID == id
		})
	}, func(items []*ent.TestIgnoreQuestion) ([]*model.TestIgnoreQuestion, error) {
		result := slice.Map(items, func(ignoreQuestion *ent.TestIgnoreQuestion) *model.TestIgnoreQuestion {
			return model.ConvertTestIgnoreQuestionToModel(ignoreQuestion)
		})
		return result, nil
	})

	return items, errs
}

// GetTestIgnoreQuestionsByTestID returns test ignore questions for a test ID using the dataloader.
func GetTestIgnoreQuestionsByTestID(ctx context.Context, testID uuid.UUID) ([]*model.TestIgnoreQuestion, error) {
	loaders := For(ctx)
	return loaders.TestIgnoreQuestionsByTestLoader.Load(ctx, testID)
}
