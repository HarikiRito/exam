package test_exam

import (
	"context"
	"template/integration_test/prepare"
	"template/integration_test/utils"
	"template/internal/features/test"
	"template/internal/graph/model"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestBatchUpdateQuestionPoints(t *testing.T) {
	prepare.SetupTestDb(t)

	ctx := context.Background()

	t.Run("BatchUpdateQuestionPoints_Success", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 5)

		// Add collection to test first
		addCollectionInput := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{scenario.Questions[0].CollectionID},
		}
		_, err := test.AddMultiCollection(ctx, scenario.User.ID, addCollectionInput)
		assert.NoError(t, err)

		input := model.BatchUpdateQuestionPointsInput{
			TestID: scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: scenario.Questions[0].ID, Points: 5},
				{QuestionID: scenario.Questions[1].ID, Points: 10},
				{QuestionID: scenario.Questions[2].ID, Points: 3},
				{QuestionID: scenario.Questions[3].ID, Points: 8},
			},
		}

		result, err := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, input)
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchUpdateQuestionPoints_SingleQuestion", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)

		// Add collection to test first
		addCollectionInput := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{scenario.Questions[0].CollectionID},
		}
		_, err := test.AddMultiCollection(ctx, scenario.User.ID, addCollectionInput)
		assert.NoError(t, err)

		input := model.BatchUpdateQuestionPointsInput{
			TestID: scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: scenario.Questions[0].ID, Points: 15},
			},
		}

		result, err := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, input)
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchUpdateQuestionPoints_UpdateExisting", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 4)

		// Add collection to test first
		addCollectionInput := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{scenario.Questions[0].CollectionID},
		}
		_, err := test.AddMultiCollection(ctx, scenario.User.ID, addCollectionInput)
		assert.NoError(t, err)

		// Set initial points
		initialInput := model.BatchUpdateQuestionPointsInput{
			TestID: scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: scenario.Questions[0].ID, Points: 5},
				{QuestionID: scenario.Questions[1].ID, Points: 10},
			},
		}

		result, err := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, initialInput)
		assert.NoError(t, err)
		assert.True(t, result)

		// Update points
		updateInput := model.BatchUpdateQuestionPointsInput{
			TestID: scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: scenario.Questions[0].ID, Points: 15}, // Updated
				{QuestionID: scenario.Questions[2].ID, Points: 7},  // New
			},
		}

		result, err = test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, updateInput)
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchUpdateQuestionPoints_VariousPointValues", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 5)

		// Add collection to test first
		addCollectionInput := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{scenario.Questions[0].CollectionID},
		}
		_, err := test.AddMultiCollection(ctx, scenario.User.ID, addCollectionInput)
		assert.NoError(t, err)

		input := model.BatchUpdateQuestionPointsInput{
			TestID: scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: scenario.Questions[0].ID, Points: 1},   // Minimum
				{QuestionID: scenario.Questions[1].ID, Points: 100}, // High value
				{QuestionID: scenario.Questions[2].ID, Points: 50},  // Medium value
			},
		}

		result, err := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, input)
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchUpdateQuestionPoints_TestNotFound", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)
		nonExistentTestID := uuid.New()

		input := model.BatchUpdateQuestionPointsInput{
			TestID: nonExistentTestID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: scenario.Questions[0].ID, Points: 5},
			},
		}

		result, err := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, input)
		assert.Error(t, err)
		assert.False(t, result)
		assert.Contains(t, err.Error(), "test not found")
	})

	t.Run("BatchUpdateQuestionPoints_UnauthorizedQuestions", func(t *testing.T) {
		t.Parallel()
		// Create first user with test
		scenario1 := prepare.CreateTestScenario(t, 3)

		// Create second user with questions
		userInput2 := model.RegisterInput{
			Email:    utils.Faker.Internet().Email(),
			Password: "testpassword123",
		}
		userEntity2 := prepare.CreateUser(t, userInput2)
		_, unauthorizedQuestions := prepare.CreateCollectionWithQuestions(t, userEntity2.ID, 3)

		// Try to set points for second user's questions in first user's test
		input := model.BatchUpdateQuestionPointsInput{
			TestID: scenario1.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: unauthorizedQuestions[0].ID, Points: 5},
			},
		}

		result, err := test.BatchUpdateQuestionPoints(ctx, scenario1.User.ID, input)
		assert.Error(t, err)
		assert.False(t, result)
		assert.Contains(t, err.Error(), "some questions are not owned by the user")
	})

	t.Run("BatchUpdateQuestionPoints_QuestionsNotInTest", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)

		// Create another collection not added to test
		_, anotherQuestions := prepare.CreateCollectionWithQuestions(t, scenario.User.ID, 2)

		// Try to set points for questions not in the test's collections
		input := model.BatchUpdateQuestionPointsInput{
			TestID: scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: anotherQuestions[0].ID, Points: 5},
			},
		}

		result, err := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, input)
		assert.Error(t, err)
		assert.False(t, result)
		// The error should indicate the question is not found or unauthorized
		// because the collection is not associated with the test
	})

	t.Run("BatchUpdateQuestionPoints_MixedAuthorizedUnauthorized", func(t *testing.T) {
		t.Parallel()
		// Create first user with test and questions
		scenario1 := prepare.CreateTestScenario(t, 3)

		// Add collection to test first
		addCollectionInput := model.AddMultiCollectionToTestInput{
			TestID:        scenario1.Test.ID,
			CollectionIds: []uuid.UUID{scenario1.Questions[0].CollectionID},
		}
		_, err := test.AddMultiCollection(ctx, scenario1.User.ID, addCollectionInput)
		assert.NoError(t, err)

		// Create second user with questions
		userInput2 := model.RegisterInput{
			Email:    utils.Faker.Internet().Email(),
			Password: "testpassword123",
		}
		userEntity2 := prepare.CreateUser(t, userInput2)
		_, unauthorizedQuestions := prepare.CreateCollectionWithQuestions(t, userEntity2.ID, 2)

		// Try to set points for mix of authorized and unauthorized questions
		input := model.BatchUpdateQuestionPointsInput{
			TestID: scenario1.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: scenario1.Questions[0].ID, Points: 5},
				{QuestionID: unauthorizedQuestions[0].ID, Points: 10},
			},
		}

		result, err := test.BatchUpdateQuestionPoints(ctx, scenario1.User.ID, input)
		assert.Error(t, err)
		assert.False(t, result)
		assert.Contains(t, err.Error(), "some questions are not owned by the user")
	})

	t.Run("BatchUpdateQuestionPoints_NonExistentQuestion", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)
		nonExistentQuestionID := uuid.New()

		input := model.BatchUpdateQuestionPointsInput{
			TestID: scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: nonExistentQuestionID, Points: 5},
			},
		}

		result, err := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, input)
		assert.Error(t, err)
		assert.False(t, result)
		assert.Contains(t, err.Error(), "some questions are not owned by the user")
	})

	t.Run("BatchUpdateQuestionPoints_DuplicateQuestionIds", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)

		// Add collection to test first
		addCollectionInput := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{scenario.Questions[0].CollectionID},
		}
		_, err := test.AddMultiCollection(ctx, scenario.User.ID, addCollectionInput)
		assert.NoError(t, err)

		// Try to set points for the same question multiple times
		input := model.BatchUpdateQuestionPointsInput{
			TestID: scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: scenario.Questions[0].ID, Points: 5},
				{QuestionID: scenario.Questions[0].ID, Points: 10}, // Duplicate
			},
		}

		result, err := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, input)
		// This might succeed with the last value being used
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchUpdateQuestionPoints_ZeroPoints", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)

		// Add collection to test first
		addCollectionInput := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{scenario.Questions[0].CollectionID},
		}
		_, err := test.AddMultiCollection(ctx, scenario.User.ID, addCollectionInput)
		assert.NoError(t, err)

		input := model.BatchUpdateQuestionPointsInput{
			TestID: scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: scenario.Questions[0].ID, Points: 0},
			},
		}

		result, err := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, input)
		// Zero points should be valid
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchUpdateQuestionPoints_LargeNumberOfQuestions", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 2)

		// Create a collection with many questions
		manyCollection, manyQuestions := prepare.CreateCollectionWithQuestions(t, scenario.User.ID, 25)

		// Add collection to test first
		addCollectionInput := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{manyCollection.ID},
		}
		_, err := test.AddMultiCollection(ctx, scenario.User.ID, addCollectionInput)
		assert.NoError(t, err)

		var questionPointsData []*model.QuestionPointsInput
		for i, question := range manyQuestions {
			questionPointsData = append(questionPointsData, &model.QuestionPointsInput{
				QuestionID: question.ID,
				Points:     (i%10 + 1) * 2, // Varying points: 2, 4, 6, ... 20
			})
		}

		input := model.BatchUpdateQuestionPointsInput{
			TestID:         scenario.Test.ID,
			QuestionPoints: questionPointsData,
		}

		result, err := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, input)
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchUpdateQuestionPoints_EmptyQuestionPoints", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)

		input := model.BatchUpdateQuestionPointsInput{
			TestID:         scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{},
		}

		result, err := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, input)
		// Should succeed as clearing all points is valid
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchUpdateQuestionPoints_MultipleCollections", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)
		collection2, questions2 := prepare.CreateCollectionWithQuestions(t, scenario.User.ID, 3)

		// Add both collections to test
		addCollectionInput := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{scenario.Collection.ID, collection2.ID},
		}
		_, err := test.AddMultiCollection(ctx, scenario.User.ID, addCollectionInput)
		assert.NoError(t, err)

		// Set points for questions from both collections
		input := model.BatchUpdateQuestionPointsInput{
			TestID: scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: scenario.Questions[0].ID, Points: 5},
				{QuestionID: scenario.Questions[1].ID, Points: 8},
				{QuestionID: questions2[0].ID, Points: 12},
				{QuestionID: questions2[1].ID, Points: 6},
			},
		}

		result, err := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, input)
		assert.NoError(t, err)
		assert.True(t, result)
	})
}
