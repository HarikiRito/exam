package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// Video holds the schema definition for the Video entity.
type Video struct {
	ent.Schema
}

// Fields of the Video.
func (Video) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("section_id", uuid.UUID{}),
		field.String("title").NotEmpty(),
		field.Text("description").Optional(),
		field.UUID("media_id", uuid.UUID{}),
		field.UUID("course_id", uuid.UUID{}),
		field.Int("duration").Optional().Comment("Duration in seconds"),
	}
}

// Edges of the Video.
func (Video) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("course_section", CourseSection.Type).
			Ref("course_section_videos").
			Field("section_id").
			Unique().
			Required(),
		edge.From("media", Media.Type).
			Ref("video_media").
			Field("media_id").
			Unique().
			Required(),
		edge.From("course", Course.Type).
			Ref("course_videos").
			Field("course_id").
			Unique().
			Required(),
		edge.To("video_question_timestamps_video", VideoQuestionTimestamp.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
	}
}

func (Video) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.BaseMixin{},
	}
}
