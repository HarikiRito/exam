package user

import (
	"context"
	"template/integration_test/prepare"
	"template/internal/features/auth"
	"template/internal/graph/model"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCreateUser(t *testing.T) {
	prepare.SetupTestDb(t)

	t.Run("CreateUser", func(t *testing.T) {
		input := model.RegisterInput{
			Email:    "test@test.com",
			Password: "test",
		}
		tokenPair, err := auth.Register(context.Background(), input)
		assert.NoError(t, err)
		assert.NotEmpty(t, tokenPair.AccessToken)
		assert.NotEmpty(t, tokenPair.RefreshToken)

		t.Run("Login", func(t *testing.T) {
			_, err := auth.Login(context.Background(), model.LoginInput{
				Email:    input.Email,
				Password: input.Password,
			})
			assert.NoError(t, err)
		})

		t.Run("DuplicateUser", func(t *testing.T) {
			_, err := auth.Register(context.Background(), model.RegisterInput{
				Email:    "test@test.com",
				Password: "test",
			})
			assert.Error(t, err)
		})
	})

}
