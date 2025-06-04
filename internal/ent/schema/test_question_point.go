package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// TestQuestionPoint holds the schema definition for the TestQuestionPoint entity.
type TestQuestionPoint struct {
	ent.Schema
}

// Fields of the TestQuestionPoint.
func (TestQuestionPoint) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("test_id", uuid.UUID{}),
		field.UUID("question_id", uuid.UUID{}),
		field.Int("points").Default(0),
	}
}

// Edges of the TestQuestionPoint.
func (TestQuestionPoint) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("test", Test.Type).
			Field("test_id").
			Unique().
			Required().
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("question", Question.Type).
			Field("question_id").
			Unique().
			Required().
			Annotations(entsql.OnDelete(entsql.Cascade)),
	}
}

func (TestQuestionPoint) Mixin() []ent.Mixin {
	return mixin.DefaultMixins()
}
