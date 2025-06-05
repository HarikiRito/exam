package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// TestQuestionCount holds the schema definition for the TestQuestionCount entity.
type TestQuestionCount struct {
	ent.Schema
}

// Fields of the TestQuestionCount.
func (TestQuestionCount) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("test_id", uuid.UUID{}),
		field.Int("number_of_questions").Default(0).NonNegative(),
		field.Int("points").Default(0).NonNegative(),
	}
}

// Edges of the TestQuestionCount.
func (TestQuestionCount) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("test", Test.Type).
			Field("test_id").
			Unique().
			Required().
			Annotations(entsql.OnDelete(entsql.Cascade)),
	}
}

func (TestQuestionCount) Mixin() []ent.Mixin {
	return mixin.DefaultMixins()
}
