package role

import (
	"context"
	"errors"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/user"
	permissionFeat "template/internal/features/permission"

	"github.com/google/uuid"
)

func CheckUserPermissions(ctx context.Context, userID uuid.UUID, permissions []permissionFeat.Permission) error {
	// Handle empty permissions list - always allow
	if len(permissions) == 0 {
		return nil
	}

	client, err := db.OpenClient()
	if err != nil {
		return err
	}

	// Get the user with their roles and permissions
	userWithRoles, err := client.User.Query().
		Where(user.IDEQ(userID)).
		WithRoles(func(rq *ent.RoleQuery) {
			rq.WithPermissions()
		}).
		Only(ctx)

	if err != nil {
		return fmt.Errorf("failed to get user with roles: %w", err)
	}

	// Collect all permissions the user has across all roles
	userPermissions := make(map[string]bool)
	for _, role := range userWithRoles.Edges.Roles {
		for _, perm := range role.Edges.Permissions {
			userPermissions[perm.Name] = true
		}
	}

	// Check if user has all required permissions
	for _, requiredPerm := range permissions {
		if !userPermissions[string(requiredPerm)] {
			return errors.New("insufficient permissions")
		}
	}

	return nil
}

// GetRolesByUserIDs fetches roles for multiple users and returns a map with user ID as key and roles array as value
func GetRolesByUserIDs(ctx context.Context, userIDs []uuid.UUID) (map[uuid.UUID][]*ent.Role, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	// Get users with their roles
	users, err := client.User.Query().
		Where(user.IDIn(userIDs...)).
		WithRoles().
		All(ctx)
	if err != nil {
		return nil, err
	}

	// Create map with user ID as key and roles array as value
	userRolesMap := make(map[uuid.UUID][]*ent.Role)
	for _, user := range users {
		// Add all roles for this user
		userRolesMap[user.ID] = user.Edges.Roles
	}

	return userRolesMap, nil
}
