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
)

// OwnerPermissions is the list of permissions that are granted to the owner role. Default to all permissions.
var OwnerPermissions = []Permission{
	PermissionUserCreate,
	PermissionUserRead,
	PermissionSessionCreate,
	PermissionSessionRead,
	PermissionSessionUpdate,
	PermissionSessionDelete,
}

func GetAllPermissions(ctx context.Context) ([]*ent.Permission, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	return client.Permission.Query().All(ctx)
}
