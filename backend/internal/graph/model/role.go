package model

import (
	"template/internal/ent"
)

// ConvertRoleToModel converts an ent.Role to a GraphQL model Role.
func ConvertRoleToModel(role *ent.Role) *Role {
	return &Role{
		ID:   role.ID,
		Name: role.Name,
	}
}
