package question_collection

import (
	"context"
	"fmt"
	"template/integration_test/prepare"
	"template/integration_test/utils"
	"template/internal/features/question"
	"template/internal/features/question_collection"
	"template/internal/graph/model"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestQuestionCollectionIntegration tests real-world scenarios with multiple operations
func TestQuestionCollectionIntegration(t *testing.T) {
	prepare.SetupTestDb(t)

	ctx := context.Background()

	// Create test users
	teacherInput := model.RegisterInput{
		Email:    utils.Faker.Internet().Email(),
		Password: "teacher123",
	}
	teacherEntity := prepare.CreateUser(t, teacherInput)
	teacherID := teacherEntity.ID

	student1Input := model.RegisterInput{
		Email:    utils.Faker.Internet().Email(),
		Password: "student123",
	}
	student1Entity := prepare.CreateUser(t, student1Input)
	student1ID := student1Entity.ID

	student2Input := model.RegisterInput{
		Email:    utils.Faker.Internet().Email(),
		Password: "student123",
	}
	student2Entity := prepare.CreateUser(t, student2Input)
	student2ID := student2Entity.ID

	t.Run("FullWorkflow_CreateAndManageQuestionCollections", func(t *testing.T) {
		// Step 1: Teacher creates multiple question collections
		mathCollectionInput := model.CreateQuestionCollectionInput{
			Title:       "Mathematics Quiz Collection",
			Description: utils.Ptr("Collection of math questions for grade 10"),
		}
		mathCollection, err := question_collection.CreateQuestionCollection(ctx, teacherID, mathCollectionInput)
		require.NoError(t, err)

		scienceCollectionInput := model.CreateQuestionCollectionInput{
			Title:       "Science Quiz Collection",
			Description: utils.Ptr("Collection of science questions for grade 10"),
		}
		scienceCollection, err := question_collection.CreateQuestionCollection(ctx, teacherID, scienceCollectionInput)
		require.NoError(t, err)

		historyCollectionInput := model.CreateQuestionCollectionInput{
			Title:       "History Quiz Collection",
			Description: utils.Ptr("Collection of history questions for grade 10"),
		}
		historyCollection, err := question_collection.CreateQuestionCollection(ctx, teacherID, historyCollectionInput)
		require.NoError(t, err)

		// Step 2: Teacher adds questions to math collection using batch update
		mathQuestionsInput := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: mathCollection.ID,
			Questions: []*model.UpdateQuestionData{
				{
					QuestionText: utils.Ptr("What is 2 + 2?"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("3"), IsCorrect: utils.Ptr(false)},
						{OptionText: utils.Ptr("4"), IsCorrect: utils.Ptr(true)},
						{OptionText: utils.Ptr("5"), IsCorrect: utils.Ptr(false)},
						{OptionText: utils.Ptr("6"), IsCorrect: utils.Ptr(false)},
					},
					Points: 10,
				},
				{
					QuestionText: utils.Ptr("What is 3 × 4?"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("10"), IsCorrect: utils.Ptr(false)},
						{OptionText: utils.Ptr("11"), IsCorrect: utils.Ptr(false)},
						{OptionText: utils.Ptr("12"), IsCorrect: utils.Ptr(true)},
						{OptionText: utils.Ptr("13"), IsCorrect: utils.Ptr(false)},
					},
					Points: 10,
				},
				{
					QuestionText: utils.Ptr("What is the square root of 16?"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("2"), IsCorrect: utils.Ptr(false)},
						{OptionText: utils.Ptr("3"), IsCorrect: utils.Ptr(false)},
						{OptionText: utils.Ptr("4"), IsCorrect: utils.Ptr(true)},
						{OptionText: utils.Ptr("5"), IsCorrect: utils.Ptr(false)},
					},
					Points: 10,
				},
			},
		}
		err = question_collection.UpdateBatchQuestionsByCollection(ctx, teacherID, mathQuestionsInput)
		require.NoError(t, err)

		// Step 3: Verify questions were created
		mathQuestions, err := question.GetQuestionsByCollectionIDs(ctx, []uuid.UUID{mathCollection.ID})
		require.NoError(t, err)
		assert.Len(t, mathQuestions, 3)

		// Step 4: Teacher adds questions to science collection
		scienceQuestionsInput := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: scienceCollection.ID,
			Questions: []*model.UpdateQuestionData{
				{
					QuestionText: utils.Ptr("What is the chemical symbol for water?"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("H2O"), IsCorrect: utils.Ptr(true)},
						{OptionText: utils.Ptr("CO2"), IsCorrect: utils.Ptr(false)},
						{OptionText: utils.Ptr("O2"), IsCorrect: utils.Ptr(false)},
					},
					Points: 10,
				},
				{
					QuestionText: utils.Ptr("How many bones are in the human body?"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("206"), IsCorrect: utils.Ptr(true)},
						{OptionText: utils.Ptr("205"), IsCorrect: utils.Ptr(false)},
						{OptionText: utils.Ptr("207"), IsCorrect: utils.Ptr(false)},
					},
					Points: 10,
				},
			},
		}
		err = question_collection.UpdateBatchQuestionsByCollection(ctx, teacherID, scienceQuestionsInput)
		require.NoError(t, err)

		// Step 5: Teacher reviews all collections using pagination
		paginationInput := &model.PaginationInput{
			Page:  utils.Ptr(1),
			Limit: utils.Ptr(10),
		}
		allCollections, err := question_collection.PaginatedQuestionCollections(ctx, teacherID, paginationInput)
		require.NoError(t, err)
		assert.Equal(t, 3, allCollections.TotalItems)
		assert.Len(t, allCollections.Items, 3)

		// Step 6: Teacher updates a collection's metadata
		updateMathInput := model.UpdateQuestionCollectionInput{
			Title:       utils.Ptr("Advanced Mathematics Quiz Collection"),
			Description: utils.Ptr("Updated collection of advanced math questions for grade 10"),
		}
		updatedMathCollection, err := question_collection.UpdateQuestionCollection(ctx, teacherID, mathCollection.ID, updateMathInput)
		require.NoError(t, err)
		assert.Equal(t, "Advanced Mathematics Quiz Collection", updatedMathCollection.Title)

		// Step 7: Teacher modifies questions in math collection (mixed operations)
		mathQuestions, err = question.GetQuestionsByCollectionIDs(ctx, []uuid.UUID{mathCollection.ID})
		require.NoError(t, err)
		require.Len(t, mathQuestions, 3)

		modifyMathInput := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: mathCollection.ID,
			Questions: []*model.UpdateQuestionData{
				// Update first question
				{
					ID:           &mathQuestions[0].ID,
					QuestionText: utils.Ptr("What is 2 + 2? (Easy)"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("4"), IsCorrect: utils.Ptr(true)},
						{OptionText: utils.Ptr("Not 4"), IsCorrect: utils.Ptr(false)},
					},
					Points: 10,
				},
				// Delete second question
				{
					ID:      &mathQuestions[1].ID,
					Options: []*model.UpdateQuestionOptionInput{},
					Points:  10,
				},
				// Keep third question unchanged (not included in update)
				// Add new question
				{
					QuestionText: utils.Ptr("What is 5 × 6?"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("30"), IsCorrect: utils.Ptr(true)},
						{OptionText: utils.Ptr("25"), IsCorrect: utils.Ptr(false)},
						{OptionText: utils.Ptr("35"), IsCorrect: utils.Ptr(false)},
					},
					Points: 10,
				},
			},
		}
		err = question_collection.UpdateBatchQuestionsByCollection(ctx, teacherID, modifyMathInput)
		require.NoError(t, err)

		// Verify modifications
		finalMathQuestions, err := question.GetQuestionsByCollectionIDs(ctx, []uuid.UUID{mathCollection.ID})
		require.NoError(t, err)
		assert.Len(t, finalMathQuestions, 3) // 1 updated + 1 unchanged + 1 new = 3 (1 deleted)

		// Step 8: Students attempt to access teacher's collections (should fail)
		_, err = question_collection.GetQuestionCollectionByID(ctx, student1ID, mathCollection.ID)
		assert.Error(t, err)

		_, err = question_collection.GetQuestionCollectionByID(ctx, student2ID, scienceCollection.ID)
		assert.Error(t, err)

		// Step 9: Students create their own collections
		student1CollectionInput := model.CreateQuestionCollectionInput{
			Title:       "Student 1's Practice Questions",
			Description: utils.Ptr("My personal practice collection"),
		}
		_, err = question_collection.CreateQuestionCollection(ctx, student1ID, student1CollectionInput)
		require.NoError(t, err)

		student2CollectionInput := model.CreateQuestionCollectionInput{
			Title:       "Student 2's Study Notes",
			Description: utils.Ptr("Questions I made while studying"),
		}
		_, err = question_collection.CreateQuestionCollection(ctx, student2ID, student2CollectionInput)
		require.NoError(t, err)

		// Step 10: Verify user isolation
		teacherCollections, err := question_collection.PaginatedQuestionCollections(ctx, teacherID, nil)
		require.NoError(t, err)
		assert.Equal(t, 3, teacherCollections.TotalItems) // Should only see teacher's collections

		student1Collections, err := question_collection.PaginatedQuestionCollections(ctx, student1ID, nil)
		require.NoError(t, err)
		assert.Equal(t, 1, student1Collections.TotalItems) // Should only see student1's collection

		student2Collections, err := question_collection.PaginatedQuestionCollections(ctx, student2ID, nil)
		require.NoError(t, err)
		assert.Equal(t, 1, student2Collections.TotalItems) // Should only see student2's collection

		// Step 11: Teacher decides to remove history collection (unused)
		success, err := question_collection.DeleteQuestionCollection(ctx, teacherID, historyCollection.ID)
		require.NoError(t, err)
		assert.True(t, success)

		// Verify deletion
		finalTeacherCollections, err := question_collection.PaginatedQuestionCollections(ctx, teacherID, nil)
		require.NoError(t, err)
		assert.Equal(t, 2, finalTeacherCollections.TotalItems) // Should have 2 collections now

		// Step 12: Verify deleted collection cannot be accessed
		_, err = question_collection.GetQuestionCollectionByID(ctx, teacherID, historyCollection.ID)
		assert.Error(t, err)
	})

	t.Run("BulkOperations_Performance", func(t *testing.T) {
		// Create a collection for performance testing
		perfCollectionInput := model.CreateQuestionCollectionInput{
			Title:       "Performance Test Collection",
			Description: utils.Ptr("Collection for testing bulk operations performance"),
		}
		perfCollection, err := question_collection.CreateQuestionCollection(ctx, teacherID, perfCollectionInput)
		require.NoError(t, err)

		// Create a large number of questions in a single batch
		var questions []*model.UpdateQuestionData
		for i := 0; i < 100; i++ {
			questions = append(questions, &model.UpdateQuestionData{
				QuestionText: utils.Ptr(fmt.Sprintf("Performance test question %d", i+1)),
				Options: []*model.UpdateQuestionOptionInput{
					{OptionText: utils.Ptr(fmt.Sprintf("Correct answer %d", i+1)), IsCorrect: utils.Ptr(true)},
					{OptionText: utils.Ptr(fmt.Sprintf("Wrong answer 1 %d", i+1)), IsCorrect: utils.Ptr(false)},
					{OptionText: utils.Ptr(fmt.Sprintf("Wrong answer 2 %d", i+1)), IsCorrect: utils.Ptr(false)},
					{OptionText: utils.Ptr(fmt.Sprintf("Wrong answer 3 %d", i+1)), IsCorrect: utils.Ptr(false)},
				},
				Points: 10,
			})
		}

		perfInput := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: perfCollection.ID,
			Questions:    questions,
		}

		// This should complete successfully even with a large number of questions
		err = question_collection.UpdateBatchQuestionsByCollection(ctx, teacherID, perfInput)
		require.NoError(t, err)

		// Verify all questions were created
		createdQuestions, err := question.GetQuestionsByCollectionIDs(ctx, []uuid.UUID{perfCollection.ID})
		require.NoError(t, err)
		assert.Len(t, createdQuestions, 100)

		// Verify all options were created (100 questions × 4 options each = 400 options)
		allQuestionIDs := make([]uuid.UUID, len(createdQuestions))
		for i, q := range createdQuestions {
			allQuestionIDs[i] = q.ID
		}
		allOptions, err := question.GetQuestionOptionsByQuestionIDs(ctx, allQuestionIDs)
		require.NoError(t, err)
		assert.Len(t, allOptions, 400)
	})

	t.Run("ErrorHandling_RealWorldScenarios", func(t *testing.T) {
		// Create a collection for error testing
		errorCollectionInput := model.CreateQuestionCollectionInput{
			Title: "Error Handling Test Collection",
		}
		errorCollection, err := question_collection.CreateQuestionCollection(ctx, teacherID, errorCollectionInput)
		require.NoError(t, err)

		// Test various error scenarios that might occur in real usage

		// Scenario 1: User tries to perform operations on deleted collection
		deletedCollectionInput := model.CreateQuestionCollectionInput{
			Title: "Collection to be Deleted",
		}
		deletedCollection, err := question_collection.CreateQuestionCollection(ctx, teacherID, deletedCollectionInput)
		require.NoError(t, err)

		// Delete the collection
		success, err := question_collection.DeleteQuestionCollection(ctx, teacherID, deletedCollection.ID)
		require.NoError(t, err)
		require.True(t, success)

		// Try to add questions to deleted collection
		invalidInput := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: deletedCollection.ID,
			Questions: []*model.UpdateQuestionData{
				{
					QuestionText: utils.Ptr("This should fail"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("Option"), IsCorrect: utils.Ptr(true)},
					},
					Points: 10,
				},
			},
		}
		err = question_collection.UpdateBatchQuestionsByCollection(ctx, teacherID, invalidInput)
		assert.Error(t, err)

		// Scenario 2: Mixed batch with some invalid questions
		// This tests transaction rollback behavior
		mixedValidInvalidInput := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: errorCollection.ID,
			Questions: []*model.UpdateQuestionData{
				{
					QuestionText: utils.Ptr("Valid question 1"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("Valid option"), IsCorrect: utils.Ptr(true)},
					},
					Points: 10,
				},
				{
					QuestionText: utils.Ptr("Invalid question - no correct answer"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("Wrong option 1"), IsCorrect: utils.Ptr(false)},
						{OptionText: utils.Ptr("Wrong option 2"), IsCorrect: utils.Ptr(false)},
					},
					Points: 10,
				},
				{
					QuestionText: utils.Ptr("Valid question 2"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("Another valid option"), IsCorrect: utils.Ptr(true)},
					},
					Points: 10,
				},
			},
		}

		err = question_collection.UpdateBatchQuestionsByCollection(ctx, teacherID, mixedValidInvalidInput)
		assert.Error(t, err)

		// Verify no questions were created (all-or-nothing behavior)
		questions, err := question.GetQuestionsByCollectionIDs(ctx, []uuid.UUID{errorCollection.ID})
		require.NoError(t, err)
		assert.Len(t, questions, 0)

		// Scenario 3: Network interruption simulation (context cancellation)
		// Create a cancelled context to simulate network interruption
		cancelledCtx, cancel := context.WithCancel(ctx)
		cancel() // Immediately cancel

		networkFailInput := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: errorCollection.ID,
			Questions: []*model.UpdateQuestionData{
				{
					QuestionText: utils.Ptr("This should be cancelled"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("Option"), IsCorrect: utils.Ptr(true)},
					},
					Points: 10,
				},
			},
		}

		err = question_collection.UpdateBatchQuestionsByCollection(cancelledCtx, teacherID, networkFailInput)
		assert.Error(t, err)
	})
}
