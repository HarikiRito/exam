package auth

import (
	"context"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/user"
	"template/internal/features/jwt"
	"template/internal/graph/model"

	"golang.org/x/crypto/bcrypt"
)

func Login(ctx context.Context, input model.LoginInput) (*ent.User, error) {

	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	// Find user by email or username
	user, err := client.User.Query().
		Where(
			user.Or(
				user.EmailEQ(input.Email),
				user.UsernameEQ(input.Email),
			),
		).
		First(ctx)
	if err != nil {
		return nil, fmt.Errorf("User not found")
	}

	// Compare passwords
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
	if err != nil {
		return nil, fmt.Errorf("Invalid credentials")
	}

	return user, nil
}

func Register(ctx context.Context, input model.RegisterInput) (*jwt.TokenPair, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	// Check if email already exists
	existingUser, err := client.User.Query().
		Where(
			user.Or(
				user.EmailEQ(input.Email),
				user.UsernameEQ(input.Email),
			),
		).
		First(ctx)
	if existingUser != nil {
		return nil, fmt.Errorf("email or username already exists")
	}
	// If the error is not a "not found" error, return it
	if err != nil && !ent.IsNotFound(err) {
		return nil, err
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("Failed to hash password")
	}

	// Create the user with the hashed password
	user, err := client.User.Create().
		SetEmail(input.Email).
		SetUsername(input.Email). // Use email as username if not provided
		SetPasswordHash(string(hashedPassword)).
		Save(ctx)
	if err != nil {
		return nil, err
	}


	tokenPair, err := jwt.GenerateTokenPair(user.ID.String(), map[string]interface{}{
		"email": user.Email,
		"username": user.Username,
	})
	if err != nil {
		return nil, err
	}

	return tokenPair, nil
}
