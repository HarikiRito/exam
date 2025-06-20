package test

import (
	"context"
	"errors"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/test"
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

	if input.TotalTime == 0 {
		return nil, errors.New("total_time must be greater than 0")
	}

	// Build the creation with required Name field
	query := client.Test.Create().SetName(input.Name).
		SetNillableCourseSectionID(input.CourseSectionID).
		SetNillableCourseID(input.CourseID).SetTotalTime(input.TotalTime)

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

	// Verify the test exists
	_, err = client.Test.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	update := client.Test.UpdateOneID(id).
		SetNillableName(input.Name).
		SetNillableTotalTime(input.TotalTime)

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

	return client.Test.Get(ctx, id)
}

// GetTestsByIDs fetches multiple tests by their IDs.
func GetTestsByIDs(ctx context.Context, ids []uuid.UUID) ([]*ent.Test, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	return client.Test.Query().Where(test.IDIn(ids...)).All(ctx)
}

// PaginatedTests returns a paginated list of tests.
func PaginatedTests(ctx context.Context, input *model.PaginationInput) (*common.PaginatedResult[*ent.Test], error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	query := client.Test.Query()

	// Use default pagination if not provided
	newInput := common.FallbackValue(input, common.DefaultPaginationInput)

	return common.EntQueryPaginated(ctx, query, *newInput.Page, *newInput.Limit)
}
