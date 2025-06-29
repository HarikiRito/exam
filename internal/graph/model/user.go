package model

import (
	"template/internal/ent"
)

// ConvertUserToModel converts an Ent User entity to a GraphQL User model
func ConvertUserToModel(entUser *ent.User) *User {
	return &User{
		ID:        entUser.ID,
		Email:     entUser.Email,
		Username:  entUser.Username,
		FirstName: entUser.FirstName,
		LastName:  entUser.LastName,
		IsActive:  entUser.IsActive,
	}
}
