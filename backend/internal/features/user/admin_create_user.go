package user

import (
	"context"
	"errors"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/user"
	"template/internal/graph/model"

	"golang.org/x/crypto/bcrypt"
)

func AdminCreateUser(ctx context.Context, input model.AdminCreateUserInput) (*ent.User, error) {
	// Validate required fields
	if input.Email == "" {
		return nil, errors.New("email cannot be empty")
	}
	if input.Password == "" {
		return nil, errors.New("password cannot be empty")
	}

	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return nil, err
	}

	// Check if email already exists
	emailExists, err := tx.User.Query().
		Where(user.EmailEQ(input.Email)).
		Exist(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}
	if emailExists {
		return nil, db.Rollback(tx, errors.New("email already exists"))
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, db.Rollback(tx, fmt.Errorf("failed to hash password: %w", err))
	}

	// Create the user
	newUser, err := tx.User.Create().
		SetEmail(input.Email).
		SetPasswordHash(string(hashedPassword)).
		SetUsername(input.Email).
		SetIsActive(true). // Default to active
		Save(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return newUser, nil
}
