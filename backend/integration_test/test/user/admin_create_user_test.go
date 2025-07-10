package user

import (
	"context"
	"template/integration_test/prepare"
	"template/internal/features/user"
	"template/internal/graph/model"
	"template/internal/seeder"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

func TestAdminCreateUser(t *testing.T) {
	prepare.SetupTestDb(t)
	prepare.SetupRoleSystem(t)

	ctx := context.Background()
	userRoleID := prepare.GetRoleID(t, seeder.RoleUser)

	t.Run("CanCreateUser_Success", func(t *testing.T) {
		input := model.AdminCreateUserInput{
			Email:    "newuser@test.com",
			Password: "securepassword123",
			RoleID:   userRoleID,
		}

		createdUser, err := user.AdminCreateUser(ctx, input)
		require.NoError(t, err, "AdminCreateUser should succeed with valid input")
		require.NotNil(t, createdUser, "Created user should not be nil")

		// Verify user details
		assert.Equal(t, input.Email, createdUser.Email, "Email should match input")
		assert.True(t, createdUser.IsActive, "User should be active by default")
		assert.NotEmpty(t, createdUser.PasswordHash, "Password should be hashed")
		assert.NotEqual(t, input.Password, createdUser.PasswordHash, "Password should not be stored in plain text")

		// Verify password was hashed correctly
		err = bcrypt.CompareHashAndPassword([]byte(createdUser.PasswordHash), []byte(input.Password))
		assert.NoError(t, err, "Password should be correctly hashed")

		// Verify timestamps
		assert.False(t, createdUser.CreatedAt.IsZero(), "CreatedAt should be set")
		assert.False(t, createdUser.UpdatedAt.IsZero(), "UpdatedAt should be set")
		assert.NotNil(t, createdUser.ID, "ID should be generated")
	})

	t.Run("ErrorIfEmailExists_DuplicateEmail", func(t *testing.T) {
		// Create first user
		firstUserInput := model.AdminCreateUserInput{
			Email:    "duplicate@test.com",
			Password: "password123",
			RoleID:   userRoleID,
		}
		_, err := user.AdminCreateUser(ctx, firstUserInput)
		require.NoError(t, err, "First user creation should succeed")

		// Try to create second user with same email
		secondUserInput := model.AdminCreateUserInput{
			Email:    "duplicate@test.com", // Same email
			Password: "password456",
			RoleID:   userRoleID,
		}

		createdUser, err := user.AdminCreateUser(ctx, secondUserInput)
		assert.Error(t, err, "AdminCreateUser should fail with duplicate email")
		assert.Nil(t, createdUser, "User should not be created when email exists")
		assert.Contains(t, err.Error(), "email already exists", "Error should indicate email duplication")
	})

	// Note: Username duplication test removed because username is always set to email
	// So username duplication is equivalent to email duplication

	t.Run("ErrorIfEmailEmpty_EmptyEmail", func(t *testing.T) {
		input := model.AdminCreateUserInput{
			Email:    "", // Empty email
			Password: "validpassword123",
			RoleID:   userRoleID,
		}

		createdUser, err := user.AdminCreateUser(ctx, input)
		assert.Error(t, err, "AdminCreateUser should fail with empty email")
		assert.Nil(t, createdUser, "User should not be created with empty email")
	})

	// Note: Username empty test removed because username is always set to email

	t.Run("ErrorIfPasswordEmpty_EmptyPassword", func(t *testing.T) {
		input := model.AdminCreateUserInput{
			Email:    "validemail2@test.com",
			Password: "", // Empty password
			RoleID:   userRoleID,
		}

		createdUser, err := user.AdminCreateUser(ctx, input)
		assert.Error(t, err, "AdminCreateUser should fail with empty password")
		assert.Nil(t, createdUser, "User should not be created with empty password")
	})

	t.Run("ErrorIfEmailAndPasswordEmpty_BothEmpty", func(t *testing.T) {
		input := model.AdminCreateUserInput{
			Email:    "", // Empty email
			Password: "", // Empty password
			RoleID:   userRoleID,
		}

		createdUser, err := user.AdminCreateUser(ctx, input)
		assert.Error(t, err, "AdminCreateUser should fail with empty email and password")
		assert.Nil(t, createdUser, "User should not be created with empty email and password")
	})

	t.Run("CanCreateMultipleUsersWithUniqueData_Success", func(t *testing.T) {
		// Create multiple users to ensure the function works for multiple creations
		users := []model.AdminCreateUserInput{
			{Email: "user1@multi.com", Password: "pass1", RoleID: userRoleID},
			{Email: "user2@multi.com", Password: "pass2", RoleID: userRoleID},
			{Email: "user3@multi.com", Password: "pass3", RoleID: userRoleID},
		}

		for i, userInput := range users {
			createdUser, err := user.AdminCreateUser(ctx, userInput)
			assert.NoError(t, err, "User %d creation should succeed", i+1)
			assert.NotNil(t, createdUser, "User %d should not be nil", i+1)
			assert.Equal(t, userInput.Email, createdUser.Email, "User %d email should match", i+1)
		}
	})
}
