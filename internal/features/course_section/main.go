package course_section

import (
	"context"
	"errors"
	"template/internal/ent"
	"template/internal/ent/course"
	"template/internal/ent/coursesection"
	"template/internal/ent/db"
	"template/internal/features/common"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// CreateCourseSection creates a new course section for a course, only if the user is the course creator.
func CreateCourseSection(ctx context.Context, userId uuid.UUID, courseId uuid.UUID, input model.CreateCourseSectionInput) (*ent.CourseSection, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	crs, err := client.Course.Get(ctx, courseId)
	if err != nil {
		return nil, err
	}
	if crs.CreatorID != userId {
		return nil, errors.New("unauthorized: only the course creator can add sections")
	}

	section, err := client.CourseSection.Create().
		SetCourseID(courseId).
		SetTitle(input.Title).
		SetDescription(input.Description).
		Save(ctx)
	if err != nil {
		return nil, err
	}
	return section, nil
}

// GetCourseSectionByID fetches a course section by its ID, only if the user is the course creator.
func GetCourseSectionByID(ctx context.Context, userId uuid.UUID, sectionId uuid.UUID) (*ent.CourseSection, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	section, err := client.CourseSection.Query().
		Where(coursesection.ID(sectionId), coursesection.HasCourseWith(course.CreatorID(userId))).
		Select(coursesection.FieldID, coursesection.FieldTitle, coursesection.FieldDescription).
		First(ctx)
	if err != nil {
		return nil, err
	}
	return section, nil
}

// UpdateCourseSection updates a course section, only if the user is the course creator.
func UpdateCourseSection(ctx context.Context, userId uuid.UUID, sectionId uuid.UUID, input model.UpdateCourseSectionInput) (*ent.CourseSection, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	section, err := client.CourseSection.Query().Where(coursesection.ID(sectionId), coursesection.HasCourseWith(course.CreatorID(userId))).First(ctx)
	if err != nil {
		return nil, err
	}

	section, err = section.Update().
		SetNillableTitle(input.Title).
		SetNillableDescription(input.Description).
		Save(ctx)
	if err != nil {
		return nil, err
	}
	return section, nil
}

// RemoveCourseSection deletes a course section, only if the user is the course creator.
func RemoveCourseSection(ctx context.Context, userId uuid.UUID, sectionId uuid.UUID) (bool, error) {
	client, err := db.OpenClient()
	if err != nil {
		return false, err
	}
	defer client.Close()

	exists, err := client.CourseSection.Query().Where(coursesection.ID(sectionId), coursesection.HasCourseWith(course.CreatorID(userId))).Exist(ctx)
	if err != nil {
		return false, err
	}
	if !exists {
		return false, errors.New("course section not found")
	}

	err = client.CourseSection.DeleteOneID(sectionId).Exec(ctx)
	if err != nil {
		return false, err
	}
	return true, nil
}

// PaginatedCourseSections returns a paginated list of course sections for a course, only if the user is the course creator.
func PaginatedCourseSections(ctx context.Context, userId uuid.UUID, page, limit int) (*common.PaginatedResult[*ent.CourseSection], error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	query := client.CourseSection.Query()
	return common.EntQueryPaginated(ctx, query, page, limit)
}

// GetCourseSectionsByCourseID retrieves all course sections for a specific course ID.
// The function performs authorization check to ensure the user is the course creator.
func GetCourseSectionsByCourseID(ctx context.Context, userId uuid.UUID, courseId uuid.UUID) ([]*ent.CourseSection, error) {
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

	// Query all sections for the specified course
	sections, err := client.CourseSection.Query().
		Where(
			coursesection.HasCourseWith(course.ID(courseId), course.CreatorID(userId)),
		).
		All(ctx)
	if err != nil {
		return nil, err
	}

	return sections, nil
}
