package role

import (
	"context"
	"errors"
	"fmt"
	"template/internal/ent/db"
	"template/internal/ent/permission"
	"template/internal/ent/predicate"
	"template/internal/ent/role"
	"template/internal/ent/user"
	permissionFeat "template/internal/features/permission"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

func CheckUserPermissions(ctx context.Context, userID uuid.UUID, permissions []permissionFeat.Permission) error {
	client, err := db.OpenClient()
	if err != nil {
		return err
	}

	permissionPredicates := slice.Map(permissions, func(p permissionFeat.Permission) predicate.Permission {
		return permission.NameEQ(string(p))
	})

	// Get the user's role
	exist, err := client.User.Query().
		Where(user.ID(userID),
			user.HasRolesWith(
				role.HasPermissionsWith(
					permissionPredicates...,
				),
			),
		).
		Exist(ctx)

	if err != nil {
		return fmt.Errorf("failed to check user permissions: %w", err)
	}

	if !exist {
		return errors.New("insufficient permissions")
	}

	return nil
}
