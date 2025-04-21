package dataloader

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

type LoaderUtils[OriginalType any, ReturnType any] struct {
	Items   []*ReturnType
	Errors  []error
	UUIDs   []uuid.UUID
	IdMap   map[string]int
	ItemMap map[string]*OriginalType
}

func NewLoaderByIds[OriginalType any, ReturnType any](ids []string) *LoaderUtils[OriginalType, ReturnType] {
	lu := &LoaderUtils[OriginalType, ReturnType]{
		Items:   make([]*ReturnType, len(ids)),
		Errors:  make([]error, len(ids)),
		UUIDs:   make([]uuid.UUID, len(ids)),
		IdMap:   make(map[string]int),
		ItemMap: make(map[string]*OriginalType),
	}

	lu.parseUUIDs(ids)

	return lu
}

// parseUUIDs converts a slice of strings into a slice of uuid.UUID.
// It returns an error if any of the strings cannot be parsed as a uuid.
func (lu *LoaderUtils[OriginalType, ReturnType]) parseUUIDs(ids []string) error {
	for i, s := range ids {
		u, err := uuid.Parse(s)
		if err != nil {
			lu.Errors[i] = fmt.Errorf("invalid uuid at index %d: %q: %w", i, s, err)
			lu.UUIDs[i] = uuid.Nil
		} else {
			lu.Errors[i] = nil
			lu.UUIDs[i] = u
		}

		lu.IdMap[s] = i
	}
	return nil
}

// LoadItems queries for original items using queryFunc, then maps each item using transformFunc.
// keyFunc is used to obtain the key from each original item. The method returns the mapped items and errors.
// It panics if the lengths of Items and Errors do not match the expected number of IDs.
func (lu *LoaderUtils[OriginalType, ReturnType]) LoadItems(
	ctx context.Context,
	queryFunc func(ctx context.Context, ids []uuid.UUID) ([]*OriginalType, error),
	keyFunc func(o *OriginalType) string,
	transformFunc func(o *OriginalType) (*ReturnType, error),
) ([]*ReturnType, []error) {
	// Perform the query using the stored UUIDs.
	items, err := queryFunc(ctx, lu.UUIDs)
	if err != nil {
		// Record the error for all indices that had valid IDs.
		for _, i := range lu.IdMap {
			if lu.Errors[i] == nil {
				lu.Errors[i] = err
			}
		}
		return lu.Items, lu.Errors
	}

	// Build a map from each item's key to the original item.
	for _, o := range items {
		key := keyFunc(o)
		lu.ItemMap[key] = o
	}

	// For each input id from the IdMap, get the corresponding original item if available.
	for uid, i := range lu.IdMap {
		if o, ok := lu.ItemMap[uid]; ok {
			transformed, err := transformFunc(o)
			if err != nil {
				lu.Errors[i] = err
				lu.Items[i] = nil
			} else {
				lu.Items[i] = transformed
				lu.Errors[i] = nil
			}
		} else {
			lu.Items[i] = nil
			lu.Errors[i] = fmt.Errorf("item not found for id %s", uid)
		}
	}
	return lu.Items, lu.Errors
}
