package user_test

import (
	"context"
	"template/integration_test/setup"
	"template/internal/features/auth"
	"template/internal/graph/model"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCreateUser(t *testing.T) {
	dbSchema := setup.RandomDbSchema()
	setup.ResetTestSchema(t, dbSchema)
	t.Run("CreateUser", func(t *testing.T) {
		tokenPair, err := auth.Register(context.Background(), model.RegisterInput{
			Email:    "test@test.com",
			Password: "test",
		})
		assert.NoError(t, err)
		assert.NotEmpty(t, tokenPair.AccessToken)
		assert.NotEmpty(t, tokenPair.RefreshToken)

		t.Run("DuplicateUser", func(t *testing.T) {
			_, err := auth.Register(context.Background(), model.RegisterInput{
				Email:    "test@test.com",
				Password: "test",
			})
			assert.Error(t, err)
		})
		setup.ResetTestSchema(t, dbSchema)
	})

	setup.DeleteTestSchema(t, dbSchema)
}
