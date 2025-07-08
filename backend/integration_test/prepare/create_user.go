package prepare

import (
	"context"
	"template/internal/ent"
	"template/internal/features/auth"
	"template/internal/graph/model"
	"testing"
)

func CreateUser(t *testing.T, input model.RegisterInput) *ent.User {
	_, err := auth.Register(context.Background(), input)
	if err != nil {
		t.Fatalf("Failed to create user: %v", err)
	}

	user, err := auth.Login(context.Background(), model.LoginInput{
		Email:    input.Email,
		Password: input.Password,
	})
	if err != nil {
		t.Fatalf("Failed to login user: %v", err)
	}

	return user
}
