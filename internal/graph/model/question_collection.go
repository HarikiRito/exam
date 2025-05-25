package model

import (
	"template/internal/ent"
	"time"

	"github.com/google/uuid"
)

type QuestionCollection struct {
	ID          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Description *string   `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func ConvertQuestionCollectionToModel(qc *ent.QuestionCollection) *QuestionCollection {
	return &QuestionCollection{
		ID:          qc.ID,
		Title:       qc.Title,
		Description: qc.Description,
		CreatedAt:   qc.CreatedAt,
		UpdatedAt:   qc.UpdatedAt,
	}
}
