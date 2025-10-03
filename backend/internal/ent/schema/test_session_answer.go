package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// TestSessionAnswer holds the schema definition for the TestSessionAnswer entity.
type TestSessionAnswer struct {
	ent.Schema
}

// Fields of the UserQuestionAnswer.
func (TestSessionAnswer) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("question_id", uuid.UUID{}),
		field.UUID("session_id", uuid.UUID{}),
		field.Int("points").Optional().Nillable(),
		field.Int("order").Default(1).Positive(),
		field.Bool("is_correct").Optional().Nillable(),
		field.JSON("metadata", map[string]interface{}{}).Optional(),
	}
}

// Edges of the UserQuestionAnswer.
func (TestSessionAnswer) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("question", Question.Type).
			Ref("test_session_answers").
			Field("question_id").
			Unique().
			Required().
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.From("test_session", TestSession.Type).
			Ref("test_session_answers").
			Field("session_id").
			Unique().
			Required().
			Annotations(entsql.OnDelete(entsql.Cascade)),
	}
}

func (TestSessionAnswer) Mixin() []ent.Mixin {
	return mixin.DefaultMixins()
}
