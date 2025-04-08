package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
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
		field.String("password_hash").NotEmpty(),
		field.String("first_name").Optional(),
		field.String("last_name").Optional(),
		field.UUID("avatar_id", uuid.UUID{}).Optional(),
		field.Bool("is_active").Default(true),
	}
}

// Edges of the User.
func (User) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("media", Media.Type).
			Ref("user_media").Field("avatar_id").Unique(),
		edge.To("media_uploader", Media.Type).Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.From("roles", Role.Type).
			Ref("users").
			Through("user_roles", UserRole.Type),
		edge.To("course_creator", Course.Type),
	}
}

func (User) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.BaseMixin{},
	}
}
