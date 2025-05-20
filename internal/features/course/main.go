package course

import (
	"context"
	"errors"
	"template/internal/ent"
	"template/internal/ent/course"
	"template/internal/ent/db"
	"template/internal/features/common"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// CreateCourse creates a new course with the given input and userId as the creator.
func CreateCourse(ctx context.Context, userId uuid.UUID, input model.CreateCourseInput) (*ent.Course, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	course, err := client.Course.Create().
		SetTitle(input.Title).
		SetNillableDescription(input.Description).
		SetCreatorID(userId).
		Save(ctx)
	if err != nil {
		return nil, err
	}

	return course, nil
}

// GetCourseByID fetches a course by its ID.
func GetCourseByID(ctx context.Context, courseID uuid.UUID) (*ent.Course, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	return client.Course.Get(ctx, courseID)
}

// UpdateCourse updates a course by its ID with the provided input, only if the user is the creator.
func UpdateCourse(ctx context.Context, userId uuid.UUID, courseID uuid.UUID, input model.UpdateCourseInput) (*ent.Course, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	course, err := client.Course.Get(ctx, courseID)
	if err != nil {
		return nil, err
	}
	if course.CreatorID != userId {
		return nil, errors.New("unauthorized: only the creator can update this course")
	}

	update := client.Course.UpdateOneID(courseID)
	update.SetNillableTitle(input.Title)
	update.SetNillableDescription(input.Description)
	return update.Save(ctx)
}

// RemoveCourse deletes a course by its ID, only if the user is the creator.
func RemoveCourse(ctx context.Context, userId uuid.UUID, courseID uuid.UUID) (bool, error) {
	client, err := db.OpenClient()
	if err != nil {
		return false, err
	}
	defer client.Close()

	crs, err := client.Course.Get(ctx, courseID)
	if err != nil {
		return false, err
	}
	if crs.CreatorID != userId {
		return false, errors.New("unauthorized: only the creator can delete this course")
	}

	err = client.Course.DeleteOneID(courseID).Exec(ctx)
	if err != nil {
		return false, err
	}
	return true, nil
}

// PaginatedCourses returns a paginated list of courses.
func PaginatedCourses(ctx context.Context, userId uuid.UUID, input *model.PaginationInput) (*common.PaginatedResult[*ent.Course], error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	query := client.Course.Query()
	query = query.Where(course.CreatorID(userId))
	if input != nil && input.Search != nil && *input.Search != "" {
		query = query.Where(course.TitleContains(*input.Search))
	}

	newInput := common.FallbackValue(input, common.DefaultPaginationInput)

	return common.EntQueryPaginated(ctx, query, newInput.Page, newInput.Limit)
}
