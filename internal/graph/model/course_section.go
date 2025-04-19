package model

import "template/internal/ent"

func ConvertCourseSectionToModel(cs *ent.CourseSection) *CourseSection {
	return &CourseSection{
		ID:          cs.ID.String(),
		Title:       cs.Title,
		Description: cs.Description,
	}
}
