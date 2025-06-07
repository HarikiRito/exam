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

// TestCourseSectionEdgeCases tests edge cases and special scenarios
func TestCourseSectionEdgeCases(t *testing.T) {
	// Setup test database
	dbSchema := utils.RandomDbSchema()
	setup.ResetTestSchema(t, dbSchema)
	defer setup.DeleteTestSchema(t, dbSchema)

	ctx := context.Background()

	// Create test user
	userInput := model.RegisterInput{
		Email:    "user@edgecases.com",
		Password: "testpassword123",
	}
	userEntity := prepare.CreateUser(t, userInput)
	userID := userEntity.ID

	// Create test course
	createCourseInput := model.CreateCourseInput{
		Title:       "Course for Edge Cases",
		Description: utils.Ptr("A course to test edge cases"),
	}
	testCourse, err := course.CreateCourse(ctx, userID, createCourseInput)
	require.NoError(t, err, "Test course creation should succeed")

	tests := []struct {
		name     string
		testFunc func(t *testing.T)
	}{
		{
			name: "CreateCourseSection_MinimalData",
			testFunc: func(t *testing.T) {
				// Test section creation with minimal required data
				createInput := model.CreateCourseSectionInput{
					Title:       "Minimal Section",
					Description: "", // Empty description
					CourseID:    testCourse.ID,
					SectionID:   nil,
				}

				section, err := course_section.CreateCourseSection(ctx, userID, testCourse.ID, createInput)
				assert.NoError(t, err, "Section creation with minimal data should succeed")
				assert.NotNil(t, section, "Section should not be nil")
				assert.Equal(t, "", *section.Description, "Empty description should be preserved")
			},
		},
		{
			name: "UpdateCourseSection_PartialUpdate",
			testFunc: func(t *testing.T) {
				// Create a section first
				createInput := model.CreateCourseSectionInput{
					Title:       "Original Title",
					Description: "Original Description",
					CourseID:    testCourse.ID,
					SectionID:   nil,
				}
				originalSection, err := course_section.CreateCourseSection(ctx, userID, testCourse.ID, createInput)
				require.NoError(t, err, "Section creation should succeed")

				// Test partial update (only title)
				updateInput := model.UpdateCourseSectionInput{
					Title: utils.Ptr("Updated Title Only"),
					// Description and SectionID are omitted
				}

				updatedSection, err := course_section.UpdateCourseSection(ctx, userID, originalSection.ID, updateInput)
				assert.NoError(t, err, "Partial section update should succeed")
				assert.NotNil(t, updatedSection, "Updated section should not be nil")
				assert.Equal(t, *updateInput.Title, updatedSection.Title, "Section title should be updated")
				assert.Equal(t, originalSection.Description, updatedSection.Description, "Section description should remain unchanged")
				assert.Equal(t, originalSection.SectionID, updatedSection.SectionID, "Section parent should remain unchanged")
			},
		},
		{
			name: "GetCourseSectionsByCourseID_EmptyResults",
			testFunc: func(t *testing.T) {
				// Create a course with no sections
				emptyCourseInput := model.CreateCourseInput{
					Title:       "Empty Course",
					Description: utils.Ptr("A course with no sections"),
				}
				emptyCourse, err := course.CreateCourse(ctx, userID, emptyCourseInput)
				require.NoError(t, err, "Empty course creation should succeed")

				// Test retrieving sections from empty course
				sections, err := course_section.GetCourseSectionsByCourseID(ctx, userID, emptyCourse.ID, nil)
				assert.NoError(t, err, "Sections retrieval from empty course should succeed")
				assert.Empty(t, sections, "Sections list should be empty")
				assert.Len(t, sections, 0, "Should return empty slice")
			},
		},
		{
			name: "GetCourseSectionsByIDs_MixedValidInvalid",
			testFunc: func(t *testing.T) {
				// Create a section
				createInput := model.CreateCourseSectionInput{
					Title:       "Valid Section",
					Description: "A valid section for testing",
					CourseID:    testCourse.ID,
					SectionID:   nil,
				}
				validSection, err := course_section.CreateCourseSection(ctx, userID, testCourse.ID, createInput)
				require.NoError(t, err, "Valid section creation should succeed")

				// Test with mix of valid and invalid IDs
				invalidID := uuid.New()
				sections, err := course_section.GetCourseSectionsByIDs(ctx, []uuid.UUID{validSection.ID, invalidID})
				assert.NoError(t, err, "GetCourseSectionsByIDs should succeed even with some invalid IDs")
				assert.Len(t, sections, 1, "Should return only the valid section")
				assert.Equal(t, validSection.ID, sections[0].ID, "Returned section should be the valid one")
			},
		},
		{
			name: "GetCourseSectionsByIDs_EmptyIDs",
			testFunc: func(t *testing.T) {
				// Test with empty IDs slice
				sections, err := course_section.GetCourseSectionsByIDs(ctx, []uuid.UUID{})
				assert.NoError(t, err, "GetCourseSectionsByIDs with empty IDs should succeed")
				assert.Empty(t, sections, "Should return empty slice for empty IDs")
			},
		},
		{
			name: "RemoveCourseSection_NoChildren",
			testFunc: func(t *testing.T) {
				// Create a section without children
				createInput := model.CreateCourseSectionInput{
					Title:       "Lonely Section",
					Description: "A section with no children",
					CourseID:    testCourse.ID,
					SectionID:   nil,
				}
				lonelySection, err := course_section.CreateCourseSection(ctx, userID, testCourse.ID, createInput)
				require.NoError(t, err, "Lonely section creation should succeed")

				// Remove the section
				success, err := course_section.RemoveCourseSection(ctx, userID, lonelySection.ID)
				assert.NoError(t, err, "Section removal should succeed")
				assert.True(t, success, "Removal should return true")

				// Verify section no longer exists
				deletedSection, err := course_section.GetCourseSectionByID(ctx, userID, lonelySection.ID)
				assert.Error(t, err, "Section retrieval after deletion should fail")
				assert.Nil(t, deletedSection, "Deleted section should be nil")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, tt.testFunc)
	}
}
