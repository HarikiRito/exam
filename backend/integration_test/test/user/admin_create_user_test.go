package user

import (
	"context"
	"template/integration_test/prepare"
	"template/internal/features/user"
	"template/internal/graph/model"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

func TestAdminCreateUser(t *testing.T) {
	prepare.SetupTestDb(t)

	ctx := context.Background()

	t.Run("CanCreateUser_Success", func(t *testing.T) {
		input := model.AdminCreateUserInput{
			Email:    "newuser@test.com",
			Password: "securepassword123",
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
		}
		_, err := user.AdminCreateUser(ctx, firstUserInput)
		require.NoError(t, err, "First user creation should succeed")

		// Try to create second user with same email
		secondUserInput := model.AdminCreateUserInput{
			Email:    "duplicate@test.com", // Same email
			Password: "password456",
		}

		createdUser, err := user.AdminCreateUser(ctx, secondUserInput)
		assert.Error(t, err, "AdminCreateUser should fail with duplicate email")
		assert.Nil(t, createdUser, "User should not be created when email exists")
		assert.Contains(t, err.Error(), "email already exists", "Error should indicate email duplication")
	})

	t.Run("ErrorIfUsernameExists_DuplicateUsername", func(t *testing.T) {
		// Create first user
		firstUserInput := model.AdminCreateUserInput{
			Email:    "uniqueemail1@test.com",
			Password: "password123",
		}
		_, err := user.AdminCreateUser(ctx, firstUserInput)
		require.NoError(t, err, "First user creation should succeed")

		// Try to create second user with same username
		secondUserInput := model.AdminCreateUserInput{
			Email:    "uniqueemail2@test.com", // Different email
			Password: "password456",
		}

		createdUser, err := user.AdminCreateUser(ctx, secondUserInput)
		assert.Error(t, err, "AdminCreateUser should fail with duplicate username")
		assert.Nil(t, createdUser, "User should not be created when username exists")
		assert.Contains(t, err.Error(), "username already exists", "Error should indicate username duplication")
	})

	t.Run("ErrorIfEmailEmpty_EmptyEmail", func(t *testing.T) {
		input := model.AdminCreateUserInput{
			Email:    "", // Empty email
			Password: "validpassword123",
		}

		createdUser, err := user.AdminCreateUser(ctx, input)
		assert.Error(t, err, "AdminCreateUser should fail with empty email")
		assert.Nil(t, createdUser, "User should not be created with empty email")
	})

	t.Run("ErrorIfUsernameEmpty_EmptyUsername", func(t *testing.T) {
		input := model.AdminCreateUserInput{
			Email:    "validemail@test.com",
			Password: "validpassword123",
		}

		createdUser, err := user.AdminCreateUser(ctx, input)
		assert.Error(t, err, "AdminCreateUser should fail with empty username")
		assert.Nil(t, createdUser, "User should not be created with empty username")
	})

	t.Run("ErrorIfPasswordEmpty_EmptyPassword", func(t *testing.T) {
		input := model.AdminCreateUserInput{
			Email:    "validemail2@test.com",
			Password: "", // Empty password
		}

		createdUser, err := user.AdminCreateUser(ctx, input)
		assert.Error(t, err, "AdminCreateUser should fail with empty password")
		assert.Nil(t, createdUser, "User should not be created with empty password")
	})

	t.Run("ErrorIfEmailAndPasswordEmpty_BothEmpty", func(t *testing.T) {
		input := model.AdminCreateUserInput{
			Email:    "", // Empty email
			Password: "", // Empty password
		}

		createdUser, err := user.AdminCreateUser(ctx, input)
		assert.Error(t, err, "AdminCreateUser should fail with empty email and password")
		assert.Nil(t, createdUser, "User should not be created with empty email and password")
	})

	t.Run("CanCreateMultipleUsersWithUniqueData_Success", func(t *testing.T) {
		// Create multiple users to ensure the function works for multiple creations
		users := []model.AdminCreateUserInput{
			{Email: "user1@multi.com", Password: "pass1"},
			{Email: "user2@multi.com", Password: "pass2"},
			{Email: "user3@multi.com", Password: "pass3"},
		}

		for i, userInput := range users {
			createdUser, err := user.AdminCreateUser(ctx, userInput)
			assert.NoError(t, err, "User %d creation should succeed", i+1)
			assert.NotNil(t, createdUser, "User %d should not be nil", i+1)
			assert.Equal(t, userInput.Email, createdUser.Email, "User %d email should match", i+1)
		}
	})
}
