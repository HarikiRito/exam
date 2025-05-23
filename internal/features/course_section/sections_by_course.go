package course_section

import (
	"context"
	"errors"
	"template/internal/ent"
	"template/internal/ent/course"
	"template/internal/ent/coursesection"
	"template/internal/ent/db"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// GetCourseSectionsByCourseID retrieves all course sections for a specific course ID.
// The function performs authorization check to ensure the user is the course creator.
// If filter.onlyRoot is true, only returns sections that don't have a parent section.
func GetCourseSectionsByCourseID(ctx context.Context, userId uuid.UUID, courseId uuid.UUID, filter *model.CourseSectionFilterInput) ([]*ent.CourseSection, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	// Check if the user is the course creator
	crs, err := client.Course.Query().Select(course.FieldCreatorID).Where(course.ID(courseId)).First(ctx)
	if err != nil {
		return nil, err
	}
	if crs.CreatorID != userId {
		return nil, errors.New("unauthorized: only the course creator can view sections")
	}

	// Build the query
	query := client.CourseSection.Query().
		Where(
			coursesection.HasCourseWith(course.ID(courseId), course.CreatorID(userId)),
		)

	// Apply filter if provided
	if filter != nil && filter.OnlyRoot != nil && *filter.OnlyRoot {
		query = query.Where(coursesection.SectionIDIsNil())
	}

	// Execute the query
	sections, err := query.All(ctx)
	if err != nil {
		return nil, err
	}

	return sections, nil
}
