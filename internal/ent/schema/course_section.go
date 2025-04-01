package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// CourseSection holds the schema definition for the CourseSection entity.
type CourseSection struct {
	ent.Schema
}

// Fields of the CourseSection.
func (CourseSection) Fields() []ent.Field {
	return []ent.Field{
		field.String("course_id").NotEmpty(),
		field.String("title").NotEmpty(),
		field.Text("description").Optional(),
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
		edge.To("course_videos", Video.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("questions", Question.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
	}
}

func (CourseSection) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.BaseMixin{},
	}
} 