package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
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
		field.UUID("uploader_id", uuid.UUID{}).Optional(),
		field.JSON("metadata", map[string]interface{}{}).Optional().Comment("Additional metadata for the file"),
	}
}

// Edges of the Media.
func (Media) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("user_media", User.Type),
		edge.From("user", User.Type).
			Ref("media_uploader").
			Field("uploader_id").
			Unique(),
		edge.To("course_media", Course.Type),
		edge.To("video_media", Video.Type),
	}
}

func (Media) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.BaseMixin{},
	}
}
