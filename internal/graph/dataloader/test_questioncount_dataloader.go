package dataloader

import (
	"context"
	"template/internal/ent"
	"template/internal/features/test"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

func getTestQuestionCountsByTestIDs(ctx context.Context, testIDs []uuid.UUID) ([][]*model.TestQuestionCount, []error) {
	lu := NewLoaderByIds[ent.TestQuestionCount, model.TestQuestionCount](testIDs)

	items, errs := lu.LoadItemsOneToMany(ctx, test.GetTestQuestionCountsByTestIDs, func(id uuid.UUID, items []*ent.TestQuestionCount) []*ent.TestQuestionCount {
		return slice.Filter(items, func(item *ent.TestQuestionCount) bool {
			return item.TestID == id
		})
	}, func(items []*ent.TestQuestionCount) ([]*model.TestQuestionCount, error) {
		result := slice.Map(items, func(count *ent.TestQuestionCount) *model.TestQuestionCount {
			return model.ConvertTestQuestionCountToModel(count)
		})
		return result, nil
	})

	return items, errs
}

// GetTestQuestionCountsByTestID returns test question counts for a test ID using the dataloader.
func GetTestQuestionCountsByTestID(ctx context.Context, testID uuid.UUID) ([]*model.TestQuestionCount, error) {
	loaders := For(ctx)
	return loaders.TestQuestionCountsByTestLoader.Load(ctx, testID)
}
