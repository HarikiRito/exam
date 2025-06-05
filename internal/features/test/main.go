package test

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/features/common"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// CreateTest creates a new test with the given input.
func CreateTest(ctx context.Context, input model.CreateTestInput) (*ent.Test, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	// Build the creation with required Name field
	query := client.Test.Create().SetName(input.Name).
		SetNillableCourseSectionID(input.CourseSectionID).
		SetNillableCourseID(input.CourseID)

	testEntity, err := query.Save(ctx)
	if err != nil {
		return nil, err
	}

	return testEntity, nil
}

// UpdateTest updates an existing test by its ID.
func UpdateTest(ctx context.Context, id uuid.UUID, input model.UpdateTestInput) (*ent.Test, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	// Verify the test exists
	_, err = client.Test.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	update := client.Test.UpdateOneID(id).
		SetNillableName(input.Name).
		SetNillableCourseSectionID(input.CourseSectionID).
		SetNillableCourseID(input.CourseID)

	updatedTest, err := update.Save(ctx)
	if err != nil {
		return nil, err
	}

	return updatedTest, nil
}

// DeleteTest removes a test by its ID.
func DeleteTest(ctx context.Context, id uuid.UUID) (bool, error) {
	client, err := db.OpenClient()
	if err != nil {
		return false, err
	}
	defer client.Close()

	// Check if the test exists
	_, err = client.Test.Get(ctx, id)
	if err != nil {
		return false, err
	}

	// Delete the test
	err = client.Test.DeleteOneID(id).Exec(ctx)
	if err != nil {
		return false, err
	}

	return true, nil
}

// GetTestByID fetches a single test by its ID.
func GetTestByID(ctx context.Context, id uuid.UUID) (*ent.Test, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	return client.Test.Get(ctx, id)
}

// PaginatedTests returns a paginated list of tests.
func PaginatedTests(ctx context.Context, input *model.PaginationInput) (*common.PaginatedResult[*ent.Test], error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	query := client.Test.Query()

	// Use default pagination if not provided
	newInput := common.FallbackValue(input, common.DefaultPaginationInput)

	return common.EntQueryPaginated(ctx, query, *newInput.Page, *newInput.Limit)
}
