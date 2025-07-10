package user

import (
	"context"
	"template/integration_test/prepare"
	"template/internal/features/user"
	"template/internal/graph/model"
	"template/internal/seeder"
	"template/internal/shared/utilities/pointer"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

func TestAdminUpdateUser(t *testing.T) {
	prepare.SetupTestDb(t)
	prepare.SetupRoleSystem(t)

	ctx := context.Background()
	userRoleID := prepare.GetRoleID(t, seeder.RoleUser)

	t.Run("CanUpdateEmail_Success", func(t *testing.T) {
		// Create test user
		originalInput := model.AdminCreateUserInput{
			Email:    "original@test.com",
			Password: "originalpass123",
			RoleID:   userRoleID,
		}
		originalUser, err := user.AdminCreateUser(ctx, originalInput)
		require.NoError(t, err, "Test user creation should succeed")

		// Update only email
		newEmail := "updated@test.com"
		updateInput := model.AdminEditUserInput{
			Email: &newEmail,
		}

		updatedUser, err := user.AdminUpdateUser(ctx, originalUser.ID, updateInput)
		require.NoError(t, err, "AdminUpdateUser should succeed for email update")
		require.NotNil(t, updatedUser, "Updated user should not be nil")

		// Verify email was updated
		assert.Equal(t, newEmail, updatedUser.Email, "Email should be updated")
		// Verify other fields remained unchanged
		assert.Equal(t, originalUser.PasswordHash, updatedUser.PasswordHash, "Password should remain unchanged")
		assert.Equal(t, originalUser.IsActive, updatedUser.IsActive, "IsActive should remain unchanged")
		assert.Equal(t, originalUser.ID, updatedUser.ID, "ID should remain unchanged")
	})

	t.Run("CanUpdatePassword_Success", func(t *testing.T) {
		// Create test user
		originalInput := model.AdminCreateUserInput{
			Email:    "user@password.com",
			Password: "oldpassword123",
			RoleID:   userRoleID,
		}
		originalUser, err := user.AdminCreateUser(ctx, originalInput)
		require.NoError(t, err, "Test user creation should succeed")

		// Update only password
		newPassword := "newpassword456"
		updateInput := model.AdminEditUserInput{
			Password: &newPassword,
		}

		updatedUser, err := user.AdminUpdateUser(ctx, originalUser.ID, updateInput)
		require.NoError(t, err, "AdminUpdateUser should succeed for password update")
		require.NotNil(t, updatedUser, "Updated user should not be nil")

		// Verify password was updated
		assert.NotEqual(t, originalUser.PasswordHash, updatedUser.PasswordHash, "Password hash should be updated")
		err = bcrypt.CompareHashAndPassword([]byte(updatedUser.PasswordHash), []byte(newPassword))
		assert.NoError(t, err, "New password should be correctly hashed")

		// Verify other fields remained unchanged
		assert.Equal(t, originalUser.Email, updatedUser.Email, "Email should remain unchanged")
		assert.Equal(t, originalUser.IsActive, updatedUser.IsActive, "IsActive should remain unchanged")
		assert.Equal(t, originalUser.ID, updatedUser.ID, "ID should remain unchanged")
	})

	t.Run("CanUpdateIsActive_Success", func(t *testing.T) {
		// Create test user (active by default)
		originalInput := model.AdminCreateUserInput{
			Email:    "user@active.com",
			Password: "password123",
			RoleID:   userRoleID,
		}
		originalUser, err := user.AdminCreateUser(ctx, originalInput)
		require.NoError(t, err, "Test user creation should succeed")
		require.True(t, originalUser.IsActive, "User should be active by default")

		// Update only isActive status
		newIsActive := false
		updateInput := model.AdminEditUserInput{
			IsActive: &newIsActive,
		}

		updatedUser, err := user.AdminUpdateUser(ctx, originalUser.ID, updateInput)
		require.NoError(t, err, "AdminUpdateUser should succeed for isActive update")
		require.NotNil(t, updatedUser, "Updated user should not be nil")

		// Verify isActive was updated
		assert.Equal(t, newIsActive, updatedUser.IsActive, "IsActive should be updated")
		// Verify other fields remained unchanged
		assert.Equal(t, originalUser.Email, updatedUser.Email, "Email should remain unchanged")
		assert.Equal(t, originalUser.PasswordHash, updatedUser.PasswordHash, "Password should remain unchanged")
		assert.Equal(t, originalUser.ID, updatedUser.ID, "ID should remain unchanged")
	})

	t.Run("CanUpdateMultipleFields_Success", func(t *testing.T) {
		// Create test user
		originalInput := model.AdminCreateUserInput{
			Email:    "user@multiple.com",
			Password: "originalpass123",
			RoleID:   userRoleID,
		}
		originalUser, err := user.AdminCreateUser(ctx, originalInput)
		require.NoError(t, err, "Test user creation should succeed")

		// Update multiple fields at once
		newEmail := "updated@multiple.com"
		newPassword := "newpassword456"
		newIsActive := false
		updateInput := model.AdminEditUserInput{
			Email:    &newEmail,
			Password: &newPassword,
			IsActive: &newIsActive,
		}

		updatedUser, err := user.AdminUpdateUser(ctx, originalUser.ID, updateInput)
		require.NoError(t, err, "AdminUpdateUser should succeed for multiple field update")
		require.NotNil(t, updatedUser, "Updated user should not be nil")

		// Verify all fields were updated
		assert.Equal(t, newEmail, updatedUser.Email, "Email should be updated")
		assert.Equal(t, newIsActive, updatedUser.IsActive, "IsActive should be updated")
		assert.NotEqual(t, originalUser.PasswordHash, updatedUser.PasswordHash, "Password hash should be updated")
		err = bcrypt.CompareHashAndPassword([]byte(updatedUser.PasswordHash), []byte(newPassword))
		assert.NoError(t, err, "New password should be correctly hashed")

		// Verify unchanged fields
		assert.Equal(t, originalUser.ID, updatedUser.ID, "ID should remain unchanged")
	})

	t.Run("ErrorIfEmailExists_DuplicateEmailUpdate", func(t *testing.T) {
		// Create first user
		firstInput := model.AdminCreateUserInput{
			Email:    "first@duplicate.com",
			Password: "password123",
			RoleID:   userRoleID,
		}
		_, err := user.AdminCreateUser(ctx, firstInput)
		require.NoError(t, err, "First user creation should succeed")

		// Create second user
		secondInput := model.AdminCreateUserInput{
			Email:    "second@duplicate.com",
			Password: "password456",
			RoleID:   userRoleID,
		}
		secondUser, err := user.AdminCreateUser(ctx, secondInput)
		require.NoError(t, err, "Second user creation should succeed")

		// Try to update second user's email to first user's email
		duplicateEmail := "first@duplicate.com"
		updateInput := model.AdminEditUserInput{
			Email: &duplicateEmail,
		}

		updatedUser, err := user.AdminUpdateUser(ctx, secondUser.ID, updateInput)
		assert.Error(t, err, "AdminUpdateUser should fail with duplicate email")
		assert.Nil(t, updatedUser, "User should not be updated when email exists")
		assert.Contains(t, err.Error(), "email already exists", "Error should indicate email duplication")
	})

	t.Run("CanUpdateToSameEmail_CurrentUserEmail", func(t *testing.T) {
		// Create test user
		originalInput := model.AdminCreateUserInput{
			Email:    "same@email.com",
			Password: "password123",
			RoleID:   userRoleID,
		}
		originalUser, err := user.AdminCreateUser(ctx, originalInput)
		require.NoError(t, err, "Test user creation should succeed")

		// Update user's email to the same email (should be allowed)
		sameEmail := "same@email.com"
		updateInput := model.AdminEditUserInput{
			Email: &sameEmail,
		}

		updatedUser, err := user.AdminUpdateUser(ctx, originalUser.ID, updateInput)
		require.NoError(t, err, "AdminUpdateUser should succeed when updating to same email")
		require.NotNil(t, updatedUser, "Updated user should not be nil")

		// Verify email remains the same
		assert.Equal(t, sameEmail, updatedUser.Email, "Email should remain the same")
		assert.Equal(t, originalUser.ID, updatedUser.ID, "ID should remain unchanged")
	})

	t.Run("ErrorIfUserNotFound_NonExistentUserID", func(t *testing.T) {
		// Try to update a non-existent user
		nonExistentID := uuid.New()
		updateInput := model.AdminEditUserInput{
			Email: pointer.From("newemail@test.com"),
		}

		updatedUser, err := user.AdminUpdateUser(ctx, nonExistentID, updateInput)
		assert.Error(t, err, "AdminUpdateUser should fail for non-existent user")
		assert.Nil(t, updatedUser, "User should not be returned for non-existent ID")
		assert.Contains(t, err.Error(), "user not found", "Error should indicate user not found")
	})

	t.Run("NoUpdateIfNoFieldsProvided_EmptyInput", func(t *testing.T) {
		// Create test user
		originalInput := model.AdminCreateUserInput{
			Email:    "user@noupdate.com",
			Password: "password123",
			RoleID:   userRoleID,
		}
		originalUser, err := user.AdminCreateUser(ctx, originalInput)
		require.NoError(t, err, "Test user creation should succeed")

		// Update with empty input (no fields provided)
		updateInput := model.AdminEditUserInput{}

		updatedUser, err := user.AdminUpdateUser(ctx, originalUser.ID, updateInput)
		require.NoError(t, err, "AdminUpdateUser should succeed even with no fields to update")
		require.NotNil(t, updatedUser, "Updated user should not be nil")

		// Verify nothing changed
		assert.Equal(t, originalUser.Email, updatedUser.Email, "Email should remain unchanged")
		assert.Equal(t, originalUser.PasswordHash, updatedUser.PasswordHash, "Password should remain unchanged")
		assert.Equal(t, originalUser.IsActive, updatedUser.IsActive, "IsActive should remain unchanged")
		assert.Equal(t, originalUser.ID, updatedUser.ID, "ID should remain unchanged")
	})
}
