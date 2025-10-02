package role

import (
	"context"
	"errors"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	entRole "template/internal/ent/role"
	"template/internal/ent/user"
	permissionFeat "template/internal/features/permission"

	"github.com/google/uuid"
)

const (
	RoleOwner = "owner" // Can do anything without restrictions
	RoleAdmin = "admin" // Can do anything except for system level operations like creating/deleting users
	RoleUser  = "user"  // Can only read and write their own data
)

// GetAllRoles fetches all available roles in the system
func GetAllRoles(ctx context.Context) ([]*ent.Role, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	roles, err := client.Role.Query().All(ctx)
	if err != nil {
		return nil, err
	}

	return roles, nil
}

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

// IsAdminOrOwner checks if a user has admin or owner role
func IsAdminOrOwner(ctx context.Context, userID uuid.UUID) (bool, error) {
	client, err := db.OpenClient()
	if err != nil {
		return false, err
	}

	// Get the user with their roles - select only needed fields
	userWithRoles, err := client.User.Query().
		Where(user.IDEQ(userID)).
		WithRoles(func(rq *ent.RoleQuery) {
			rq.Select(entRole.FieldID, entRole.FieldName)
		}).
		Select(user.FieldID).
		Only(ctx)

	if err != nil {
		return false, fmt.Errorf("failed to get user with roles: %w", err)
	}

	// Check if user has admin or owner role
	for _, r := range userWithRoles.Edges.Roles {
		if r.Name == RoleAdmin || r.Name == RoleOwner {
			return true, nil
		}
	}

	return false, nil
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
