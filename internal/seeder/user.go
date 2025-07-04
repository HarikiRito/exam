package seeder

import (
	"context"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/user"
	"template/internal/shared/utilities/pointer"
	"template/internal/shared/utilities/slice"

	"golang.org/x/crypto/bcrypt"
)

type UserData struct {
	Username  string
	Email     string
	Password  string
	FirstName *string
	LastName  *string
	RoleName  string
	IsActive  bool
}

func GetDefaultUsers() []UserData {
	return []UserData{
		{
			Username:  "owner",
			Email:     "owner@example.com",
			Password:  "password123",
			FirstName: pointer.From("System"),
			LastName:  pointer.From("Owner"),
			RoleName:  RoleOwner,
			IsActive:  true,
		},
		{
			Username:  "admin",
			Email:     "admin@example.com",
			Password:  "password123",
			FirstName: pointer.From("System"),
			LastName:  pointer.From("Admin"),
			RoleName:  RoleAdmin,
			IsActive:  true,
		},
		{
			Username:  "user1",
			Email:     "user1@example.com",
			Password:  "password123",
			FirstName: pointer.From("John"),
			LastName:  pointer.From("Doe"),
			RoleName:  RoleUser,
			IsActive:  true,
		},
		{
			Username:  "user2",
			Email:     "user2@example.com",
			Password:  "password123",
			FirstName: pointer.From("Jane"),
			LastName:  pointer.From("Smith"),
			RoleName:  RoleUser,
			IsActive:  true,
		},
		{
			Username:  "user3",
			Email:     "user3@example.com",
			Password:  "password123",
			FirstName: pointer.From("Mike"),
			LastName:  pointer.From("Johnson"),
			RoleName:  RoleUser,
			IsActive:  true,
		},
		{
			Username:  "user4",
			Email:     "user4@example.com",
			Password:  "password123",
			FirstName: pointer.From("Sarah"),
			LastName:  pointer.From("Wilson"),
			RoleName:  RoleUser,
			IsActive:  true,
		},
		{
			Username:  "user5",
			Email:     "user5@example.com",
			Password:  "password123",
			FirstName: pointer.From("David"),
			LastName:  pointer.From("Brown"),
			RoleName:  RoleUser,
			IsActive:  true,
		},
	}
}

// SeedUsers creates default users and assigns them to their respective roles
func SeedUsers(ctx context.Context) error {
	fmt.Println("Seeding for users table...")
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return fmt.Errorf("failed to open transaction: %w", err)
	}

	users := GetDefaultUsers()

	// Fetch all roles to map role names to role IDs
	roles, err := tx.Role.Query().All(ctx)
	if err != nil {
		return db.Rollback(tx, fmt.Errorf("failed to fetch roles: %w", err))
	}

	// Create a map of role names to role entities
	roleMap := slice.ToMap(roles, func(r *ent.Role) (string, *ent.Role) {
		return r.Name, r
	})

	for _, userData := range users {
		// Check if user already exists
		exists, err := tx.User.Query().
			Where(user.EmailEQ(userData.Email)).
			Exist(ctx)
		if err != nil {
			return db.Rollback(tx, fmt.Errorf("failed to check if user '%s' exists: %w", userData.Email, err))
		}

		// Skip if user already exists
		if exists {
			fmt.Printf("User '%s' already exists, update role only\n", userData.Email)

			tx.User.Update().
				Where(user.EmailEQ(userData.Email)).
				AddRoleIDs(roleMap[userData.RoleName].ID).
				Save(ctx)
			continue
		}

		// Hash the password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(userData.Password), bcrypt.DefaultCost)
		if err != nil {
			return db.Rollback(tx, fmt.Errorf("failed to hash password for user '%s': %w", userData.Email, err))
		}

		// Find the role for this user
		targetRole, exists := roleMap[userData.RoleName]
		if !exists {
			return db.Rollback(tx, fmt.Errorf("role '%s' not found for user '%s'", userData.RoleName, userData.Email))
		}

		// Create the user
		userCreate := tx.User.Create().
			SetUsername(userData.Username).
			SetEmail(userData.Email).
			SetPasswordHash(string(hashedPassword)).
			SetNillableFirstName(userData.FirstName).
			SetNillableLastName(userData.LastName).
			SetIsActive(userData.IsActive).
			AddRoleIDs(targetRole.ID)

		createdUser, err := userCreate.Save(ctx)
		if err != nil {
			return db.Rollback(tx, fmt.Errorf("failed to create user '%s': %w", userData.Email, err))
		}

		fmt.Printf("Created user: %s (%s) with role: %s\n", createdUser.Email, createdUser.Username, userData.RoleName)
	}

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	fmt.Printf("Successfully seeded %d users\n", len(users))
	return nil
}
