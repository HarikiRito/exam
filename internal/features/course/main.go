package course

import (
	"context"
	"template/internal/ent"
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
