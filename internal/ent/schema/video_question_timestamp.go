package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// VideoQuestionTimestamp holds the schema definition for the VideoQuestionTimestamp entity.
type VideoQuestionTimestamp struct {
	ent.Schema
}

// Fields of the VideoQuestionTimestamp.
func (VideoQuestionTimestamp) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("video_id", uuid.UUID{}),
		field.UUID("question_id", uuid.UUID{}),
		field.Int("timestamp").Comment("Timestamp in seconds when question should appear during video playback"),
	}
}

// Edges of the VideoQuestionTimestamp.
func (VideoQuestionTimestamp) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("video", Video.Type).
			Ref("video_question_timestamps_video").
			Field("video_id").
			Unique().
			Required(),
		edge.From("question", Question.Type).
			Ref("video_question_timestamps_question").
			Field("question_id").
			Unique().
			Required(),
	}
}

func (VideoQuestionTimestamp) Mixin() []ent.Mixin {
	return mixin.DefaultMixins()
}
