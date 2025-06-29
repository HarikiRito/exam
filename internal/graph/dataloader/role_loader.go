package dataloader

import (
	"context"
	"template/internal/features/role"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

func getRolesByUserIDs(ctx context.Context, userIDs []uuid.UUID) ([][]*model.Role, []error) {
	userRolesMap, err := role.GetRolesByUserIDs(ctx, userIDs)

	items := make([][]*model.Role, len(userIDs))
	errs := make([]error, len(userIDs))

	if err != nil {
		for i := range errs {
			errs[i] = err
			items[i] = []*model.Role{}
		}
		return items, errs
	}

	for i, userID := range userIDs {
		if entRoles, exists := userRolesMap[userID]; exists {
			// Convert all roles for this user
			userRoles := make([]*model.Role, len(entRoles))
			for j, entRole := range entRoles {
				userRoles[j] = &model.Role{
					ID:   entRole.ID,
					Name: entRole.Name,
				}
			}
			items[i] = userRoles
		} else {
			// User has no roles - return empty array
			items[i] = []*model.Role{}
		}
	}

	return items, errs
}

// GetRolesByUserID returns roles for a user ID using the dataloader.
func GetRolesByUserID(ctx context.Context, userID uuid.UUID) ([]*model.Role, error) {
	loaders := For(ctx)
	return loaders.RolesByUserLoader.Load(ctx, userID)
}
