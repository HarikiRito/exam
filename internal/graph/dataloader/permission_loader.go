package dataloader

import (
	"context"
	"template/internal/features/permission"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

func getPermissionsByUserIDs(ctx context.Context, userIDs []uuid.UUID) ([][]*model.Permission, []error) {
	userPermissionsMap, err := permission.GetPermissionsByUserIDs(ctx, userIDs)

	items := make([][]*model.Permission, len(userIDs))
	errs := make([]error, len(userIDs))

	if err != nil {
		for i := range errs {
			errs[i] = err
			items[i] = []*model.Permission{}
		}
		return items, errs
	}

	for i, userID := range userIDs {
		if entPermissions, exists := userPermissionsMap[userID]; exists {
			// Convert all permissions for this user
			userPermissions := make([]*model.Permission, len(entPermissions))
			for j, entPermission := range entPermissions {
				userPermissions[j] = model.ConvertPermissionToModel(entPermission)
			}
			items[i] = userPermissions
		} else {
			// User has no permissions - return empty array
			items[i] = []*model.Permission{}
		}
	}

	return items, errs
}

// GetPermissionsByUserID returns permissions for a user ID using the dataloader.
func GetPermissionsByUserID(ctx context.Context, userID uuid.UUID) ([]*model.Permission, error) {
	loaders := For(ctx)
	return loaders.PermissionsByUserLoader.Load(ctx, userID)
}
