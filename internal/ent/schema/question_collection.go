package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// QuestionCollection holds the schema definition for the QuestionCollection entity.
type QuestionCollection struct {
	ent.Schema
}

// Fields of the QuestionCollection.
func (QuestionCollection) Fields() []ent.Field {
	return []ent.Field{
		field.String("title").NotEmpty(),
		field.Text("description").Optional().Nillable(),
		field.UUID("creator_id", uuid.UUID{}),
		field.UUID("course_section_id", uuid.UUID{}).Optional().Nillable(),
	}
}

// Edges of the QuestionCollection.
func (QuestionCollection) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("creator", User.Type).
			Ref("question_collections").
			Field("creator_id").
			Unique().
			Required(),
		edge.To("questions", Question.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.From("course_section", CourseSection.Type).
			Ref("question_collections").
			Field("course_section_id").
			Unique().
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.From("test", Test.Type).
			Ref("question_collections"),
	}
}

func (QuestionCollection) Mixin() []ent.Mixin {
	return mixin.DefaultMixins()
}
