package common

import (
	"context"
	"math"
	"template/internal/graph/model"
)

var DefaultLimit = 20
var DefaultPage = 1
var DefaultPaginationInput = model.PaginationInput{
	Page:   &DefaultPage,
	Limit:  &DefaultLimit,
	Search: nil,
}

type query[T any, Q any] interface {
	Limit(int) Q
	Offset(int) Q
	Count(context.Context) (int, error)
	All(context.Context) ([]T, error)
}

type PaginatedResult[T any] struct {
	CurrentPage int
	TotalPages  int
	TotalItems  int
	HasNextPage bool
	HasPrevPage bool
	Items       []T
}

// EntQueryPaginated paginates any ent query supporting Limit, Offset, Count, and All methods.
func EntQueryPaginated[T any, Q query[T, Q]](ctx context.Context, query Q, page, limit int) (*PaginatedResult[T], error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = DefaultLimit
	}
	offset := (page - 1) * limit
	totalItems, err := query.Count(ctx)
	if err != nil {
		return nil, err
	}
	items, err := query.Limit(limit).Offset(offset).All(ctx)
	if err != nil {
		return nil, err
	}
	totalPages := int(math.Ceil(float64(totalItems) / float64(limit)))
	if totalPages == 0 {
		totalPages = 1
	}
	return &PaginatedResult[T]{
		CurrentPage: page,
		TotalPages:  totalPages,
		TotalItems:  totalItems,
		HasNextPage: page < totalPages,
		HasPrevPage: page > 1,
		Items:       items,
	}, nil
}
