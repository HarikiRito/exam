package seeder

import (
	"context"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/role"
	"template/internal/features/permission"
	permissionFeat "template/internal/features/permission"
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
			Permissions: slice.Map(permissionFeat.AllPermissions, func(p permissionFeat.Permission) string {
				return string(p)
			}),
		},
		{
			Name:        RoleAdmin,
			Description: pointer.From("Administrator with elevated privileges"),
			Permissions: []string{
				string(permission.PermissionUserCreate),
				string(permission.PermissionUserRead),
				string(permission.PermissionSessionCreate),
				string(permission.PermissionSessionRead),
				string(permission.PermissionSessionUpdate),
				string(permission.PermissionSessionDelete),
				string(permission.CollectionCreate),
				string(permission.CollectionRead),
				string(permission.CollectionUpdate),
				string(permission.CollectionDelete),
				string(permission.TestCreate),
				string(permission.TestRead),
				string(permission.TestUpdate),
				string(permission.TestDelete),
				string(permission.CourseCreate),
				string(permission.CourseRead),
				string(permission.CourseUpdate),
				string(permission.CourseDelete),
				string(permission.CourseSectionCreate),
				string(permission.CourseSectionRead),
				string(permission.CourseSectionUpdate),
				string(permission.CourseSectionDelete),
				string(permission.QuestionCreate),
				string(permission.QuestionRead),
				string(permission.QuestionUpdate),
				string(permission.QuestionDelete),
				string(permission.QuestionOptionCreate),
				string(permission.QuestionOptionRead),
				string(permission.QuestionOptionUpdate),
				string(permission.QuestionOptionDelete),
				string(permission.VideoCreate),
				string(permission.VideoRead),
				string(permission.VideoUpdate),
				string(permission.VideoDelete),
				string(permission.MediaCreate),
				string(permission.MediaRead),
				string(permission.MediaUpdate),
				string(permission.MediaDelete),
			},
		},
		{
			Name:        RoleUser,
			Description: pointer.From("Standard user with basic access rights"),
			Permissions: []string{
				string(permission.PermissionSessionRead),
				string(permission.PermissionSessionUpdate),
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
		permissionIDs := slice.Map(slice.Filter(permissions, func(p *ent.Permission) bool {
			return slice.Contains(roleData.Permissions, p.Name)
		}), func(p *ent.Permission) uuid.UUID {
			return p.ID
		})
		// Check if role already exists
		exists, err := tx.Role.Query().
			Where(role.Name(roleData.Name)).
			Exist(ctx)
		if err != nil {
			return db.Rollback(tx, fmt.Errorf("failed to check if role '%s' exists: %w", roleData.Name, err))
		}

		// Skip if role already exists
		if exists {
			fmt.Printf("Role '%s' already exists, updating permissions...\n", roleData.Name)
			// Get the existing role to update its permissions
			roleEntity, err := tx.Role.Query().
				Where(role.Name(roleData.Name)).
				Only(ctx)
			if err != nil {
				return db.Rollback(tx, fmt.Errorf("failed to get existing role '%s': %w", roleData.Name, err))
			}

			_, err = tx.Role.Update().
				Where(role.ID(roleEntity.ID)).
				ClearPermissions().
				AddPermissionIDs(permissionIDs...).
				Save(ctx)
			if err != nil {
				return db.Rollback(tx, fmt.Errorf("failed to update permissions for role '%s': %w", roleData.Name, err))
			}
			continue
		}

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
