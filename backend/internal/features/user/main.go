package user

import (
	"context"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/user"
	"template/internal/features/common"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// GetUserByID fetches a user by their UUID string.
func GetUserByID(ctx context.Context, userID uuid.UUID) (*ent.User, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	foundUser, err := client.User.Get(ctx, userID)
	if err != nil {
		if ent.IsNotFound(err) {
			return nil, fmt.Errorf("user not found with ID: %s", userID)
		}
		return nil, err
	}

	return foundUser, nil
}

func GetUsersByIDs(ctx context.Context, userIDs []uuid.UUID) ([]*ent.User, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	return client.User.Query().
		Where(user.IDIn(userIDs...)).
		Select(
			user.FieldID,
			user.FieldEmail,
			user.FieldUsername,
			user.FieldFirstName,
			user.FieldLastName,
			user.FieldIsActive,
		).
		All(ctx)
}

// PaginatedUsers returns a paginated list of users with search functionality for name or email
func PaginatedUsers(ctx context.Context, paginationInput *model.PaginationInput) (*common.PaginatedResult[*ent.User], error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	// Start building the query
	query := client.User.Query()

	// Add search functionality if provided
	if paginationInput != nil && paginationInput.Search != nil && *paginationInput.Search != "" {
		searchTerm := *paginationInput.Search
		query = query.Where(
			user.Or(
				user.UsernameContainsFold(searchTerm),
				user.EmailContainsFold(searchTerm),
				user.FirstNameContainsFold(searchTerm),
				user.LastNameContainsFold(searchTerm),
			),
		)
	}

	// Use fallback values for pagination
	paginationInputFallback := common.FallbackValue(paginationInput, common.DefaultPaginationInput)
	page := common.FallbackValue(paginationInputFallback.Page, common.DefaultPage)
	limit := common.FallbackValue(paginationInputFallback.Limit, common.DefaultLimit)

	// Paginate the results
	return common.EntQueryPaginated(ctx, query, page, limit)
}

// AdminUpdateUser updates a user with admin privileges
