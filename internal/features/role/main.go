package role

import (
	"context"
	"errors"
	"template/internal/ent/db"
	"template/internal/ent/permission"
	"template/internal/ent/role"
	"template/internal/ent/user"
	permissionFeat "template/internal/features/permission"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

func CheckUserPermissions(ctx context.Context, userID uuid.UUID, permissions []permissionFeat.Permission) (bool, error) {
	client, err := db.OpenClient()
	if err != nil {
		return false, err
	}

	permissionNames := slice.Map(permissions, func(p permissionFeat.Permission) string {
		return string(p)
	})

	// Get the user's role
	exist, err := client.User.Query().
		Where(user.ID(userID),
			user.HasRolesWith(
				role.HasPermissionsWith(permission.NameIn(permissionNames...)),
			),
		).
		Exist(ctx)

	if err != nil {
		return false, err
	}

	if !exist {
		return false, errors.New("insufficient permissions")
	}

	return true, nil
}
