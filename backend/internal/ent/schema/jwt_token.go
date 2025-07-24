package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// JwtToken holds the schema definition for the JwtToken entity.
type JwtToken struct {
	ent.Schema
}

// Fields of the JwtToken.
func (JwtToken) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("user_id", uuid.UUID{}).Comment("User ID associated with the token"),
		field.Text("access_token").Comment("JWT access token string"),
		field.Text("refresh_token").Comment("JWT refresh token string"),
		field.Time("expires_at").
			SchemaType(map[string]string{
				dialect.Postgres: "timestamp without time zone",
			}).
			Comment("Token expiration timestamp"),
	}
}

// Edges of the JwtToken.
func (JwtToken) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).
			Ref("jwt_tokens").
			Field("user_id").
			Unique().
			Required(),
	}
}

// Mixin of the JwtToken.
func (JwtToken) Mixin() []ent.Mixin {
	return mixin.DefaultMixins() // Includes ID, created_at, updated_at, deleted_at
}
