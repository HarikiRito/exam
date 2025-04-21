package model

import "template/internal/ent"

func ConvertCourseSectionToModel(cs *ent.CourseSection) *CourseSection {
	return &CourseSection{
		ID:          cs.ID.String(),
		Title:       cs.Title,
		Description: cs.Description,
	}
}

type CourseSection struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	CourseID    string `json:"courseId"`
}
