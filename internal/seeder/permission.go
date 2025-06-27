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
			Name:        string(permissionFeat.CourseCreate),
			Description: pointer.From("Create a new course"),
		},
		{
			Name:        string(permissionFeat.CourseRead),
			Description: pointer.From("Read course information"),
		},
		{
			Name:        string(permissionFeat.CourseUpdate),
			Description: pointer.From("Update course information"),
		},
		{
			Name:        string(permissionFeat.CourseDelete),
			Description: pointer.From("Delete course information"),
		},
		{
			Name:        string(permissionFeat.CourseSectionCreate),
			Description: pointer.From("Create a new course section"),
		},
		{
			Name:        string(permissionFeat.CourseSectionRead),
			Description: pointer.From("Read course section information"),
		},
		{
			Name:        string(permissionFeat.CourseSectionUpdate),
			Description: pointer.From("Update course section information"),
		},
		{
			Name:        string(permissionFeat.CourseSectionDelete),
			Description: pointer.From("Delete course section information"),
		},
		{
			Name:        string(permissionFeat.QuestionCreate),
			Description: pointer.From("Create a new question"),
		},
		{
			Name:        string(permissionFeat.QuestionRead),
			Description: pointer.From("Read question information"),
		},
		{
			Name:        string(permissionFeat.QuestionUpdate),
			Description: pointer.From("Update question information"),
		},
		{
			Name:        string(permissionFeat.QuestionDelete),
			Description: pointer.From("Delete question information"),
		},
		{
			Name:        string(permissionFeat.QuestionOptionCreate),
			Description: pointer.From("Create a new question option"),
		},
		{
			Name:        string(permissionFeat.QuestionOptionRead),
			Description: pointer.From("Read question option information"),
		},
		{
			Name:        string(permissionFeat.QuestionOptionUpdate),
			Description: pointer.From("Update question option information"),
		},
		{
			Name:        string(permissionFeat.QuestionOptionDelete),
			Description: pointer.From("Delete question option information"),
		},
		{
			Name:        string(permissionFeat.VideoCreate),
			Description: pointer.From("Create a new video"),
		},
		{
			Name:        string(permissionFeat.VideoRead),
			Description: pointer.From("Read video information"),
		},
		{
			Name:        string(permissionFeat.VideoUpdate),
			Description: pointer.From("Update video information"),
		},
		{
			Name:        string(permissionFeat.VideoDelete),
			Description: pointer.From("Delete video information"),
		},
		{
			Name:        string(permissionFeat.MediaCreate),
			Description: pointer.From("Create a new media file"),
		},
		{
			Name:        string(permissionFeat.MediaRead),
			Description: pointer.From("Read media file information"),
		},
		{
			Name:        string(permissionFeat.MediaUpdate),
			Description: pointer.From("Update media file information"),
		},
		{
			Name:        string(permissionFeat.MediaDelete),
			Description: pointer.From("Delete media file information"),
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
