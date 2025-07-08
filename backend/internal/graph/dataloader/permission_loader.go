package dataloader

import (
	"context"
	"template/internal/features/permission"

	"github.com/google/uuid"
)

func getPermissionsByUserIDs(ctx context.Context, userIDs []uuid.UUID) ([][]permission.Permission, []error) {
	userPermissionsMap, err := permission.GetPermissionsByUserIDs(ctx, userIDs)

	items := make([][]permission.Permission, len(userIDs))
	errs := make([]error, len(userIDs))

	if err != nil {
		for i := range errs {
			errs[i] = err
			items[i] = []permission.Permission{}
		}
		return items, errs
	}

	for i, userID := range userIDs {
		if permissions, exists := userPermissionsMap[userID]; exists {
			items[i] = permissions
		} else {
			items[i] = []permission.Permission{}
		}
	}

	return items, errs
}

// GetPermissionsByUserID returns permissions for a user ID using the dataloader.
func GetPermissionsByUserID(ctx context.Context, userID uuid.UUID) ([]permission.Permission, error) {
	loaders := For(ctx)
	return loaders.PermissionsByUserLoader.Load(ctx, userID)
}
