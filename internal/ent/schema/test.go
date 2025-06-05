package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// Test holds the schema definition for the Test entity.
type Test struct {
	ent.Schema
}

// Fields of the Test.
func (Test) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").NotEmpty(),
		field.UUID("course_section_id", uuid.UUID{}).Optional().Nillable(),
		field.UUID("course_id", uuid.UUID{}).Optional().Nillable(),
		field.Int("total_points").Default(0).NonNegative(),
	}
}

// Edges of the Test.
func (Test) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("course_section", CourseSection.Type).
			Ref("tests").Field("course_section_id").Unique(),
		edge.From("course", Course.Type).
			Ref("tests").
			Field("course_id").Unique(),
		edge.To("test_sessions", TestSession.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("questions", Question.Type),
		edge.To("question_collections", QuestionCollection.Type),
		edge.From("test_question_counts", TestQuestionCount.Type).
			Ref("test"),
		edge.From("test_ignore_questions", TestIgnoreQuestion.Type).
			Ref("test"),
		edge.From("test_question_points", TestQuestionPoint.Type).
			Ref("test"),
	}
}

func (Test) Mixin() []ent.Mixin {
	return mixin.DefaultMixins()
}
