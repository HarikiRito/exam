package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Question holds the schema definition for the Question entity.
type Question struct {
	ent.Schema
}

// Fields of the Question.
func (Question) Fields() []ent.Field {
	return []ent.Field{
		field.String("section_id").NotEmpty(),
		field.Text("question_text").NotEmpty(),
	}
}

// Edges of the Question.
func (Question) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("section", CourseSection.Type).
			Ref("questions").
			Field("section_id").
			Unique().
			Required(),
		edge.To("question_options", QuestionOption.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("video_question_timestamps_question", VideoQuestionTimestamp.Type),
	}
}

func (Question) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.BaseMixin{},
	}
} 