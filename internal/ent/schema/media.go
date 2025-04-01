package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Media holds the schema definition for the Media entity.
type Media struct {
	ent.Schema
}

// Fields of the Media.
func (Media) Fields() []ent.Field {
	return []ent.Field{
		field.String("file_name").NotEmpty(),
		field.String("file_url").NotEmpty(),
		field.String("mime_type").NotEmpty(),
		// field.String("uploader_id").Optional(),
		field.JSON("metadata", map[string]interface{}{}).Optional().Comment("Additional metadata for the file"),
	}
}

// Edges of the Media.
func (Media) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("user", User.Type),
	}
}

func (Media) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.BaseMixin{},
	}
}