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

// TestCourseSectionParentValidation tests complex parent-child relationship validation
func TestCourseSectionParentValidation(t *testing.T) {
	// Setup test database
	dbSchema := utils.RandomDbSchema()
	setup.ResetTestSchema(t, dbSchema)
	defer setup.DeleteTestSchema(t, dbSchema)

	ctx := context.Background()

	userEntity := prepare.CreateUser(t, model.RegisterInput{
		Email:    "user@parentvalidation.com",
		Password: "testpassword123",
	})
	userID := userEntity.ID

	testCourse1, err := course.CreateCourse(ctx, userID, model.CreateCourseInput{
		Title:       "Course 1",
		Description: utils.Ptr("First course"),
	})
	require.NoError(t, err, "Test course1 creation should succeed")

	testCourse2, err := course.CreateCourse(ctx, userID, model.CreateCourseInput{
		Title:       "Course 2",
		Description: utils.Ptr("Second course"),
	})
	require.NoError(t, err, "Test course2 creation should succeed")

	// Create sections for testing
	rootSectionInput := model.CreateCourseSectionInput{
		Title:       "Root Section",
		Description: "Root section for testing",
		CourseID:    testCourse1.ID,
		SectionID:   nil,
	}
	rootSection, err := course_section.CreateCourseSection(ctx, userID, testCourse1.ID, rootSectionInput)
	require.NoError(t, err, "Root section creation should succeed")

	childSectionInput := model.CreateCourseSectionInput{
		Title:       "Child Section",
		Description: "Child section for testing",
		CourseID:    testCourse1.ID,
		SectionID:   &rootSection.ID,
	}
	childSection, err := course_section.CreateCourseSection(ctx, userID, testCourse1.ID, childSectionInput)
	require.NoError(t, err, "Child section creation should succeed")

	// Create section in different course
	otherCourseSectionInput := model.CreateCourseSectionInput{
		Title:       "Other Course Section",
		Description: "Section in different course",
		CourseID:    testCourse2.ID,
		SectionID:   nil,
	}
	otherCourseSection, err := course_section.CreateCourseSection(ctx, userID, testCourse2.ID, otherCourseSectionInput)
	require.NoError(t, err, "Other course section creation should succeed")

	tests := []struct {
		name     string
		testFunc func(t *testing.T)
	}{
		{
			name: "CreateCourseSection_InvalidParentSection_NonExistent",
			testFunc: func(t *testing.T) {
				nonExistentSectionID := uuid.New()
				createInput := model.CreateCourseSectionInput{
					Title:       "Test Section",
					Description: "Test description",
					CourseID:    testCourse1.ID,
					SectionID:   &nonExistentSectionID,
				}

				section, err := course_section.CreateCourseSection(ctx, userID, testCourse1.ID, createInput)
				assert.Error(t, err, "Section creation with non-existent parent should fail")
				assert.Nil(t, section, "Section should be nil for invalid parent")
				assert.Contains(t, err.Error(), "invalid sectionId: section not found", "Error should indicate parent section not found")
			},
		},
		{
			name: "CreateCourseSection_InvalidParentSection_DifferentCourse",
			testFunc: func(t *testing.T) {
				createInput := model.CreateCourseSectionInput{
					Title:       "Test Section",
					Description: "Test description",
					CourseID:    testCourse1.ID,
					SectionID:   &otherCourseSection.ID, // Parent from different course
				}

				section, err := course_section.CreateCourseSection(ctx, userID, testCourse1.ID, createInput)
				assert.Error(t, err, "Section creation with parent from different course should fail")
				assert.Nil(t, section, "Section should be nil for invalid parent")
				assert.Contains(t, err.Error(), "section must belong to the same course", "Error should indicate course mismatch")
			},
		},
		{
			name: "CreateCourseSection_InvalidParentSection_NonRootParent",
			testFunc: func(t *testing.T) {
				createInput := model.CreateCourseSectionInput{
					Title:       "Test Section",
					Description: "Test description",
					CourseID:    testCourse1.ID,
					SectionID:   &childSection.ID, // Parent is not a root section
				}

				section, err := course_section.CreateCourseSection(ctx, userID, testCourse1.ID, createInput)
				assert.Error(t, err, "Section creation with non-root parent should fail")
				assert.Nil(t, section, "Section should be nil for non-root parent")
				assert.Contains(t, err.Error(), "the section cannot be the child of a non-root section", "Error should indicate non-root parent restriction")
			},
		},
		{
			name: "UpdateCourseSection_SelfReference",
			testFunc: func(t *testing.T) {
				updateInput := model.UpdateCourseSectionInput{
					SectionID: &rootSection.ID, // Trying to make section parent of itself
				}

				section, err := course_section.UpdateCourseSection(ctx, userID, rootSection.ID, updateInput)
				assert.Error(t, err, "Section update with self-reference should fail")
				assert.Nil(t, section, "Section should be nil for self-reference")
				assert.Contains(t, err.Error(), "the section cannot be the child of itself", "Error should indicate self-reference restriction")
			},
		},
		{
			name: "UpdateCourseSection_InvalidParentSection_DifferentCourse",
			testFunc: func(t *testing.T) {
				updateInput := model.UpdateCourseSectionInput{
					SectionID: &otherCourseSection.ID, // Parent from different course
				}

				section, err := course_section.UpdateCourseSection(ctx, userID, rootSection.ID, updateInput)
				assert.Error(t, err, "Section update with parent from different course should fail")
				assert.Nil(t, section, "Section should be nil for invalid parent")
				assert.Contains(t, err.Error(), "sectionId must belong to the same course", "Error should indicate course mismatch")
			},
		},
		{
			name: "UpdateCourseSection_InvalidParentSection_NonRootParent",
			testFunc: func(t *testing.T) {
				updateInput := model.UpdateCourseSectionInput{
					SectionID: &childSection.ID, // Parent is not a root section
				}

				section, err := course_section.UpdateCourseSection(ctx, userID, rootSection.ID, updateInput)
				assert.Error(t, err, "Section update with non-root parent should fail")
				assert.Nil(t, section, "Section should be nil for non-root parent")
				assert.Contains(t, err.Error(), "the section cannot be the child of a non-root section", "Error should indicate non-root parent restriction")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, tt.testFunc)
	}
}
