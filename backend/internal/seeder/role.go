package seeder

import (
	"context"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/role"
	permissionFeat "template/internal/features/permission"
	roleFeat "template/internal/features/role"
	"template/internal/shared/utilities/pointer"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

const (
	RoleOwner = roleFeat.RoleOwner
	RoleAdmin = roleFeat.RoleAdmin
	RoleUser  = roleFeat.RoleUser
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
				string(permissionFeat.UserCreate),
				string(permissionFeat.UserRead),
				string(permissionFeat.UserUpdate),
				string(permissionFeat.SessionCreate),
				string(permissionFeat.SessionRead),
				string(permissionFeat.SessionUpdate),
				string(permissionFeat.SessionDelete),
				string(permissionFeat.CollectionCreate),
				string(permissionFeat.CollectionRead),
				string(permissionFeat.CollectionUpdate),
				string(permissionFeat.CollectionDelete),
				string(permissionFeat.TestCreate),
				string(permissionFeat.TestRead),
				string(permissionFeat.TestUpdate),
				string(permissionFeat.TestDelete),
				string(permissionFeat.CourseCreate),
				string(permissionFeat.CourseRead),
				string(permissionFeat.CourseUpdate),
				string(permissionFeat.CourseDelete),
				string(permissionFeat.CourseSectionCreate),
				string(permissionFeat.CourseSectionRead),
				string(permissionFeat.CourseSectionUpdate),
				string(permissionFeat.CourseSectionDelete),
				string(permissionFeat.QuestionCreate),
				string(permissionFeat.QuestionRead),
				string(permissionFeat.QuestionUpdate),
				string(permissionFeat.QuestionDelete),
				string(permissionFeat.QuestionOptionCreate),
				string(permissionFeat.QuestionOptionRead),
				string(permissionFeat.QuestionOptionUpdate),
				string(permissionFeat.QuestionOptionDelete),
				string(permissionFeat.VideoCreate),
				string(permissionFeat.VideoRead),
				string(permissionFeat.VideoUpdate),
				string(permissionFeat.VideoDelete),
				string(permissionFeat.MediaCreate),
				string(permissionFeat.MediaRead),
				string(permissionFeat.MediaUpdate),
				string(permissionFeat.MediaDelete),
			},
		},
		{
			Name:        RoleUser,
			Description: pointer.From("Standard user with basic access rights"),
			Permissions: []string{
				string(permissionFeat.SessionRead),
				string(permissionFeat.SessionUpdate),
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
