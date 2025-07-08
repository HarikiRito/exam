package dataloader

import (
	"context"
	"template/internal/ent"
	"template/internal/features/test"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

func getTests(ctx context.Context, testIDs []uuid.UUID) ([]*model.Test, []error) {
	lu := NewLoaderByIds[ent.Test, model.Test](testIDs)

	lu.LoadItemsOneToOne(ctx, test.GetTestsByIDs, func(id uuid.UUID, items []*ent.Test) *ent.Test {
		return *slice.Find(items, func(item *ent.Test) bool {
			return item.ID == id
		})
	}, func(entTest *ent.Test) (*model.Test, error) {
		return model.ConvertTestToModel(entTest), nil
	})

	return lu.Items, lu.Errors
}

// GetTest returns a single test by ID using the dataloader.
func GetTest(ctx context.Context, testID uuid.UUID) (*model.Test, error) {
	loaders := For(ctx)
	return loaders.TestLoader.Load(ctx, testID)
}
