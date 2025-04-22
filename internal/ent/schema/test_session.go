package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// TestSession holds the schema definition for the TestSession entity.
type TestSession struct {
	ent.Schema
}

// Fields of the CourseSession.
func (TestSession) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("user_id", uuid.UUID{}),
		field.UUID("course_section_id", uuid.UUID{}).Optional().Nillable(),
		field.UUID("test_id", uuid.UUID{}),
		field.Time("completed_at").Optional(),
		field.Int("total_score").Default(0),
	}
}

// Edges of the CourseSession.
func (TestSession) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).
			Ref("test_sessions").
			Field("user_id").
			Unique().
			Required(),
		edge.From("course_section", CourseSection.Type).
			Ref("test_sessions").
			Field("course_section_id").
			Unique(),
		edge.From("test", Test.Type).
			Ref("test_sessions").
			Field("test_id").
			Unique().
			Required(),
		edge.To("user_question_answers", UserQuestionAnswer.Type),
	}
}

func (TestSession) Mixin() []ent.Mixin {
	return mixin.DefaultMixins()
}
