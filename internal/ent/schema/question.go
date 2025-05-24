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
		field.UUID("section_id", uuid.UUID{}).Optional().Nillable(),
		field.Text("question_text").NotEmpty(),
	}
}

// Edges of the Question.
func (Question) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("section", CourseSection.Type).
			Ref("questions").
			Field("section_id").
			Unique(),
		edge.To("question_options", QuestionOption.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("video_question_timestamps_question", VideoQuestionTimestamp.Type),
		edge.To("user_question_answers", UserQuestionAnswer.Type),
		edge.From("tests", Test.Type).
			Ref("questions"),
	}
}

func (Question) Mixin() []ent.Mixin {
	return mixin.DefaultMixins()
}
