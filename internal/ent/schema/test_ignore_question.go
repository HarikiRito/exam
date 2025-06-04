package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// TestIgnoreQuestion holds the schema definition for the TestIgnoreQuestion entity.
type TestIgnoreQuestion struct {
	ent.Schema
}

// Fields of the TestIgnoreQuestion.
func (TestIgnoreQuestion) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("test_id", uuid.UUID{}),
		field.UUID("question_id", uuid.UUID{}),
		field.Text("reason").Optional().Nillable(),
	}
}

// Edges of the TestIgnoreQuestion.
func (TestIgnoreQuestion) Edges() []ent.Edge {
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

func (TestIgnoreQuestion) Mixin() []ent.Mixin {
	return mixin.DefaultMixins()
}
