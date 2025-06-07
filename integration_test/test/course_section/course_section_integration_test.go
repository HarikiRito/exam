package course_section

import (
	"context"
	"template/integration_test/prepare"
	"template/integration_test/setup"
	"template/integration_test/utils"
	"template/internal/ent"
	"template/internal/features/course"
	"template/internal/features/course_section"
	"template/internal/graph/model"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCourseSectionIntegration(t *testing.T) {
	// Setup test database
	dbSchema := utils.RandomDbSchema()
	setup.ResetTestSchema(t, dbSchema)
	defer setup.DeleteTestSchema(t, dbSchema)

	// Create test users
	ctx := context.Background()

	user1Input := model.RegisterInput{
		Email:    "user1@coursesection.com",
		Password: "testpassword123",
	}
	user1Entity := prepare.CreateUser(t, user1Input)
	user1ID := user1Entity.ID

	user2Input := model.RegisterInput{
		Email:    "user2@coursesection.com",
		Password: "testpassword456",
	}
	user2Entity := prepare.CreateUser(t, user2Input)
	user2ID := user2Entity.ID

	// Create a test course
	createCourseInput := model.CreateCourseInput{
		Title:       "Course for Section Testing",
		Description: utils.Ptr("A course to test sections"),
	}
	testCourse, err := course.CreateCourse(ctx, user1ID, createCourseInput)
	require.NoError(t, err, "Test course creation should succeed")

	// Create another course by user2 for later use
	createCourse2Input := model.CreateCourseInput{
		Title:       "User2's Course",
		Description: utils.Ptr("Another course by user2"),
	}
	_, err = course.CreateCourse(ctx, user2ID, createCourse2Input)
	require.NoError(t, err, "Test course2 creation should succeed")

	var createdRootSection *ent.CourseSection
	var createdChildSection *ent.CourseSection

	t.Run("CreateCourseSection_Success_RootSection", func(t *testing.T) {
		// Test successful root section creation
		createInput := model.CreateCourseSectionInput{
			Title:       "Introduction Section",
			Description: "This is an introduction section",
			CourseID:    testCourse.ID,
			SectionID:   nil, // Root section
		}

		section, err := course_section.CreateCourseSection(ctx, user1ID, testCourse.ID, createInput)
		assert.NoError(t, err, "Root section creation should succeed")
		assert.NotNil(t, section, "Created section should not be nil")
		assert.Equal(t, createInput.Title, section.Title, "Section title should match input")
		assert.Equal(t, createInput.Description, *section.Description, "Section description should match input")
		assert.Equal(t, testCourse.ID, section.CourseID, "Section course ID should match")
		assert.Nil(t, section.SectionID, "Root section should have nil parent")
		assert.Equal(t, 1, section.Order, "First section should have order 1")
		assert.NotEqual(t, uuid.Nil, section.ID, "Section ID should be generated")

		// Store for subsequent tests
		createdRootSection = section
	})

	t.Run("CreateCourseSection_Success_ChildSection", func(t *testing.T) {
		require.NotNil(t, createdRootSection, "Root section should exist from previous test")

		// Test successful child section creation
		createInput := model.CreateCourseSectionInput{
			Title:       "Sub-section 1",
			Description: "This is a child section",
			CourseID:    testCourse.ID,
			SectionID:   &createdRootSection.ID, // Child of root section
		}

		section, err := course_section.CreateCourseSection(ctx, user1ID, testCourse.ID, createInput)
		assert.NoError(t, err, "Child section creation should succeed")
		assert.NotNil(t, section, "Created child section should not be nil")
		assert.Equal(t, createInput.Title, section.Title, "Child section title should match input")
		assert.Equal(t, createInput.Description, *section.Description, "Child section description should match input")
		assert.Equal(t, testCourse.ID, section.CourseID, "Child section course ID should match")
		assert.Equal(t, createdRootSection.ID, *section.SectionID, "Child section should have correct parent")
		assert.Equal(t, 1, section.Order, "First child section should have order 1")

		// Store for subsequent tests
		createdChildSection = section
	})

	t.Run("CreateCourseSection_Success_SecondRootSection", func(t *testing.T) {
		// Test creating a second root section (order should be 1)
		createInput := model.CreateCourseSectionInput{
			Title:       "Advanced Section",
			Description: "This is an advanced section",
			CourseID:    testCourse.ID,
			SectionID:   nil, // Root section
		}

		section, err := course_section.CreateCourseSection(ctx, user1ID, testCourse.ID, createInput)
		assert.NoError(t, err, "Second root section creation should succeed")
		assert.NotNil(t, section, "Created section should not be nil")
		assert.Equal(t, 2, section.Order, "Second root section should have order 2")
		assert.Nil(t, section.SectionID, "Root section should have nil parent")
	})

	t.Run("GetCourseSectionByID_Success", func(t *testing.T) {
		require.NotNil(t, createdRootSection, "Root section should exist from previous test")

		// Test successful section retrieval
		retrievedSection, err := course_section.GetCourseSectionByID(ctx, user1ID, createdRootSection.ID)
		assert.NoError(t, err, "Section retrieval should succeed")
		assert.NotNil(t, retrievedSection, "Retrieved section should not be nil")
		assert.Equal(t, createdRootSection.ID, retrievedSection.ID, "Section IDs should match")
		assert.Equal(t, createdRootSection.Title, retrievedSection.Title, "Section titles should match")
		assert.Equal(t, createdRootSection.Description, retrievedSection.Description, "Section descriptions should match")
		assert.Equal(t, createdRootSection.Order, retrievedSection.Order, "Section orders should match")
	})

	t.Run("GetCourseSectionsByCourseID_Success", func(t *testing.T) {
		// Test retrieving all sections for a course
		sections, err := course_section.GetCourseSectionsByCourseID(ctx, user1ID, testCourse.ID, nil)
		assert.NoError(t, err, "Sections retrieval should succeed")
		assert.Len(t, sections, 3, "Should have 3 sections (2 root + 1 child)")

		// Test retrieving only root sections
		filter := &model.CourseSectionFilterInput{
			OnlyRoot: utils.Ptr(true),
		}
		rootSections, err := course_section.GetCourseSectionsByCourseID(ctx, user1ID, testCourse.ID, filter)
		assert.NoError(t, err, "Root sections retrieval should succeed")
		assert.Len(t, rootSections, 2, "Should have 2 root sections")

		// Verify all returned sections are root sections
		for _, section := range rootSections {
			assert.Nil(t, section.SectionID, "All returned sections should be root sections")
		}
	})

	t.Run("UpdateCourseSection_Success", func(t *testing.T) {
		require.NotNil(t, createdRootSection, "Root section should exist from previous test")

		// Test successful section update
		updateInput := model.UpdateCourseSectionInput{
			Title:       utils.Ptr("Updated Introduction Section"),
			Description: utils.Ptr("Updated description for introduction"),
			SectionID:   nil, // Keep as root section
		}

		updatedSection, err := course_section.UpdateCourseSection(ctx, user1ID, createdRootSection.ID, updateInput)
		assert.NoError(t, err, "Section update should succeed")
		assert.NotNil(t, updatedSection, "Updated section should not be nil")
		assert.Equal(t, *updateInput.Title, updatedSection.Title, "Section title should be updated")
		assert.Equal(t, *updateInput.Description, *updatedSection.Description, "Section description should be updated")
		assert.Equal(t, createdRootSection.ID, updatedSection.ID, "Section ID should remain unchanged")

		// Update our reference
		createdRootSection = updatedSection
	})

	t.Run("RemoveCourseSection_Success_WithChildren", func(t *testing.T) {
		require.NotNil(t, createdRootSection, "Root section should exist from previous test")
		require.NotNil(t, createdChildSection, "Child section should exist from previous test")

		// Test successful section removal (should cascade to children)
		success, err := course_section.RemoveCourseSection(ctx, user1ID, createdRootSection.ID)
		assert.NoError(t, err, "Section removal should succeed")
		assert.True(t, success, "Removal should return true")

		// Verify section and its child no longer exist
		deletedSection, err := course_section.GetCourseSectionByID(ctx, user1ID, createdRootSection.ID)
		assert.Error(t, err, "Section retrieval after deletion should fail")
		assert.Nil(t, deletedSection, "Deleted section should be nil")

		deletedChildSection, err := course_section.GetCourseSectionByID(ctx, user1ID, createdChildSection.ID)
		assert.Error(t, err, "Child section retrieval after parent deletion should fail")
		assert.Nil(t, deletedChildSection, "Deleted child section should be nil")
	})
}
