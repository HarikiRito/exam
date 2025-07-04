package permission

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/permission"
	"template/internal/ent/role"
	"template/internal/ent/user"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

type Permission string

const (
	PermissionUserCreate    Permission = "USER_CREATE"
	PermissionUserRead      Permission = "USER_READ"
	PermissionSessionCreate Permission = "SESSION_CREATE"
	PermissionSessionRead   Permission = "SESSION_READ"
	PermissionSessionUpdate Permission = "SESSION_UPDATE"
	PermissionSessionDelete Permission = "SESSION_DELETE"
	CollectionCreate        Permission = "COLLECTION_CREATE"
	CollectionRead          Permission = "COLLECTION_READ"
	CollectionUpdate        Permission = "COLLECTION_UPDATE"
	CollectionDelete        Permission = "COLLECTION_DELETE"
	TestRead                Permission = "TEST_READ"
	TestUpdate              Permission = "TEST_UPDATE"
	TestDelete              Permission = "TEST_DELETE"
	TestCreate              Permission = "TEST_CREATE"
	CourseCreate            Permission = "COURSE_CREATE"
	CourseRead              Permission = "COURSE_READ"
	CourseUpdate            Permission = "COURSE_UPDATE"
	CourseDelete            Permission = "COURSE_DELETE"
	CourseSectionCreate     Permission = "COURSE_SECTION_CREATE"
	CourseSectionRead       Permission = "COURSE_SECTION_READ"
	CourseSectionUpdate     Permission = "COURSE_SECTION_UPDATE"
	CourseSectionDelete     Permission = "COURSE_SECTION_DELETE"
	QuestionCreate          Permission = "QUESTION_CREATE"
	QuestionRead            Permission = "QUESTION_READ"
	QuestionUpdate          Permission = "QUESTION_UPDATE"
	QuestionDelete          Permission = "QUESTION_DELETE"
	QuestionOptionCreate    Permission = "QUESTION_OPTION_CREATE"
	QuestionOptionRead      Permission = "QUESTION_OPTION_READ"
	QuestionOptionUpdate    Permission = "QUESTION_OPTION_UPDATE"
	QuestionOptionDelete    Permission = "QUESTION_OPTION_DELETE"
	VideoCreate             Permission = "VIDEO_CREATE"
	VideoRead               Permission = "VIDEO_READ"
	VideoUpdate             Permission = "VIDEO_UPDATE"
	VideoDelete             Permission = "VIDEO_DELETE"
	MediaCreate             Permission = "MEDIA_CREATE"
	MediaRead               Permission = "MEDIA_READ"
	MediaUpdate             Permission = "MEDIA_UPDATE"
	MediaDelete             Permission = "MEDIA_DELETE"
)

// AllPermissions is the list of permissions that are granted to the owner role. Default to all permissions.
var AllPermissions = []Permission{
	PermissionUserCreate,
	PermissionUserRead,
	PermissionSessionCreate,
	PermissionSessionRead,
	PermissionSessionUpdate,
	PermissionSessionDelete,
	CollectionCreate,
	CollectionRead,
	CollectionUpdate,
	CollectionDelete,
	TestRead,
	TestUpdate,
	TestDelete,
	TestCreate,
	CourseCreate,
	CourseRead,
	CourseUpdate,
	CourseDelete,
	CourseSectionCreate,
	CourseSectionRead,
	CourseSectionUpdate,
	CourseSectionDelete,
	QuestionCreate,
	QuestionRead,
	QuestionUpdate,
	QuestionDelete,
	QuestionOptionCreate,
	QuestionOptionRead,
	QuestionOptionUpdate,
	QuestionOptionDelete,
	VideoCreate,
	VideoRead,
	VideoUpdate,
	VideoDelete,
	MediaCreate,
	MediaRead,
	MediaUpdate,
	MediaDelete,
}

func GetAllPermissions(ctx context.Context) ([]*ent.Permission, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	return client.Permission.Query().All(ctx)
}

// GetPermissionsByUserIDs fetches permissions for multiple users and returns a map with user ID as key and permissions array as value
func GetPermissionsByUserIDs(ctx context.Context, userIDs []uuid.UUID) (map[uuid.UUID][]Permission, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	// Get users with their roles and permissions
	users, err := client.User.Query().
		Where(user.IDIn(userIDs...)).
		WithRoles(func(rq *ent.RoleQuery) {
			rq.Select(role.FieldID)
			rq.WithPermissions(
				func(pq *ent.PermissionQuery) {
					pq.Select(permission.FieldID, permission.FieldName, permission.FieldDescription)
				},
			)
		}).
		Select(user.FieldID).
		All(ctx)
	if err != nil {
		return nil, err
	}

	// Create map with user ID as key and permissions array as value
	userPermissionsMap := make(map[uuid.UUID][]Permission)
	for _, userEntity := range users {
		permissions := make([]Permission, 0)

		for _, role := range userEntity.Edges.Roles {
			for _, permission := range role.Edges.Permissions {
				permissions = append(permissions, Permission(permission.Name))
			}
		}

		permissions = slice.Unique(permissions)

		// Convert map to slice
		userPermissionsMap[userEntity.ID] = permissions
	}

	return userPermissionsMap, nil
}
