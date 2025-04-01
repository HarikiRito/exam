package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// QuestionOption holds the schema definition for the QuestionOption entity.
type QuestionOption struct {
	ent.Schema
}

// Fields of the QuestionOption.
func (QuestionOption) Fields() []ent.Field {
	return []ent.Field{
		field.String("question_id").NotEmpty(),
		field.Text("option_text").NotEmpty(),
		field.Bool("is_correct").Default(false),
	}
}

// Edges of the QuestionOption.
func (QuestionOption) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("question", Question.Type).
			Ref("question_options").
			Field("question_id").
			Unique().
			Required(),
	}
}

func (QuestionOption) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.BaseMixin{},
	}
} 