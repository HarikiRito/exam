package course

import (
	"context"
	"errors"
	"template/internal/ent"
	"template/internal/ent/course"
	"template/internal/ent/db"
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
		SetDescription(input.Description).
		SetCreatorID(userId).
		Save(ctx)
	if err != nil {
		return nil, err
	}

	return course, nil
}

// GetCourseByID fetches a course by its ID.
func GetCourseByID(ctx context.Context, courseID string) (*ent.Course, error) {
	id, err := uuid.Parse(courseID)
	if err != nil {
		return nil, err
	}

	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	return client.Course.Get(ctx, id)
}

// UpdateCourse updates a course by its ID with the provided input, only if the user is the creator.
func UpdateCourse(ctx context.Context, userId uuid.UUID, courseID string, input model.UpdateCourseInput) (*ent.Course, error) {
	id, err := uuid.Parse(courseID)
	if err != nil {
		return nil, err
	}

	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	course, err := client.Course.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if course.CreatorID != userId {
		return nil, errors.New("unauthorized: only the creator can update this course")
	}

	update := client.Course.UpdateOneID(id)
	update.SetNillableTitle(input.Title)
	update.SetNillableDescription(input.Description)
	return update.Save(ctx)
}

// RemoveCourse deletes a course by its ID, only if the user is the creator.
func RemoveCourse(ctx context.Context, userId uuid.UUID, courseID string) (bool, error) {
	id, err := uuid.Parse(courseID)
	if err != nil {
		return false, err
	}

	client, err := db.OpenClient()
	if err != nil {
		return false, err
	}
	defer client.Close()

	crs, err := client.Course.Get(ctx, id)
	if err != nil {
		return false, err
	}
	if crs.CreatorID != userId {
		return false, errors.New("unauthorized: only the creator can delete this course")
	}

	err = client.Course.DeleteOneID(id).Exec(ctx)
	if err != nil {
		return false, err
	}
	return true, nil
}

// PaginatedCourses returns a paginated list of courses.
func PaginatedCourses(ctx context.Context, input *model.PaginationInput) ([]*ent.Course, int, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, 0, err
	}
	defer client.Close()

	query := client.Course.Query()
	if input != nil && input.Search != nil && *input.Search != "" {
		query = query.Where(course.TitleContains(*input.Search))
	}

	total, err := query.Count(ctx)
	if err != nil {
		return nil, 0, err
	}

	page := 1
	limit := 10
	if input != nil {
		if input.Page > 0 {
			page = input.Page
		}
		if input.Limit > 0 {
			limit = input.Limit
		}
	}
	offset := (page - 1) * limit
	courses, err := query.Offset(offset).Limit(limit).All(ctx)
	if err != nil {
		return nil, 0, err
	}

	return courses, total, nil
}
