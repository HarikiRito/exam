package permission

import (
	"context"
	"fmt"
	"sort"
	"template/integration_test/prepare"
	"template/internal/features/permission"
	"template/internal/seeder"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetPermissionsByUserIDs(t *testing.T) {
	// Setup test database and role system
	prepare.SetupTestDb(t)
	prepare.SetupRoleSystem(t)

	ctx := context.Background()

	t.Run("Owner_Should_Have_All_Permissions", func(t *testing.T) {
		// Create owner user
		ownerUser := prepare.CreateOwnerUser(t, "owner_test@example.com", "owner_test")

		// Test with single user
		result, err := permission.GetPermissionsByUserIDs(ctx, []uuid.UUID{ownerUser.ID})
		require.NoError(t, err, "Should successfully get permissions for owner")
		require.Contains(t, result, ownerUser.ID, "Result should contain owner user ID")

		ownerPermissions := result[ownerUser.ID]

		// Owner should have all permissions
		expectedPermissions := permission.AllPermissions
		require.Len(t, ownerPermissions, len(expectedPermissions),
			"Owner should have all %d permissions", len(expectedPermissions))

		// Convert to string slices for comparison
		ownerPermStr := make([]string, len(ownerPermissions))
		for i, p := range ownerPermissions {
			ownerPermStr[i] = string(p)
		}

		expectedPermStr := make([]string, len(expectedPermissions))
		for i, p := range expectedPermissions {
			expectedPermStr[i] = string(p)
		}

		// Sort both slices for reliable comparison
		sort.Strings(ownerPermStr)
		sort.Strings(expectedPermStr)

		assert.Equal(t, expectedPermStr, ownerPermStr,
			"Owner should have exactly all defined permissions")

		// Verify specific critical permissions are present
		criticalPermissions := []permission.Permission{
			permission.PermissionUserCreate,
			permission.PermissionUserRead,
			permission.TestCreate,
			permission.TestRead,
			permission.TestUpdate,
			permission.TestDelete,
			permission.CollectionCreate,
			permission.CollectionRead,
			permission.CollectionUpdate,
			permission.CollectionDelete,
		}

		for _, criticalPerm := range criticalPermissions {
			assert.Contains(t, ownerPermissions, criticalPerm,
				"Owner should have critical permission: %s", criticalPerm)
		}
	})

	t.Run("Admin_Should_Have_Admin_Permissions", func(t *testing.T) {
		// Create admin user
		adminUser := prepare.CreateAdminUser(t, "admin_test@example.com", "admin_test")

		result, err := permission.GetPermissionsByUserIDs(ctx, []uuid.UUID{adminUser.ID})
		require.NoError(t, err, "Should successfully get permissions for admin")
		require.Contains(t, result, adminUser.ID, "Result should contain admin user ID")

		adminPermissions := result[adminUser.ID]

		// Admin should have admin permissions but not all permissions
		expectedAdminPermissions := []permission.Permission{
			permission.PermissionUserCreate,
			permission.PermissionUserRead,
			permission.PermissionSessionCreate,
			permission.PermissionSessionRead,
			permission.PermissionSessionUpdate,
			permission.PermissionSessionDelete,
			permission.CollectionCreate,
			permission.CollectionRead,
			permission.CollectionUpdate,
			permission.CollectionDelete,
			permission.TestCreate,
			permission.TestRead,
			permission.TestUpdate,
			permission.TestDelete,
			permission.CourseCreate,
			permission.CourseRead,
			permission.CourseUpdate,
			permission.CourseDelete,
			permission.CourseSectionCreate,
			permission.CourseSectionRead,
			permission.CourseSectionUpdate,
			permission.CourseSectionDelete,
			permission.QuestionCreate,
			permission.QuestionRead,
			permission.QuestionUpdate,
			permission.QuestionDelete,
			permission.QuestionOptionCreate,
			permission.QuestionOptionRead,
			permission.QuestionOptionUpdate,
			permission.QuestionOptionDelete,
			permission.VideoCreate,
			permission.VideoRead,
			permission.VideoUpdate,
			permission.VideoDelete,
			permission.MediaCreate,
			permission.MediaRead,
			permission.MediaUpdate,
			permission.MediaDelete,
		}

		// Verify admin has expected permissions
		for _, expectedPerm := range expectedAdminPermissions {
			assert.Contains(t, adminPermissions, expectedPerm,
				"Admin should have permission: %s", expectedPerm)
		}

		// In current system, admin has all permissions (same as owner)
		assert.Equal(t, len(permission.AllPermissions), len(adminPermissions),
			"Admin should have all permissions like owner in current system")
	})

	t.Run("Regular_User_Should_Have_Limited_Permissions", func(t *testing.T) {
		// Create regular user
		regularUser := prepare.CreateRegularUser(t, "user_test@example.com", "user_test")

		result, err := permission.GetPermissionsByUserIDs(ctx, []uuid.UUID{regularUser.ID})
		require.NoError(t, err, "Should successfully get permissions for regular user")
		require.Contains(t, result, regularUser.ID, "Result should contain regular user ID")

		userPermissions := result[regularUser.ID]

		// Regular user should only have basic permissions
		expectedUserPermissions := []permission.Permission{
			permission.PermissionSessionRead,
			permission.PermissionSessionUpdate,
		}

		assert.Len(t, userPermissions, len(expectedUserPermissions),
			"Regular user should have exactly %d permissions", len(expectedUserPermissions))

		for _, expectedPerm := range expectedUserPermissions {
			assert.Contains(t, userPermissions, expectedPerm,
				"Regular user should have permission: %s", expectedPerm)
		}

		// Regular user should NOT have admin permissions
		adminOnlyPermissions := []permission.Permission{
			permission.PermissionUserCreate,
			permission.TestCreate,
			permission.CollectionCreate,
			permission.CourseCreate,
		}

		for _, adminPerm := range adminOnlyPermissions {
			assert.NotContains(t, userPermissions, adminPerm,
				"Regular user should NOT have admin permission: %s", adminPerm)
		}
	})

	t.Run("Multiple_Users_Different_Roles", func(t *testing.T) {
		// Create users with different roles
		ownerUser := prepare.CreateOwnerUser(t, "multi_owner@example.com", "multi_owner")
		adminUser := prepare.CreateAdminUser(t, "multi_admin@example.com", "multi_admin")
		regularUser := prepare.CreateRegularUser(t, "multi_user@example.com", "multi_user")

		userIDs := []uuid.UUID{ownerUser.ID, adminUser.ID, regularUser.ID}

		result, err := permission.GetPermissionsByUserIDs(ctx, userIDs)
		require.NoError(t, err, "Should successfully get permissions for multiple users")

		// Should have results for all users
		assert.Len(t, result, 3, "Should have results for all 3 users")
		assert.Contains(t, result, ownerUser.ID, "Should contain owner user")
		assert.Contains(t, result, adminUser.ID, "Should contain admin user")
		assert.Contains(t, result, regularUser.ID, "Should contain regular user")

		// Verify permission counts are different
		ownerPermissions := result[ownerUser.ID]
		adminPermissions := result[adminUser.ID]
		userPermissions := result[regularUser.ID]

		// In current system, owner and admin have same permissions
		assert.Equal(t, len(ownerPermissions), len(adminPermissions),
			"Owner and admin should have same permissions in current system")
		assert.Greater(t, len(adminPermissions), len(userPermissions),
			"Admin should have more permissions than regular user")
		assert.Equal(t, len(permission.AllPermissions), len(ownerPermissions),
			"Owner should have all permissions")
	})

	t.Run("User_With_Multiple_Roles", func(t *testing.T) {
		// Create user with multiple roles
		multiRoleUser := prepare.CreateUserWithMultipleRoles(t,
			"multirole@example.com", "multirole",
			[]string{seeder.RoleAdmin, seeder.RoleUser})

		result, err := permission.GetPermissionsByUserIDs(ctx, []uuid.UUID{multiRoleUser.ID})
		require.NoError(t, err, "Should successfully get permissions for multi-role user")
		require.Contains(t, result, multiRoleUser.ID, "Result should contain multi-role user ID")

		multiRolePermissions := result[multiRoleUser.ID]

		// Should have permissions from both admin and user roles
		// Since admin already includes user permissions, should be same as admin
		adminPermissions := []permission.Permission{
			permission.PermissionUserCreate,
			permission.PermissionUserRead,
			permission.PermissionSessionRead,
			permission.PermissionSessionUpdate,
			permission.CollectionCreate,
			permission.TestCreate,
		}

		userPermissions := []permission.Permission{
			permission.PermissionSessionRead,
			permission.PermissionSessionUpdate,
		}

		// Should have all admin permissions
		for _, adminPerm := range adminPermissions {
			assert.Contains(t, multiRolePermissions, adminPerm,
				"Multi-role user should have admin permission: %s", adminPerm)
		}

		// Should have all user permissions
		for _, userPerm := range userPermissions {
			assert.Contains(t, multiRolePermissions, userPerm,
				"Multi-role user should have user permission: %s", userPerm)
		}

		// Permissions should be unique (no duplicates)
		permissionMap := make(map[permission.Permission]bool)
		for _, perm := range multiRolePermissions {
			assert.False(t, permissionMap[perm],
				"Permission should not be duplicated: %s", perm)
			permissionMap[perm] = true
		}
	})

	t.Run("User_Without_Roles", func(t *testing.T) {
		// Create user without any roles
		noRoleUser := prepare.CreateUserWithoutRole(t, "norole@example.com", "norole")

		result, err := permission.GetPermissionsByUserIDs(ctx, []uuid.UUID{noRoleUser.ID})
		require.NoError(t, err, "Should successfully get permissions for user without roles")
		require.Contains(t, result, noRoleUser.ID, "Result should contain no-role user ID")

		noRolePermissions := result[noRoleUser.ID]
		assert.Empty(t, noRolePermissions, "User without roles should have no permissions")
	})

	t.Run("Empty_User_IDs_List", func(t *testing.T) {
		result, err := permission.GetPermissionsByUserIDs(ctx, []uuid.UUID{})
		require.NoError(t, err, "Should handle empty user IDs list")
		assert.Empty(t, result, "Result should be empty for empty input")
	})

	t.Run("Nonexistent_User_ID", func(t *testing.T) {
		nonexistentID := uuid.New()

		result, err := permission.GetPermissionsByUserIDs(ctx, []uuid.UUID{nonexistentID})
		require.NoError(t, err, "Should handle nonexistent user ID gracefully")
		assert.Empty(t, result, "Result should be empty for nonexistent user")
	})

	t.Run("Mixed_Existing_And_Nonexistent_Users", func(t *testing.T) {
		// Create a real user
		realUser := prepare.CreateRegularUser(t, "real@example.com", "real")
		nonexistentID := uuid.New()

		userIDs := []uuid.UUID{realUser.ID, nonexistentID}

		result, err := permission.GetPermissionsByUserIDs(ctx, userIDs)
		require.NoError(t, err, "Should handle mixed existing and nonexistent users")

		// Should only have result for existing user
		assert.Len(t, result, 1, "Should have result for only the existing user")
		assert.Contains(t, result, realUser.ID, "Should contain the real user")
		assert.NotContains(t, result, nonexistentID, "Should not contain nonexistent user")

		// Real user should have their permissions
		realUserPermissions := result[realUser.ID]
		assert.Contains(t, realUserPermissions, permission.PermissionSessionRead,
			"Real user should have their expected permissions")
	})

	t.Run("Large_Number_Of_Users", func(t *testing.T) {
		// Create multiple users for performance testing
		var userIDs []uuid.UUID
		userCount := 10

		for i := 0; i < userCount; i++ {
			user := prepare.CreateRegularUser(t,
				fmt.Sprintf("bulk_user_%d@example.com", i),
				fmt.Sprintf("bulk_user_%d", i))
			userIDs = append(userIDs, user.ID)
		}

		result, err := permission.GetPermissionsByUserIDs(ctx, userIDs)
		require.NoError(t, err, "Should handle large number of users")
		assert.Len(t, result, userCount, "Should have results for all users")

		// All users should have the same permissions (regular user permissions)
		expectedPermissions := []permission.Permission{
			permission.PermissionSessionRead,
			permission.PermissionSessionUpdate,
		}

		for _, userID := range userIDs {
			userPermissions := result[userID]
			assert.Len(t, userPermissions, len(expectedPermissions),
				"Each user should have the expected number of permissions")

			for _, expectedPerm := range expectedPermissions {
				assert.Contains(t, userPermissions, expectedPerm,
					"Each user should have permission: %s", expectedPerm)
			}
		}
	})
}
