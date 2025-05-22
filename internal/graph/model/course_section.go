package model

import (
	"template/internal/ent"

	"github.com/google/uuid"
)

func ConvertCourseSectionToModel(cs *ent.CourseSection) *CourseSection {
	return &CourseSection{
		ID:          cs.ID,
		Title:       cs.Title,
		Description: cs.Description,
		CourseID:    cs.CourseID,
		SectionID:   cs.SectionID,
	}
}

type CourseSection struct {
	ID          uuid.UUID  `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	CourseID    uuid.UUID  `json:"courseId"`
	SectionID   *uuid.UUID `json:"sectionId"`
}
