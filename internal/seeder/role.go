package seeder

import (
	"context"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/role"
	"template/internal/shared/utilities/pointer"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

const (
	RoleOwner = "owner" // Can do anything without restrictions
	RoleAdmin = "admin" // Can do anything except for system level operations like creating/deleting users
	RoleUser  = "user"  // Can only read and write their own data
)

type RoleData struct {
	Name        string
	Description *string
	Permissions []string
}

func GetDefaultRoles() []RoleData {
	return []RoleData{
		{
			Name:        RoleOwner,
			Description: pointer.From("System owner with full unrestricted access"),
			Permissions: []string{}, // Owner doesn't need explicit permissions
		},
		{
			Name:        RoleAdmin,
			Description: pointer.From("Administrator with elevated privileges"),
			Permissions: []string{
				PermissionUserCreate,
				PermissionUserRead,
				PermissionSessionCreate,
				PermissionSessionRead,
				PermissionSessionUpdate,
			},
		},
		{
			Name:        RoleUser,
			Description: pointer.From("Standard user with basic access rights"),
			Permissions: []string{
				PermissionSessionRead,
				PermissionSessionUpdate,
			},
		},
	}
}

// SeedRoles creates default roles and links them to their permissions
func SeedRoles(ctx context.Context) error {
	fmt.Println("Seeding for roles table...")
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return fmt.Errorf("failed to open transaction: %w", err)
	}

	roles := GetDefaultRoles()

	permissions, err := tx.Permission.Query().
		All(ctx)
	if err != nil {
		return db.Rollback(tx, fmt.Errorf("failed to fetch permissions: %w", err))
	}

	for _, roleData := range roles {
		// Check if role already exists
		exists, err := tx.Role.Query().
			Where(role.Name(roleData.Name)).
			Exist(ctx)
		if err != nil {
			return db.Rollback(tx, fmt.Errorf("failed to check if role '%s' exists: %w", roleData.Name, err))
		}

		// Skip if role already exists
		if exists {
			fmt.Printf("Role '%s' already exists, skipping...\n", roleData.Name)
			continue
		}

		permissionIDs := slice.Map(slice.Filter(permissions, func(p *ent.Permission) bool {
			return slice.Contains(roleData.Permissions, p.Name)
		}), func(p *ent.Permission) uuid.UUID {
			return p.ID
		})

		// Create the role with permissions
		roleCreate := tx.Role.Create().
			SetName(roleData.Name).
			SetNillableDescription(roleData.Description)

		// Add permissions if any
		if len(permissionIDs) > 0 {
			roleCreate = roleCreate.AddPermissionIDs(permissionIDs...)
		}

		createdRole, err := roleCreate.Save(ctx)
		if err != nil {
			return db.Rollback(tx, fmt.Errorf("failed to create role '%s': %w", roleData.Name, err))
		}

		fmt.Printf("Created role: %s with %d permissions\n", createdRole.Name, len(permissionIDs))
	}

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	fmt.Printf("Successfully seeded %d roles\n", len(roles))
	return nil
}
