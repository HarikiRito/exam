package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// Course holds the schema definition for the Course entity.
type Course struct {
	ent.Schema
}

// Fields of the Course.
func (Course) Fields() []ent.Field {
	return []ent.Field{
		field.String("title").NotEmpty(),
		field.Text("description").Optional(),
		field.UUID("media_id", uuid.UUID{}).Optional(),
		field.UUID("creator_id", uuid.UUID{}),
		field.Bool("is_published").Default(false),
	}
}

// Edges of the Course.
func (Course) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("media", Media.Type).
			Ref("course_media").
			Field("media_id").
			Unique(),
		edge.From("creator", User.Type).
			Ref("course_creator").
			Field("creator_id").
			Unique().
			Required(),
		edge.To("course_sections", CourseSection.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("course_videos", Video.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
	}
}

func (Course) Mixin() []ent.Mixin {
	return mixin.DefaultMixins()
}
