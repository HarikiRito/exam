package model

import (
	"template/internal/ent"
)

// ConvertPermissionToModel converts an ent.Permission to a GraphQL Permission model
func ConvertPermissionToModel(entPermission *ent.Permission) *Permission {
	return &Permission{
		ID:          entPermission.ID,
		Name:        entPermission.Name,
		Description: entPermission.Description,
	}
}
