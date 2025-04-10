package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// CourseSession holds the schema definition for the CourseSession entity.
type CourseSession struct {
	ent.Schema
}

// Fields of the CourseSession.
func (CourseSession) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("user_id", uuid.UUID{}),
		field.UUID("course_section_id", uuid.UUID{}),
		field.Time("completed_at").Optional(),
		field.Int("total_score").Default(0),
	}
}

// Edges of the CourseSession.
func (CourseSession) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).
			Ref("course_sessions").
			Field("user_id").
			Unique().
			Required(),
		edge.From("course_section", CourseSection.Type).
			Ref("course_sessions").
			Field("course_section_id").
			Unique().
			Required(),
		edge.To("user_question_answers", UserQuestionAnswer.Type),
	}
}

func (CourseSession) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.BaseMixin{},
	}
} 