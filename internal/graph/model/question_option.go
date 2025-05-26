package model

import (
	"template/internal/ent"

	"github.com/google/uuid"
)

type QuestionOption struct {
	ID         uuid.UUID `json:"id"`
	OptionText string    `json:"optionText"`
	IsCorrect  bool      `json:"isCorrect"`
	QuestionID uuid.UUID `json:"questionId"`
}

// ConvertQuestionOptionToModel converts an ent.QuestionOption to a GraphQL model QuestionOption.
func ConvertQuestionOptionToModel(option *ent.QuestionOption) *QuestionOption {
	result := &QuestionOption{
		ID:         option.ID,
		OptionText: option.OptionText,
		IsCorrect:  option.IsCorrect,
		QuestionID: option.QuestionID,
	}

	return result
}
