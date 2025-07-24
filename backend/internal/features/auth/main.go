package auth

import (
	"context"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/user"
	"template/internal/graph/model"

	"golang.org/x/crypto/bcrypt"
)

func Login(ctx context.Context, input model.LoginInput) (*ent.User, error) {

	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	// Find user by email or username
	userQuery, err := client.User.Query().
		Where(
			user.EmailEQ(input.Email),
		).
		First(ctx)
	if err != nil {
		return nil, fmt.Errorf("user not found")
	}

	// Compare passwords
	err = bcrypt.CompareHashAndPassword([]byte(userQuery.PasswordHash), []byte(input.Password))
	if err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	return userQuery, nil
}

func Register(ctx context.Context, input model.RegisterInput) (bool, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return false, err
	}

	// Check if email already exists
	exists, err := tx.User.Query().
		Where(
			user.EmailEQ(
				input.Email,
			),
		).
		Exist(ctx)

	if err != nil {
		return false, db.Rollback(tx, err)
	}

	if exists {
		return false, db.Rollback(tx, fmt.Errorf("email or username already exists"))
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return false, db.Rollback(tx, fmt.Errorf("failed to hash password"))
	}

	// Create the user with the hashed password
	_, err = tx.User.Create().
		SetEmail(input.Email).
		SetUsername(input.Email). // Use email as username if not provided
		SetPasswordHash(string(hashedPassword)).
		Save(ctx)
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return false, err
	}

	return true, nil
}
