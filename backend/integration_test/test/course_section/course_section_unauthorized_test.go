package course_section

import (
	"context"
	"template/integration_test/prepare"
	"template/integration_test/utils"
	"template/internal/features/course"
	"template/internal/features/course_section"
	"template/internal/graph/model"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestCourseSectionUnauthorizedAccess tests that non-course-owners cannot access course sections
func TestCourseSectionUnauthorizedAccess(t *testing.T) {
	// Setup test database
	prepare.SetupTestDb(t)

	ctx := context.Background()

	// Create test users
	user1Input := model.RegisterInput{
		Email:    "owner@unauthorized.com",
		Password: "testpassword123",
	}
	user1Entity := prepare.CreateUser(t, user1Input)
	user1ID := user1Entity.ID

	user2Input := model.RegisterInput{
		Email:    "nonowner@unauthorized.com",
		Password: "testpassword456",
	}
	user2Entity := prepare.CreateUser(t, user2Input)
	user2ID := user2Entity.ID

	// Create a test course by user1
	createCourseInput := model.CreateCourseInput{
		Title:       "Course for Unauthorized Test",
		Description: utils.Ptr("A course to test unauthorized access"),
	}
	testCourse, err := course.CreateCourse(ctx, user1ID, createCourseInput)
	require.NoError(t, err, "Test course creation should succeed")

	// Create a section by the owner
	createSectionInput := model.CreateCourseSectionInput{
		Title:       "Test Section",
		Description: "A test section",
		CourseID:    testCourse.ID,
		SectionID:   nil,
	}
	testSection, err := course_section.CreateCourseSection(ctx, user1ID, testCourse.ID, createSectionInput)
	require.NoError(t, err, "Test section creation should succeed")

	tests := []struct {
		name     string
		testFunc func(t *testing.T)
	}{
		{
			name: "CreateCourseSection_Unauthorized",
			testFunc: func(t *testing.T) {
				createInput := model.CreateCourseSectionInput{
					Title:       "Unauthorized Section",
					Description: "This should fail",
					CourseID:    testCourse.ID,
					SectionID:   nil,
				}

				section, err := course_section.CreateCourseSection(ctx, user2ID, testCourse.ID, createInput)
				assert.Error(t, err, "Section creation by non-owner should fail")
				assert.Nil(t, section, "Section should be nil for unauthorized user")
				assert.Contains(t, err.Error(), "unauthorized", "Error should indicate unauthorized access")
				assert.Contains(t, err.Error(), "only the course creator", "Error should specify creator-only access")
			},
		},
		{
			name: "GetCourseSectionByID_Unauthorized",
			testFunc: func(t *testing.T) {
				section, err := course_section.GetCourseSectionByID(ctx, user2ID, testSection.ID)
				assert.Error(t, err, "Section retrieval by non-owner should fail")
				assert.Nil(t, section, "Section should be nil for unauthorized user")
			},
		},
		{
			name: "GetCourseSectionsByCourseID_Unauthorized",
			testFunc: func(t *testing.T) {
				sections, err := course_section.GetCourseSectionsByCourseID(ctx, user2ID, testCourse.ID, nil)
				assert.Error(t, err, "Sections retrieval by non-owner should fail")
				assert.Nil(t, sections, "Sections should be nil for unauthorized user")
				assert.Contains(t, err.Error(), "unauthorized", "Error should indicate unauthorized access")
				assert.Contains(t, err.Error(), "only the course creator", "Error should specify creator-only access")
			},
		},
		{
			name: "UpdateCourseSection_Unauthorized",
			testFunc: func(t *testing.T) {
				updateInput := model.UpdateCourseSectionInput{
					Title: utils.Ptr("Unauthorized Update"),
				}

				section, err := course_section.UpdateCourseSection(ctx, user2ID, testSection.ID, updateInput)
				assert.Error(t, err, "Section update by non-owner should fail")
				assert.Nil(t, section, "Section should be nil for unauthorized user")
			},
		},
		{
			name: "RemoveCourseSection_Unauthorized",
			testFunc: func(t *testing.T) {
				success, err := course_section.RemoveCourseSection(ctx, user2ID, testSection.ID)
				assert.Error(t, err, "Section removal by non-owner should fail")
				assert.False(t, success, "Removal should not succeed for unauthorized user")
				assert.Contains(t, err.Error(), "unauthorized", "Error should indicate unauthorized access")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, tt.testFunc)
	}
}
