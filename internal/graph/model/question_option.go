package model

import (
	"template/internal/ent"

	"github.com/google/uuid"
)

type QuestionOption struct {
	ID         uuid.UUID `json:"id"`
	OptionText string    `json:"optionText"`
	IsCorrect  bool      `json:"isCorrect"`
}

// ConvertQuestionOptionToModel converts an ent.QuestionOption to a GraphQL model QuestionOption.
func ConvertQuestionOptionToModel(option *ent.QuestionOption) *QuestionOption {
	result := &QuestionOption{
		ID:         option.ID,
		OptionText: option.OptionText,
		IsCorrect:  option.IsCorrect,
	}

	return result
}
