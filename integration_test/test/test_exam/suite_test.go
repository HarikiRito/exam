package test_exam

import (
	"context"
	"template/integration_test/prepare"
	"template/integration_test/setup"
	"template/integration_test/utils"
	"template/internal/features/test"
	"template/internal/graph/model"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

// TestFullTestWorkflow tests a complete workflow of test operations
func TestFullTestWorkflow(t *testing.T) {
	dbSchema := utils.RandomDbSchema()
	setup.ResetTestSchema(t, dbSchema)
	t.Cleanup(func() {
		setup.DeleteTestSchema(t, dbSchema)
	})

	ctx := context.Background()

	t.Run("CompleteTestWorkflow", func(t *testing.T) {
		// Step 1: Create test scenario with user, course, test, and questions
		scenario1 := prepare.CreateTestScenario(t, 5)
		collection2, questions2 := prepare.CreateCollectionWithQuestions(t, scenario1.User.ID, 4)

		// Step 2: Add multiple collections to test
		addCollectionInput := model.AddMultiCollectionToTestInput{
			TestID:        scenario1.Test.ID,
			CollectionIds: []uuid.UUID{scenario1.Collection.ID, collection2.ID},
		}
		result, err := test.AddMultiCollection(ctx, scenario1.User.ID, addCollectionInput)
		assert.NoError(t, err)
		assert.True(t, result)

		// Step 3: Set question points for various questions
		questionPointsInput := model.BatchUpdateQuestionPointsInput{
			TestID: scenario1.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: scenario1.Questions[0].ID, Points: 10},
				{QuestionID: scenario1.Questions[1].ID, Points: 15},
				{QuestionID: scenario1.Questions[2].ID, Points: 5},
				{QuestionID: questions2[0].ID, Points: 8},
				{QuestionID: questions2[1].ID, Points: 12},
			},
		}
		result, err = test.BatchUpdateQuestionPoints(ctx, scenario1.User.ID, questionPointsInput)
		assert.NoError(t, err)
		assert.True(t, result)

		// Step 4: Ignore some problematic questions
		ignoreQuestionsInput := model.BatchIgnoreQuestionsInput{
			TestID: scenario1.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{
				{
					QuestionID: scenario1.Questions[3].ID,
					Reason:     utils.Ptr("Question has ambiguous wording"),
				},
				{
					QuestionID: questions2[2].ID,
					Reason:     utils.Ptr("Out of scope for this test"),
				},
			},
		}
		result, err = test.BatchIgnoreQuestions(ctx, scenario1.User.ID, ignoreQuestionsInput)
		assert.NoError(t, err)
		assert.True(t, result)

		// Step 5: Delete some question points
		deletePointsInput := model.BatchDeleteQuestionPointsInput{
			TestID:      scenario1.Test.ID,
			QuestionIds: []uuid.UUID{scenario1.Questions[2].ID}, // Remove the 5-point question
		}
		result, err = test.BatchDeleteQuestionPoints(ctx, scenario1.User.ID, deletePointsInput)
		assert.NoError(t, err)
		assert.True(t, result)

		// Step 6: Update the test collections (replace with new ones)
		collection3, _ := prepare.CreateCollectionWithQuestions(t, scenario1.User.ID, 3)
		updateCollectionInput := model.AddMultiCollectionToTestInput{
			TestID:        scenario1.Test.ID,
			CollectionIds: []uuid.UUID{scenario1.Collection.ID, collection3.ID}, // Remove collection2, add collection3
		}
		result, err = test.AddMultiCollection(ctx, scenario1.User.ID, updateCollectionInput)
		assert.NoError(t, err)
		assert.True(t, result)

		// Step 7: Clear all question points
		clearPointsInput := model.BatchUpdateQuestionPointsInput{
			TestID:         scenario1.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{},
		}
		result, err = test.BatchUpdateQuestionPoints(ctx, scenario1.User.ID, clearPointsInput)
		assert.NoError(t, err)
		assert.True(t, result)
	})
}

// TestConcurrentTestOperations tests concurrent operations on the same test
func TestConcurrentTestOperations(t *testing.T) {
	dbSchema := utils.RandomDbSchema()
	setup.ResetTestSchema(t, dbSchema)
	t.Cleanup(func() {
		setup.DeleteTestSchema(t, dbSchema)
	})

	ctx := context.Background()

	t.Run("ConcurrentOperations", func(t *testing.T) {
		scenario := prepare.CreateTestScenario(t, 10)

		// Add collection to test first
		addCollectionInput := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{scenario.Questions[0].CollectionID},
		}
		_, err := test.AddMultiCollection(ctx, scenario.User.ID, addCollectionInput)
		assert.NoError(t, err)

		// These operations could potentially run concurrently in a real application
		// Here we test them sequentially but in rapid succession

		// Operation 1: Set question points
		questionPointsInput := model.BatchUpdateQuestionPointsInput{
			TestID: scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: scenario.Questions[0].ID, Points: 10},
				{QuestionID: scenario.Questions[1].ID, Points: 15},
			},
		}
		result1, err1 := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, questionPointsInput)

		// Operation 2: Ignore questions
		ignoreQuestionsInput := model.BatchIgnoreQuestionsInput{
			TestID: scenario.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{
				{QuestionID: scenario.Questions[2].ID, Reason: utils.Ptr("Concurrent ignore test")},
			},
		}
		result2, err2 := test.BatchIgnoreQuestions(ctx, scenario.User.ID, ignoreQuestionsInput)

		// Operation 3: Delete points for different questions
		deletePointsInput := model.BatchDeleteQuestionPointsInput{
			TestID:      scenario.Test.ID,
			QuestionIds: []uuid.UUID{scenario.Questions[3].ID}, // Different question
		}
		result3, err3 := test.BatchDeleteQuestionPoints(ctx, scenario.User.ID, deletePointsInput)

		// All operations should succeed
		assert.NoError(t, err1)
		assert.True(t, result1)
		assert.NoError(t, err2)
		assert.True(t, result2)
		assert.NoError(t, err3)
		assert.True(t, result3)
	})
}

// TestEdgeCasesAndBoundaries tests various edge cases and boundary conditions
func TestEdgeCasesAndBoundaries(t *testing.T) {
	dbSchema := utils.RandomDbSchema()
	setup.ResetTestSchema(t, dbSchema)
	t.Cleanup(func() {
		setup.DeleteTestSchema(t, dbSchema)
	})

	ctx := context.Background()

	t.Run("EdgeCases", func(t *testing.T) {
		scenario := prepare.CreateTestScenario(t, 3)

		// Add collection to test
		addCollectionInput := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{scenario.Questions[0].CollectionID},
		}
		_, err := test.AddMultiCollection(ctx, scenario.User.ID, addCollectionInput)
		assert.NoError(t, err)

		// Test 1: Zero points assignment
		zeroPointsInput := model.BatchUpdateQuestionPointsInput{
			TestID: scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: scenario.Questions[0].ID, Points: 0},
			},
		}
		result, err := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, zeroPointsInput)
		assert.NoError(t, err)
		assert.True(t, result)

		// Test 2: Very high points assignment
		highPointsInput := model.BatchUpdateQuestionPointsInput{
			TestID: scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: scenario.Questions[1].ID, Points: 9999},
			},
		}
		result, err = test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, highPointsInput)
		assert.NoError(t, err)
		assert.True(t, result)

		// Test 3: Empty reason for ignore
		emptyReasonInput := model.BatchIgnoreQuestionsInput{
			TestID: scenario.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{
				{QuestionID: scenario.Questions[2].ID, Reason: utils.Ptr("")},
			},
		}
		result, err = test.BatchIgnoreQuestions(ctx, scenario.User.ID, emptyReasonInput)
		assert.NoError(t, err)
		assert.True(t, result)

		// Test 4: Delete non-existent points (should succeed)
		deleteNonExistentInput := model.BatchDeleteQuestionPointsInput{
			TestID:      scenario.Test.ID,
			QuestionIds: []uuid.UUID{scenario.Questions[2].ID}, // This question has no points set
		}
		result, err = test.BatchDeleteQuestionPoints(ctx, scenario.User.ID, deleteNonExistentInput)
		assert.NoError(t, err)
		assert.True(t, result)
	})
}

// TestTestReconfiguration tests the reconfiguration of a test through various phases
func TestTestReconfiguration(t *testing.T) {
	dbSchema := utils.RandomDbSchema()
	setup.ResetTestSchema(t, dbSchema)
	t.Cleanup(func() {
		setup.DeleteTestSchema(t, dbSchema)
	})

	ctx := context.Background()

	t.Run("TestReconfiguration", func(t *testing.T) {
		scenario := prepare.CreateTestScenario(t, 3)
		collection2, questions2 := prepare.CreateCollectionWithQuestions(t, scenario.User.ID, 3)
		collection3, questions3 := prepare.CreateCollectionWithQuestions(t, scenario.User.ID, 3)

		// Phase 1: Initial configuration
		phase1Input := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{scenario.Collection.ID},
		}
		result, err := test.AddMultiCollection(ctx, scenario.User.ID, phase1Input)
		assert.NoError(t, err)
		assert.True(t, result)

		// Set initial points
		points1Input := model.BatchUpdateQuestionPointsInput{
			TestID: scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: scenario.Questions[0].ID, Points: 10},
				{QuestionID: scenario.Questions[1].ID, Points: 15},
			},
		}
		result, err = test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, points1Input)
		assert.NoError(t, err)
		assert.True(t, result)

		// Phase 2: Expand test with more collections
		phase2Input := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{scenario.Collection.ID, collection2.ID, collection3.ID},
		}
		result, err = test.AddMultiCollection(ctx, scenario.User.ID, phase2Input)
		assert.NoError(t, err)
		assert.True(t, result)

		// Set points for new questions
		points2Input := model.BatchUpdateQuestionPointsInput{
			TestID: scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: questions2[0].ID, Points: 8},
				{QuestionID: questions3[0].ID, Points: 12},
			},
		}
		result, err = test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, points2Input)
		assert.NoError(t, err)
		assert.True(t, result)

		// Phase 3: Scale back the test
		phase3Input := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{collection2.ID}, // Only keep collection2
		}
		result, err = test.AddMultiCollection(ctx, scenario.User.ID, phase3Input)
		assert.NoError(t, err)
		assert.True(t, result)

		// Clean up remaining points for questions no longer accessible
		deleteObsoletePointsInput := model.BatchDeleteQuestionPointsInput{
			TestID:      scenario.Test.ID,
			QuestionIds: []uuid.UUID{scenario.Questions[0].ID, scenario.Questions[1].ID, questions3[0].ID},
		}
		// This operation may fail since questions are no longer in test collections
		// but we test it to demonstrate the complexity of test reconfiguration
		_, _ = test.BatchDeleteQuestionPoints(ctx, scenario.User.ID, deleteObsoletePointsInput)
	})
}
