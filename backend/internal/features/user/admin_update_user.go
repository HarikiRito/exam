package user

import (
	"context"
	"errors"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/user"
	"template/internal/graph/model"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func AdminUpdateUser(ctx context.Context, userID uuid.UUID, input model.AdminEditUserInput) (*ent.User, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return nil, err
	}

	// Check if user exists
	existingUser, err := tx.User.Get(ctx, userID)
	if err != nil {
		return nil, db.Rollback(tx, errors.New("user not found"))
	}

	// Start building the update
	update := tx.User.UpdateOneID(userID)

	// Update email if provided and check for duplicates
	if input.Email != nil && *input.Email != existingUser.Email {
		emailExists, err := tx.User.Query().
			Where(user.EmailEQ(*input.Email)).
			Where(user.IDNEQ(userID)). // Exclude current user
			Exist(ctx)
		if err != nil {
			return nil, db.Rollback(tx, err)
		}
		if emailExists {
			return nil, db.Rollback(tx, errors.New("email already exists"))
		}
		update = update.SetEmail(*input.Email)
	}

	// Update password if provided
	if input.Password != nil {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(*input.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, db.Rollback(tx, fmt.Errorf("failed to hash password: %w", err))
		}
		update = update.SetPasswordHash(string(hashedPassword))
	}

	// Update isActive if provided
	if input.IsActive != nil {
		update = update.SetIsActive(*input.IsActive)
	}

	// Update role if provided
	if input.RoleID != nil {
		// Verify role exists
		role, err := tx.Role.Get(ctx, *input.RoleID)
		if err != nil {
			return nil, db.Rollback(tx, errors.New("invalid role"))
		}

		// Clear existing roles and set new role
		update = update.ClearRoles().AddRoleIDs(role.ID)
	}

	// Save the changes
	updatedUser, err := update.Save(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return updatedUser, nil
}
