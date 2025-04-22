package model

import (
	"template/internal/ent"
	"time"

	"github.com/google/uuid"
)

type Course struct {
	ID          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	CreatorID   uuid.UUID `json:"creatorId"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func ConvertCourseToModel(c *ent.Course) *Course {
	return &Course{
		ID:          c.ID,
		Title:       c.Title,
		Description: c.Description,
		CreatorID:   c.CreatorID,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
	}
}
