package prepare

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/role"
	"template/internal/ent/user"
	"template/internal/seeder"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

// CreateUserWithRole creates a user with a specific role for testing
func CreateUserWithRole(t *testing.T, email, username, roleName string) *ent.User {
	ctx := context.Background()

	client, err := db.OpenClient()
	require.NoError(t, err, "Failed to open database client")

	// Get the role
	targetRole, err := client.Role.Query().
		Where(role.NameEQ(roleName)).
		Only(ctx)
	require.NoError(t, err, "Failed to get role: %s", roleName)

	// Create user with role
	user, err := client.User.Create().
		SetEmail(email).
		SetUsername(username).
		SetPasswordHash("test_password_hash").
		SetIsActive(true).
		AddRoleIDs(targetRole.ID).
		Save(ctx)
	require.NoError(t, err, "Failed to create user with role")

	return user
}

// CreateOwnerUser creates a user with owner role for testing
func CreateOwnerUser(t *testing.T, email, username string) *ent.User {
	return CreateUserWithRole(t, email, username, seeder.RoleOwner)
}

// CreateAdminUser creates a user with admin role for testing
func CreateAdminUser(t *testing.T, email, username string) *ent.User {
	return CreateUserWithRole(t, email, username, seeder.RoleAdmin)
}

// CreateRegularUser creates a user with user role for testing
func CreateRegularUser(t *testing.T, email, username string) *ent.User {
	return CreateUserWithRole(t, email, username, seeder.RoleUser)
}

// CreateUserWithMultipleRoles creates a user with multiple roles for testing
func CreateUserWithMultipleRoles(t *testing.T, email, username string, roleNames []string) *ent.User {
	ctx := context.Background()

	client, err := db.OpenClient()
	require.NoError(t, err, "Failed to open database client")

	// Get all roles
	roles, err := client.Role.Query().
		Where(role.NameIn(roleNames...)).
		All(ctx)
	require.NoError(t, err, "Failed to get roles")
	require.Len(t, roles, len(roleNames), "Not all requested roles found")

	// Extract role IDs
	roleIDs := make([]uuid.UUID, len(roles))
	for i, r := range roles {
		roleIDs[i] = r.ID
	}

	// Create user with multiple roles
	user, err := client.User.Create().
		SetEmail(email).
		SetUsername(username).
		SetPasswordHash("test_password_hash").
		SetIsActive(true).
		AddRoleIDs(roleIDs...).
		Save(ctx)
	require.NoError(t, err, "Failed to create user with multiple roles")

	return user
}

// CreateUserWithoutRole creates a user without any roles for testing
func CreateUserWithoutRole(t *testing.T, email, username string) *ent.User {
	ctx := context.Background()

	client, err := db.OpenClient()
	require.NoError(t, err, "Failed to open database client")

	// Create user without roles
	user, err := client.User.Create().
		SetEmail(email).
		SetUsername(username).
		SetPasswordHash("test_password_hash").
		SetIsActive(true).
		Save(ctx)
	require.NoError(t, err, "Failed to create user without roles")

	return user
}

// SetupRoleSystem seeds the permission and role system for testing
func SetupRoleSystem(t *testing.T) {
	ctx := context.Background()

	err := seeder.SeedPermissions(ctx)
	require.NoError(t, err, "Failed to seed permissions")

	err = seeder.SeedRoles(ctx)
	require.NoError(t, err, "Failed to seed roles")
}

// AssignRoleToUser assigns a role to an existing user
func AssignRoleToUser(t *testing.T, userID uuid.UUID, roleName string) {
	ctx := context.Background()

	client, err := db.OpenClient()
	require.NoError(t, err, "Failed to open database client")

	// Get the role
	targetRole, err := client.Role.Query().
		Where(role.NameEQ(roleName)).
		Only(ctx)
	require.NoError(t, err, "Failed to get role: %s", roleName)

	// Update user to add role
	_, err = client.User.UpdateOneID(userID).
		AddRoleIDs(targetRole.ID).
		Save(ctx)
	require.NoError(t, err, "Failed to assign role to user")
}

// RemoveRoleFromUser removes a role from an existing user
func RemoveRoleFromUser(t *testing.T, userID uuid.UUID, roleName string) {
	ctx := context.Background()

	client, err := db.OpenClient()
	require.NoError(t, err, "Failed to open database client")

	// Get the role
	targetRole, err := client.Role.Query().
		Where(role.NameEQ(roleName)).
		Only(ctx)
	require.NoError(t, err, "Failed to get role: %s", roleName)

	// Update user to remove role
	_, err = client.User.UpdateOneID(userID).
		RemoveRoleIDs(targetRole.ID).
		Save(ctx)
	require.NoError(t, err, "Failed to remove role from user")
}

// GetUserWithRoles retrieves a user with their roles loaded
func GetUserWithRoles(t *testing.T, userID uuid.UUID) *ent.User {
	ctx := context.Background()

	client, err := db.OpenClient()
	require.NoError(t, err, "Failed to open database client")

	userEntity, err := client.User.Query().
		Where(user.IDEQ(userID)).
		WithRoles().
		Only(ctx)
	require.NoError(t, err, "Failed to get user with roles")

	return userEntity
}

// GetRoleID gets a role ID by name for testing
func GetRoleID(t *testing.T, roleName string) uuid.UUID {
	ctx := context.Background()

	client, err := db.OpenClient()
	require.NoError(t, err, "Failed to open database client")

	// Get the role
	targetRole, err := client.Role.Query().
		Where(role.NameEQ(roleName)).
		Only(ctx)
	require.NoError(t, err, "Failed to get role: %s", roleName)

	return targetRole.ID
}
