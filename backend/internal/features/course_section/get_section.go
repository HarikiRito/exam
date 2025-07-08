package course_section

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/course"
	"template/internal/ent/coursesection"
	"template/internal/ent/db"

	"github.com/google/uuid"
)

// GetCourseSectionByID fetches a course section by its ID, only if the user is the course creator.
func GetCourseSectionByID(ctx context.Context, userId uuid.UUID, sectionId uuid.UUID) (*ent.CourseSection, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	section, err := client.CourseSection.Query().
		Where(coursesection.ID(sectionId), coursesection.HasCourseWith(course.CreatorID(userId))).
		Select(coursesection.FieldID, coursesection.FieldTitle, coursesection.FieldDescription, coursesection.FieldOrder).
		First(ctx)
	if err != nil {
		return nil, err
	}
	return section, nil
}

// GetCourseSectionsByIDs fetches multiple course sections by their IDs, only if the user is the course creator.
func GetCourseSectionsByIDs(ctx context.Context, sectionIDs []uuid.UUID) ([]*ent.CourseSection, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	sections, err := client.CourseSection.Query().
		Where(coursesection.IDIn(sectionIDs...)).
		Select(coursesection.FieldID, coursesection.FieldTitle, coursesection.FieldDescription, coursesection.FieldOrder).
		All(ctx)
	if err != nil {
		return nil, err
	}
	return sections, nil
}
