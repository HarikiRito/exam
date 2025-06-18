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
		field.UUID("selected_option_id", uuid.UUID{}).Optional().Nillable(),
		field.UUID("session_id", uuid.UUID{}),
		field.String("selected_option_text").Optional().Nillable(),
		field.Int("points").Optional().Nillable(),
		field.Int("order").Default(1).Positive(),
		field.Bool("is_correct").Optional().Nillable(),
	}
}

// Edges of the UserQuestionAnswer.
func (TestSessionAnswer) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("question", Question.Type).
			Ref("user_question_answers").
			Field("question_id").
			Unique().
			Required().
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.From("selected_option", QuestionOption.Type).
			Ref("user_question_answers").
			Field("selected_option_id").
			Unique().
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.From("test_session", TestSession.Type).
			Ref("test_session_question_answers").
			Field("session_id").
			Unique().
			Required().
			Annotations(entsql.OnDelete(entsql.Cascade)),
	}
}

func (TestSessionAnswer) Mixin() []ent.Mixin {
	return mixin.DefaultMixins()
}
