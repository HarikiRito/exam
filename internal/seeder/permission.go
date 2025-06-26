package seeder

import (
	"context"
	"fmt"
	"template/internal/ent/db"
	"template/internal/ent/permission"
	permissionFeat "template/internal/features/permission"
	"template/internal/shared/utilities/pointer"
)

// PermissionData defines the structure for permission seed data
type PermissionData struct {
	Name        string
	Description *string
}

// GetDefaultPermissions returns the default set of permissions to be seeded
func GetDefaultPermissions() []PermissionData {
	return []PermissionData{
		{
			Name:        string(permissionFeat.PermissionUserCreate),
			Description: pointer.From("Create a new user"),
		},
		{
			Name:        string(permissionFeat.PermissionUserRead),
			Description: pointer.From("Read user information"),
		},
		{
			Name:        string(permissionFeat.PermissionSessionCreate),
			Description: pointer.From("Create a new session"),
		},
		{
			Name:        string(permissionFeat.PermissionSessionRead),
			Description: pointer.From("Read session information"),
		},
		{
			Name:        string(permissionFeat.PermissionSessionUpdate),
			Description: pointer.From("Update session information"),
		},
		{
			Name:        string(permissionFeat.PermissionSessionDelete),
			Description: pointer.From("Delete session information"),
		},
		{
			Name:        string(permissionFeat.CollectionCreate),
			Description: pointer.From("Create a new collection"),
		},
		{
			Name:        string(permissionFeat.CollectionRead),
			Description: pointer.From("Read collection information"),
		},
		{
			Name:        string(permissionFeat.CollectionUpdate),
			Description: pointer.From("Update collection information"),
		},
		{
			Name:        string(permissionFeat.CollectionDelete),
			Description: pointer.From("Delete collection information"),
		},
		{
			Name:        string(permissionFeat.TestRead),
			Description: pointer.From("Read test information"),
		},
		{
			Name:        string(permissionFeat.TestUpdate),
			Description: pointer.From("Update test information"),
		},
		{
			Name:        string(permissionFeat.TestCreate),
			Description: pointer.From("Create a new test"),
		},
		{
			Name:        string(permissionFeat.TestDelete),
			Description: pointer.From("Delete test information"),
		},
		{
			Name:        string(permissionFeat.TestCreate),
			Description: pointer.From("Create a new test"),
		},
	}
}

// SeedPermissions creates default permissions in the database
func SeedPermissions(ctx context.Context) error {
	fmt.Println("Seeding for permissions table...")
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return fmt.Errorf("failed to open transaction: %w", err)
	}

	permissions := GetDefaultPermissions()

	for _, permData := range permissions {
		// Check if permission already exists
		exists, err := tx.Permission.Query().
			Where(permission.Name(permData.Name)).
			Exist(ctx)
		if err != nil {
			return db.Rollback(tx, fmt.Errorf("failed to check if permission '%s' exists: %w", permData.Name, err))
		}

		// Skip if permission already exists
		if exists {
			fmt.Printf("Permission '%s' already exists, skipping...\n", permData.Name)
			continue
		}

		// Create the permission
		_, err = tx.Permission.Create().
			SetName(permData.Name).
			SetNillableDescription(permData.Description).
			Save(ctx)
		if err != nil {
			return db.Rollback(tx, fmt.Errorf("failed to create permission '%s': %w", permData.Name, err))
		}

		fmt.Printf("Created permission: %s\n", permData.Name)
	}

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	fmt.Printf("Successfully seeded %d permissions\n", len(permissions))
	return nil
}
