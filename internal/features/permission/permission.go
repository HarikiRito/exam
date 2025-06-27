package permission

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
)

type Permission string

const (
	PermissionUserCreate    Permission = "user:create"
	PermissionUserRead      Permission = "user:read"
	PermissionSessionCreate Permission = "session:create"
	PermissionSessionRead   Permission = "session:read"
	PermissionSessionUpdate Permission = "session:update"
	PermissionSessionDelete Permission = "session:delete"
	CollectionCreate        Permission = "collection:create"
	CollectionRead          Permission = "collection:read"
	CollectionUpdate        Permission = "collection:update"
	CollectionDelete        Permission = "collection:delete"
	TestRead                Permission = "test:read"
	TestUpdate              Permission = "test:update"
	TestDelete              Permission = "test:delete"
	TestCreate              Permission = "test:create"
	CourseCreate            Permission = "course:create"
	CourseRead              Permission = "course:read"
	CourseUpdate            Permission = "course:update"
	CourseDelete            Permission = "course:delete"
	CourseSectionCreate     Permission = "course_section:create"
	CourseSectionRead       Permission = "course_section:read"
	CourseSectionUpdate     Permission = "course_section:update"
	CourseSectionDelete     Permission = "course_section:delete"
	QuestionCreate          Permission = "question:create"
	QuestionRead            Permission = "question:read"
	QuestionUpdate          Permission = "question:update"
	QuestionDelete          Permission = "question:delete"
	QuestionOptionCreate    Permission = "question_option:create"
	QuestionOptionRead      Permission = "question_option:read"
	QuestionOptionUpdate    Permission = "question_option:update"
	QuestionOptionDelete    Permission = "question_option:delete"
	VideoCreate             Permission = "video:create"
	VideoRead               Permission = "video:read"
	VideoUpdate             Permission = "video:update"
	VideoDelete             Permission = "video:delete"
	MediaCreate             Permission = "media:create"
	MediaRead               Permission = "media:read"
	MediaUpdate             Permission = "media:update"
	MediaDelete             Permission = "media:delete"
)

// OwnerPermissions is the list of permissions that are granted to the owner role. Default to all permissions.
var OwnerPermissions = []Permission{
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
