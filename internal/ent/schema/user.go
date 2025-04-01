package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/schema/field"
)

// User holds the schema definition for the User entity.
type User struct {
	ent.Schema
}

// Fields of the User.
func (User) Fields() []ent.Field {
	return []ent.Field{
		field.String("username").NotEmpty().Unique(),
		field.String("email").NotEmpty().Unique(),
		field.String("passwordHash").NotEmpty(),
		field.String("firstName").Optional(),
		field.String("lastName").Optional(),
		// field.String("avatarId").Optional(),
		field.Bool("isActive").Default(true),
	}
}

// Edges of the User.
func (User) Edges() []ent.Edge {
	return []ent.Edge{
	}
}

func (User) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.BaseMixin{},
	}
}
