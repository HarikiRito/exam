package model

import (
	"template/internal/ent"
	"time"
)

type Course struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	CreatorID   string    `json:"creatorId"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func ConvertCourseToModel(c *ent.Course) *Course {
	return &Course{
		ID:          c.ID.String(),
		Title:       c.Title,
		Description: c.Description,
		CreatorID:   c.CreatorID.String(),
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
	}
}
