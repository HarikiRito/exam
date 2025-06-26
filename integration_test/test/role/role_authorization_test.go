package role

import (
	"context"
	"template/integration_test/prepare"
	"template/internal/features/permission"
	"template/internal/features/role"
	"template/internal/seeder"
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestRoleBasedAuthorization tests real-world authorization scenarios
func TestRoleBasedAuthorization(t *testing.T) {
	// Setup test database and role system
	prepare.SetupTestDb(t)
	prepare.SetupRoleSystem(t)

	ctx := context.Background()

	t.Run("Regular User Has Basic Access", func(t *testing.T) {
		// Create regular user
		regularUser := prepare.CreateRegularUser(t, "user_test@example.com", "user_test")

		// User should be able to read and update sessions
		err := role.CheckUserPermissions(ctx, regularUser.ID, []permission.Permission{
			permission.PermissionSessionRead,
			permission.PermissionSessionUpdate,
		})
		assert.NoError(t, err, "User should be able to read and update sessions")

		// User should NOT be able to create users
		err = role.CheckUserPermissions(ctx, regularUser.ID, []permission.Permission{
			permission.PermissionUserCreate,
		})
		assert.Error(t, err, "User should NOT be able to create users")

		// User should NOT be able to create sessions
		err = role.CheckUserPermissions(ctx, regularUser.ID, []permission.Permission{
			permission.PermissionSessionCreate,
		})
		assert.Error(t, err, "User should NOT be able to create sessions")

		// User should NOT be able to manage collections
		err = role.CheckUserPermissions(ctx, regularUser.ID, []permission.Permission{
			permission.CollectionCreate,
		})
		assert.Error(t, err, "User should NOT be able to create collections")

		// User should NOT be able to manage tests
		err = role.CheckUserPermissions(ctx, regularUser.ID, []permission.Permission{
			permission.TestCreate,
		})
		assert.Error(t, err, "User should NOT be able to create tests")
	})

	t.Run("User Without Roles Has No Access", func(t *testing.T) {
		// Create user without any roles
		noRoleUser := prepare.CreateUserWithoutRole(t, "norole_test@example.com", "norole_test")

		// User should NOT have any permissions
		basicPermissions := []permission.Permission{
			permission.PermissionSessionRead,
			permission.PermissionUserRead,
			permission.CollectionRead,
			permission.TestRead,
		}

		for _, perm := range basicPermissions {
			err := role.CheckUserPermissions(ctx, noRoleUser.ID, []permission.Permission{perm})
			assert.Error(t, err, "User without roles should NOT have permission: %s", perm)
		}
	})

	t.Run("Multi-Role User Has Combined Permissions", func(t *testing.T) {
		// Create user with both admin and user roles
		multiRoleUser := prepare.CreateUserWithMultipleRoles(t, "multirole_test@example.com", "multirole_test", []string{
			seeder.RoleAdmin,
			seeder.RoleUser,
		})

		// User should have permissions from both roles
		adminPermissions := []permission.Permission{
			permission.PermissionUserCreate,
			permission.PermissionUserRead,
		}

		userPermissions := []permission.Permission{
			permission.PermissionSessionRead,
			permission.PermissionSessionUpdate,
		}

		// Check admin permissions
		err := role.CheckUserPermissions(ctx, multiRoleUser.ID, adminPermissions)
		assert.NoError(t, err, "Multi-role user should have admin permissions")

		// Check user permissions
		err = role.CheckUserPermissions(ctx, multiRoleUser.ID, userPermissions)
		assert.NoError(t, err, "Multi-role user should have user permissions")

		// Check combined permissions
		combinedPermissions := append(adminPermissions, userPermissions...)
		err = role.CheckUserPermissions(ctx, multiRoleUser.ID, combinedPermissions)
		assert.NoError(t, err, "Multi-role user should have combined permissions")
	})
}
