package model

import (
	"template/internal/ent"

	"github.com/google/uuid"
)

type Question struct {
	ID           uuid.UUID `json:"id"`
	QuestionText string    `json:"questionText"`
}

// ConvertQuestionToModel converts an ent.Question to a GraphQL model Question.
func ConvertQuestionToModel(q *ent.Question) *Question {
	result := &Question{
		ID:           q.ID,
		QuestionText: q.QuestionText,
	}

	return result
}
