package course_section

import (
	"context"
	"template/integration_test/prepare"
	"template/integration_test/setup"
	"template/integration_test/utils"
	"template/internal/features/course"
	"template/internal/features/course_section"
	"template/internal/graph/model"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestCourseSectionInvalidIDs tests error handling for non-existent resources
func TestCourseSectionInvalidIDs(t *testing.T) {
	// Setup test database
	dbSchema := utils.RandomDbSchema()
	setup.ResetTestSchema(t, dbSchema)
	defer setup.DeleteTestSchema(t, dbSchema)

	ctx := context.Background()

	// Create test user
	userInput := model.RegisterInput{
		Email:    "user@invalidids.com",
		Password: "testpassword123",
	}
	userEntity := prepare.CreateUser(t, userInput)
	userID := userEntity.ID

	// Create a test course (not used in most tests since we're testing invalid IDs)
	createCourseInput := model.CreateCourseInput{
		Title:       "Course for Invalid ID Test",
		Description: utils.Ptr("A course to test invalid IDs"),
	}
	_, err := course.CreateCourse(ctx, userID, createCourseInput)
	require.NoError(t, err, "Test course creation should succeed")

	tests := []struct {
		name     string
		testFunc func(t *testing.T)
	}{
		{
			name: "CreateCourseSection_InvalidCourseID",
			testFunc: func(t *testing.T) {
				nonExistentCourseID := uuid.New()
				createInput := model.CreateCourseSectionInput{
					Title:       "Test Section",
					Description: "Test description",
					CourseID:    nonExistentCourseID,
					SectionID:   nil,
				}

				section, err := course_section.CreateCourseSection(ctx, userID, nonExistentCourseID, createInput)
				assert.Error(t, err, "Section creation with invalid course ID should fail")
				assert.Nil(t, section, "Section should be nil for invalid course ID")
				assert.Contains(t, err.Error(), "not found", "Error should indicate course not found")
			},
		},
		{
			name: "GetCourseSectionByID_InvalidSectionID",
			testFunc: func(t *testing.T) {
				nonExistentSectionID := uuid.New()

				section, err := course_section.GetCourseSectionByID(ctx, userID, nonExistentSectionID)
				assert.Error(t, err, "Section retrieval with invalid ID should fail")
				assert.Nil(t, section, "Section should be nil for invalid ID")
				assert.Contains(t, err.Error(), "not found", "Error should indicate section not found")
			},
		},
		{
			name: "GetCourseSectionsByCourseID_InvalidCourseID",
			testFunc: func(t *testing.T) {
				nonExistentCourseID := uuid.New()

				sections, err := course_section.GetCourseSectionsByCourseID(ctx, userID, nonExistentCourseID, nil)
				assert.Error(t, err, "Sections retrieval with invalid course ID should fail")
				assert.Nil(t, sections, "Sections should be nil for invalid course ID")
				assert.Contains(t, err.Error(), "not found", "Error should indicate course not found")
			},
		},
		{
			name: "UpdateCourseSection_InvalidSectionID",
			testFunc: func(t *testing.T) {
				nonExistentSectionID := uuid.New()
				updateInput := model.UpdateCourseSectionInput{
					Title: utils.Ptr("Updated Title"),
				}

				section, err := course_section.UpdateCourseSection(ctx, userID, nonExistentSectionID, updateInput)
				assert.Error(t, err, "Section update with invalid ID should fail")
				assert.Nil(t, section, "Section should be nil for invalid ID")
				assert.Contains(t, err.Error(), "not found", "Error should indicate section not found")
			},
		},
		{
			name: "RemoveCourseSection_InvalidSectionID",
			testFunc: func(t *testing.T) {
				nonExistentSectionID := uuid.New()

				success, err := course_section.RemoveCourseSection(ctx, userID, nonExistentSectionID)
				assert.Error(t, err, "Section removal with invalid ID should fail")
				assert.False(t, success, "Removal should not succeed for invalid ID")
				assert.Contains(t, err.Error(), "unauthorized", "Error should indicate unauthorized or not found")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, tt.testFunc)
	}
}
