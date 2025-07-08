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

func NewLoaderByIds[OriginalType any, ReturnType any](ids []uuid.UUID) *LoaderUtils[OriginalType, ReturnType] {
	lu := &LoaderUtils[OriginalType, ReturnType]{
		Items:   make([]*ReturnType, len(ids)),
		Errors:  make([]error, len(ids)),
		UUIDs:   make([]uuid.UUID, len(ids)),
		IdMap:   make(map[string]int),
		ItemMap: make(map[string]*OriginalType),
	}

	lu.mapUUIDs(ids)

	return lu
}

// mapUUIDs initializes the UUIDs, Errors, and IdMap fields based on the provided slice of uuid.UUID.
func (lu *LoaderUtils[OriginalType, ReturnType]) mapUUIDs(ids []uuid.UUID) error {
	for i, s := range ids {
		lu.Errors[i] = nil
		lu.UUIDs[i] = s
		lu.IdMap[s.String()] = i
	}
	return nil
}

// LoadItemsOneToMany generates a list of items based on the query function, key function, and transform function.
// It returns a list of items and a list of errors.
// Each key will contain a slice of items that have the same key.
func (lu *LoaderUtils[OriginalType, ReturnType]) LoadItemsOneToMany(
	ctx context.Context,
	queryFunc func(ctx context.Context, ids []uuid.UUID) ([]*OriginalType, error),
	itemFunc func(id uuid.UUID, items []*OriginalType) []*OriginalType,
	transformFunc func(o []*OriginalType) ([]*ReturnType, error),
) ([][]*ReturnType, []error) {
	// Perform the query using the stored UUIDs.
	items, err := queryFunc(ctx, lu.UUIDs)
	if err != nil {
		// Record the error for all indices that had valid IDs.
		for _, i := range lu.IdMap {
			if lu.Errors[i] == nil {
				lu.Errors[i] = err
			}
		}
		return [][]*ReturnType{}, lu.Errors
	}
	itemMap := make(map[string][]*OriginalType)
	// Build a map from each item's key to the original item.
	for _, uid := range lu.UUIDs {
		o := itemFunc(uid, items)
		itemMap[uid.String()] = o
	}

	itemsList := make([][]*ReturnType, len(lu.UUIDs))
	errors := make([]error, len(lu.UUIDs))
	// For each input id from the IdMap, get the corresponding original item if available.
	for uid, i := range lu.IdMap {
		if o, ok := itemMap[uid]; ok {
			transformed, err := transformFunc(o)
			if err != nil {
				errors[i] = err
				itemsList[i] = nil
			} else {
				itemsList[i] = transformed
				errors[i] = nil
			}
		} else {
			itemsList[i] = nil
			errors[i] = fmt.Errorf("item not found for id %s", uid)
		}
	}
	return itemsList, errors
}

func (lu *LoaderUtils[OriginalType, ReturnType]) LoadItemsOneToOne(
	ctx context.Context,
	queryFunc func(ctx context.Context, ids []uuid.UUID) ([]*OriginalType, error),
	itemFunc func(id uuid.UUID, items []*OriginalType) *OriginalType,
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
	for _, uid := range lu.UUIDs {
		o := itemFunc(uid, items)
		lu.ItemMap[uid.String()] = o
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
