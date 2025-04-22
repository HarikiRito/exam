package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// UserQuestionAnswer holds the schema definition for the UserQuestionAnswer entity.
type UserQuestionAnswer struct {
	ent.Schema
}

// Fields of the UserQuestionAnswer.
func (UserQuestionAnswer) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("user_id", uuid.UUID{}),
		field.UUID("question_id", uuid.UUID{}),
		field.UUID("selected_option_id", uuid.UUID{}),
		field.UUID("session_id", uuid.UUID{}),
	}
}

// Edges of the UserQuestionAnswer.
func (UserQuestionAnswer) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).
			Ref("user_question_answers").
			Field("user_id").
			Unique().
			Required(),
		edge.From("question", Question.Type).
			Ref("user_question_answers").
			Field("question_id").
			Unique().
			Required(),
		edge.From("selected_option", QuestionOption.Type).
			Ref("user_question_answers").
			Field("selected_option_id").
			Unique().
			Required(),
		edge.From("test_session", TestSession.Type).
			Ref("user_question_answers").
			Field("session_id").
			Unique().
			Required(),
	}
}

func (UserQuestionAnswer) Mixin() []ent.Mixin {
	return mixin.DefaultMixins()
}
