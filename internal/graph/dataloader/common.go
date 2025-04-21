package dataloader

import (
	"fmt"

	"github.com/google/uuid"
)

type LoaderUtils[T any] struct {
	Items  []*T
	Errors []error
	UUIDs  []uuid.UUID
	IdMap  map[string]int
}

func NewLoaderByIds[T any](ids []string) *LoaderUtils[T] {
	lu := &LoaderUtils[T]{
		Items:  make([]*T, len(ids)),
		Errors: make([]error, len(ids)),
		UUIDs:  make([]uuid.UUID, len(ids)),
		IdMap:  make(map[string]int),
	}

	return lu
}

// parseUUIDs converts a slice of strings into a slice of uuid.UUID.
// It returns an error if any of the strings cannot be parsed as a uuid.
func (lu *LoaderUtils[T]) parseUUIDs(ids []string) error {

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
