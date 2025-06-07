package course

import (
	"context"
	"template/integration_test/prepare"
	"template/integration_test/setup"
	"template/internal/ent"
	"template/internal/features/course"
	"template/internal/graph/model"
	"testing"

	"template/integration_test/utils"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCourseIntegration(t *testing.T) {
	// Setup test database
	dbSchema := utils.RandomDbSchema()
	setup.ResetTestSchema(t, dbSchema)
	t.Cleanup(func() {
		setup.DeleteTestSchema(t, dbSchema)
	})

	// Create test users
	ctx := context.Background()

	user1Input := model.RegisterInput{
		Email:    "user1@test.com",
		Password: "testpassword123",
	}
	user1Entity := prepare.CreateUser(t, user1Input)
	user1ID := user1Entity.ID

	user2Input := model.RegisterInput{
		Email:    "user2@test.com",
		Password: "testpassword456",
	}
	user2Entity := prepare.CreateUser(t, user2Input)
	user2ID := user2Entity.ID

	var createdCourse *ent.Course
	t.Run("CreateCourse_Success", func(t *testing.T) {
		// Test successful course creation
		createInput := model.CreateCourseInput{
			Title:       "Introduction to Programming",
			Description: utils.Ptr("A comprehensive course covering programming fundamentals"),
		}

		course, err := course.CreateCourse(ctx, user1ID, createInput)
		assert.NoError(t, err, "Course creation should succeed")
		assert.NotNil(t, course, "Created course should not be nil")
		assert.Equal(t, createInput.Title, course.Title, "Course title should match input")
		assert.Equal(t, createInput.Description, course.Description, "Course description should match input")
		assert.Equal(t, user1ID, course.CreatorID, "Course creator ID should match user1")
		assert.NotEqual(t, uuid.Nil, course.ID, "Course ID should be generated")
		assert.False(t, course.CreatedAt.IsZero(), "Course should have creation timestamp")
		assert.False(t, course.UpdatedAt.IsZero(), "Course should have update timestamp")

		// Store for subsequent tests
		createdCourse = course
	})

	t.Run("GetCourse_Success", func(t *testing.T) {
		require.NotNil(t, createdCourse, "Course should exist from previous test")

		// Test successful course retrieval
		retrievedCourse, err := course.GetCourseByID(ctx, createdCourse.ID)
		assert.NoError(t, err, "Course retrieval should succeed")
		assert.NotNil(t, retrievedCourse, "Retrieved course should not be nil")
		assert.Equal(t, createdCourse.ID, retrievedCourse.ID, "Course IDs should match")
		assert.Equal(t, createdCourse.Title, retrievedCourse.Title, "Course titles should match")
		assert.Equal(t, createdCourse.Description, retrievedCourse.Description, "Course descriptions should match")
		assert.Equal(t, createdCourse.CreatorID, retrievedCourse.CreatorID, "Course creator IDs should match")
	})

	// AI: Separate this test
	t.Run("GetCourse_InvalidID_Error", func(t *testing.T) {
		// Test course retrieval with invalid/non-existent ID
		nonExistentID := uuid.New()

		retrievedCourse, err := course.GetCourseByID(ctx, nonExistentID)
		assert.Error(t, err, "Course retrieval with invalid ID should fail")
		assert.Nil(t, retrievedCourse, "Retrieved course should be nil for invalid ID")

		// Verify it's a "not found" type error
		assert.Contains(t, err.Error(), "not found", "Error should indicate course was not found")
	})

	t.Run("UpdateCourse_Success_ByCreator", func(t *testing.T) {
		require.NotNil(t, createdCourse, "Course should exist from previous test")

		// Test successful course update by creator
		updateInput := model.UpdateCourseInput{
			Title:       utils.Ptr("Advanced Programming Concepts"),
			Description: utils.Ptr("An updated comprehensive course covering advanced programming topics"),
		}

		updatedCourse, err := course.UpdateCourse(ctx, user1ID, createdCourse.ID, updateInput)
		assert.NoError(t, err, "Course update by creator should succeed")
		assert.NotNil(t, updatedCourse, "Updated course should not be nil")
		assert.Equal(t, *updateInput.Title, updatedCourse.Title, "Course title should be updated")
		assert.Equal(t, *updateInput.Description, *updatedCourse.Description, "Course description should be updated")
		assert.Equal(t, user1ID, updatedCourse.CreatorID, "Course creator ID should remain unchanged")
		assert.Equal(t, createdCourse.ID, updatedCourse.ID, "Course ID should remain unchanged")

		// Update our reference for subsequent tests
		createdCourse = updatedCourse
	})

	t.Run("UpdateCourse_Unauthorized_ByNonCreator", func(t *testing.T) {
		require.NotNil(t, createdCourse, "Course should exist from previous test")

		// Test course update by non-creator (should fail)
		updateInput := model.UpdateCourseInput{
			Title:       utils.Ptr("Unauthorized Update"),
			Description: utils.Ptr("This update should fail"),
		}

		updatedCourse, err := course.UpdateCourse(ctx, user2ID, createdCourse.ID, updateInput)
		assert.Error(t, err, "Course update by non-creator should fail")
		assert.Nil(t, updatedCourse, "Updated course should be nil for unauthorized user")

		// Verify it's an authorization error
		assert.Contains(t, err.Error(), "unauthorized", "Error should indicate unauthorized access")
		assert.Contains(t, err.Error(), "only the creator can update", "Error should specify creator-only access")
	})

	t.Run("UpdateCourse_InvalidID_Error", func(t *testing.T) {
		// Test course update with invalid/non-existent ID
		nonExistentID := uuid.New()
		updateInput := model.UpdateCourseInput{
			Title: utils.Ptr("This Should Fail"),
		}

		updatedCourse, err := course.UpdateCourse(ctx, user1ID, nonExistentID, updateInput)
		assert.Error(t, err, "Course update with invalid ID should fail")
		assert.Nil(t, updatedCourse, "Updated course should be nil for invalid ID")

		// Verify it's a "not found" type error
		assert.Contains(t, err.Error(), "not found", "Error should indicate course was not found")
	})

	t.Run("RemoveCourse_Unauthorized_ByNonCreator", func(t *testing.T) {
		require.NotNil(t, createdCourse, "Course should exist from previous test")

		// Test course deletion by non-creator (should fail)
		success, err := course.RemoveCourse(ctx, user2ID, createdCourse.ID)
		assert.Error(t, err, "Course deletion by non-creator should fail")
		assert.False(t, success, "Deletion should not succeed for unauthorized user")

		// Verify it's an authorization error
		assert.Contains(t, err.Error(), "unauthorized", "Error should indicate unauthorized access")
		assert.Contains(t, err.Error(), "only the creator can delete", "Error should specify creator-only access")

		// Verify course still exists
		existingCourse, err := course.GetCourseByID(ctx, createdCourse.ID)
		assert.NoError(t, err, "Course should still exist after failed deletion")
		assert.NotNil(t, existingCourse, "Course should not be nil after failed deletion")
	})

	// AI: Separate this test
	t.Run("RemoveCourse_InvalidID_Error", func(t *testing.T) {
		// Test course deletion with invalid/non-existent ID
		nonExistentID := uuid.New()

		success, err := course.RemoveCourse(ctx, user1ID, nonExistentID)
		assert.Error(t, err, "Course deletion with invalid ID should fail")
		assert.False(t, success, "Deletion should not succeed for invalid ID")

		// Verify it's a "not found" type error
		assert.Contains(t, err.Error(), "not found", "Error should indicate course was not found")
	})

	t.Run("RemoveCourse_Success_ByCreator", func(t *testing.T) {
		require.NotNil(t, createdCourse, "Course should exist from previous test")

		// Test successful course deletion by creator
		success, err := course.RemoveCourse(ctx, user1ID, createdCourse.ID)
		assert.NoError(t, err, "Course deletion by creator should succeed")
		assert.True(t, success, "Deletion should succeed for creator")

		// Verify course no longer exists
		deletedCourse, err := course.GetCourseByID(ctx, createdCourse.ID)
		assert.Error(t, err, "Course retrieval after deletion should fail")
		assert.Nil(t, deletedCourse, "Deleted course should be nil")

		// Verify it's a "not found" type error
		assert.Contains(t, err.Error(), "not found", "Error should indicate course was not found")
	})

	// AI: Separate this test
	t.Run("CreateCourse_EdgeCases", func(t *testing.T) {
		// Test course creation with minimal data (no description)
		minimalInput := model.CreateCourseInput{
			Title: "Minimal Course",
			// Description is omitted (nil)
		}

		minimalCourse, err := course.CreateCourse(ctx, user1ID, minimalInput)
		assert.NoError(t, err, "Course creation with minimal data should succeed")
		assert.NotNil(t, minimalCourse, "Minimal course should not be nil")
		assert.Equal(t, minimalInput.Title, minimalCourse.Title, "Course title should match input")
		assert.Nil(t, minimalCourse.Description, "Course description should be nil when not provided")

		// Clean up
		_, err = course.RemoveCourse(ctx, user1ID, minimalCourse.ID)
		assert.NoError(t, err, "Cleanup should succeed")
	})

	// AI: Separate this test
	t.Run("UpdateCourse_PartialUpdate", func(t *testing.T) {
		// Create a new course for partial update test
		createInput := model.CreateCourseInput{
			Title:       "Original Title",
			Description: utils.Ptr("Original Description"),
		}

		originalCourse, err := course.CreateCourse(ctx, user1ID, createInput)
		assert.NoError(t, err, "Course creation should succeed")

		// Test partial update (only title)
		partialUpdateInput := model.UpdateCourseInput{
			Title: utils.Ptr("Updated Title Only"),
			// Description is omitted (nil)
		}

		updatedCourse, err := course.UpdateCourse(ctx, user1ID, originalCourse.ID, partialUpdateInput)
		assert.NoError(t, err, "Partial course update should succeed")
		assert.NotNil(t, updatedCourse, "Partially updated course should not be nil")
		assert.Equal(t, *partialUpdateInput.Title, updatedCourse.Title, "Course title should be updated")
		assert.Equal(t, originalCourse.Description, updatedCourse.Description, "Course description should remain unchanged")

		// Clean up
		_, err = course.RemoveCourse(ctx, user1ID, updatedCourse.ID)
		assert.NoError(t, err, "Cleanup should succeed")
	})
}
