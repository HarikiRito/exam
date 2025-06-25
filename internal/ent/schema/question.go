package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// Question holds the schema definition for the Question entity.
type Question struct {
	ent.Schema
}

// Fields of the Question.
func (Question) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("collection_id", uuid.UUID{}),
		field.Text("question_text").NotEmpty(),
		field.Int("points").Default(0).Min(0),
	}
}

// Edges of the Question.
func (Question) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("collection", QuestionCollection.Type).
			Ref("questions").
			Field("collection_id").
			Unique().
			Required(),
		edge.To("question_options", QuestionOption.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("video_question_timestamps_question", VideoQuestionTimestamp.Type),
		edge.To("user_question_answers", TestSessionAnswer.Type).Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.From("test_ignore_questions", TestIgnoreQuestion.Type).
			Ref("question"),
	}
}

func (Question) Mixin() []ent.Mixin {
	return mixin.DefaultMixins()
}
