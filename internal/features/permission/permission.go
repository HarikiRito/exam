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
}

func GetAllPermissions(ctx context.Context) ([]*ent.Permission, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	return client.Permission.Query().All(ctx)
}
