package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// CourseSection holds the schema definition for the CourseSection entity.
type CourseSection struct {
	ent.Schema
}

// Fields of the CourseSection.
func (CourseSection) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("course_id", uuid.UUID{}),
		field.UUID("section_id", uuid.UUID{}).Optional().Nillable(),
		field.String("title").NotEmpty(),
		field.Text("description").Optional().Nillable(),
		field.Int("order").Default(0),
	}
}

// Edges of the CourseSection.
func (CourseSection) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("course", Course.Type).
			Ref("course_sections").
			Field("course_id").
			Unique().
			Required(),
		edge.From("parent", CourseSection.Type).
			Ref("children").
			Field("section_id").
			Unique().
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("children", CourseSection.Type),
		edge.To("course_section_videos", Video.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("questions", Question.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("test_sessions", TestSession.Type),
		edge.To("tests", Test.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
	}
}

func (CourseSection) Mixin() []ent.Mixin {
	return mixin.DefaultMixins()
}
