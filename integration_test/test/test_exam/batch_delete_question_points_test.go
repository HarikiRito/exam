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

func TestBatchDeleteQuestionPoints(t *testing.T) {
	prepare.SetupTestDb(t)

	ctx := context.Background()

	t.Run("BatchDeleteQuestionPoints_Success", func(t *testing.T) {
		t.Parallel()
		// Create test scenario with user, course, test, collection and questions
		scenario := prepare.CreateTestScenario(t, 5)

		// First set up some question points
		questionPointsInput := model.BatchUpdateQuestionPointsInput{
			TestID: scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: scenario.Questions[0].ID, Points: 5},
				{QuestionID: scenario.Questions[1].ID, Points: 10},
				{QuestionID: scenario.Questions[2].ID, Points: 3},
			},
		}
		_, err := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, questionPointsInput)
		assert.NoError(t, err)

		// Now delete specific question points
		input := model.BatchDeleteQuestionPointsInput{
			TestID:      scenario.Test.ID,
			QuestionIds: []uuid.UUID{scenario.Questions[0].ID, scenario.Questions[1].ID},
		}

		result, err := test.BatchDeleteQuestionPoints(ctx, scenario.User.ID, input)
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchDeleteQuestionPoints_SingleQuestion", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)

		// Set up a question point
		questionPointsInput := model.BatchUpdateQuestionPointsInput{
			TestID: scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: scenario.Questions[0].ID, Points: 8},
			},
		}
		_, err := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, questionPointsInput)
		assert.NoError(t, err)

		// Delete the question point
		input := model.BatchDeleteQuestionPointsInput{
			TestID:      scenario.Test.ID,
			QuestionIds: []uuid.UUID{scenario.Questions[0].ID},
		}

		result, err := test.BatchDeleteQuestionPoints(ctx, scenario.User.ID, input)
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchDeleteQuestionPoints_AllQuestions", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)

		// Set up question points for all questions
		var questionPointsData []*model.QuestionPointsInput
		for i, question := range scenario.Questions {
			questionPointsData = append(questionPointsData, &model.QuestionPointsInput{
				QuestionID: question.ID,
				Points:     (i + 1) * 2, // 2, 4, 6, 8 points
			})
		}

		questionPointsInput := model.BatchUpdateQuestionPointsInput{
			TestID:         scenario.Test.ID,
			QuestionPoints: questionPointsData,
		}
		_, err := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, questionPointsInput)
		assert.NoError(t, err)

		// Delete all question points
		var questionIds []uuid.UUID
		for _, question := range scenario.Questions {
			questionIds = append(questionIds, question.ID)
		}

		input := model.BatchDeleteQuestionPointsInput{
			TestID:      scenario.Test.ID,
			QuestionIds: questionIds,
		}

		result, err := test.BatchDeleteQuestionPoints(ctx, scenario.User.ID, input)
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchDeleteQuestionPoints_TestNotFound", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)
		nonExistentTestID := uuid.New()

		input := model.BatchDeleteQuestionPointsInput{
			TestID:      nonExistentTestID,
			QuestionIds: []uuid.UUID{scenario.Questions[0].ID},
		}

		result, err := test.BatchDeleteQuestionPoints(ctx, scenario.User.ID, input)
		assert.Error(t, err)
		assert.False(t, result)
		assert.Contains(t, err.Error(), "test not found")
	})

	t.Run("BatchDeleteQuestionPoints_EmptyQuestionIds", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)

		input := model.BatchDeleteQuestionPointsInput{
			TestID:      scenario.Test.ID,
			QuestionIds: []uuid.UUID{},
		}

		result, err := test.BatchDeleteQuestionPoints(ctx, scenario.User.ID, input)
		assert.Error(t, err)
		assert.False(t, result)
		assert.Contains(t, err.Error(), "no question ids provided")
	})

	t.Run("BatchDeleteQuestionPoints_UnauthorizedQuestions", func(t *testing.T) {
		t.Parallel()
		// Create first user with test and questions
		scenario := prepare.CreateTestScenario(t, 3)

		// Create second user with questions
		userInput2 := model.RegisterInput{
			Email:    utils.Faker.Internet().Email(),
			Password: "testpassword123",
		}
		userEntity2 := prepare.CreateUser(t, userInput2)
		_, unauthorizedQuestions := prepare.CreateCollectionWithQuestions(t, userEntity2.ID, 3)

		// Try to delete second user's questions from first user's test
		input := model.BatchDeleteQuestionPointsInput{
			TestID:      scenario.Test.ID,
			QuestionIds: []uuid.UUID{unauthorizedQuestions[0].ID},
		}

		result, err := test.BatchDeleteQuestionPoints(ctx, scenario.User.ID, input)
		assert.Error(t, err)
		assert.False(t, result)
		assert.Contains(t, err.Error(), "some questions are not accessible")
	})

	t.Run("BatchDeleteQuestionPoints_MixedAuthorizedUnauthorized", func(t *testing.T) {
		t.Parallel()
		// Create first user with test and questions
		scenario := prepare.CreateTestScenario(t, 3)

		// Create second user with questions
		userInput2 := model.RegisterInput{
			Email:    utils.Faker.Internet().Email(),
			Password: "testpassword123",
		}
		userEntity2 := prepare.CreateUser(t, userInput2)
		_, unauthorizedQuestions := prepare.CreateCollectionWithQuestions(t, userEntity2.ID, 2)

		// Try to delete mix of authorized and unauthorized questions
		input := model.BatchDeleteQuestionPointsInput{
			TestID:      scenario.Test.ID,
			QuestionIds: []uuid.UUID{scenario.Questions[0].ID, unauthorizedQuestions[0].ID},
		}

		result, err := test.BatchDeleteQuestionPoints(ctx, scenario.User.ID, input)
		assert.Error(t, err)
		assert.False(t, result)
		assert.Contains(t, err.Error(), "some questions are not accessible")
	})

	t.Run("BatchDeleteQuestionPoints_NonExistentQuestion", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)
		nonExistentQuestionID := uuid.New()

		input := model.BatchDeleteQuestionPointsInput{
			TestID:      scenario.Test.ID,
			QuestionIds: []uuid.UUID{nonExistentQuestionID},
		}

		result, err := test.BatchDeleteQuestionPoints(ctx, scenario.User.ID, input)
		assert.Error(t, err)
		assert.False(t, result)
		assert.Contains(t, err.Error(), "some questions are not accessible")
	})

	t.Run("BatchDeleteQuestionPoints_DuplicateQuestionIds", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)

		// Set up question points
		questionPointsInput := model.BatchUpdateQuestionPointsInput{
			TestID: scenario.Test.ID,
			QuestionPoints: []*model.QuestionPointsInput{
				{QuestionID: scenario.Questions[0].ID, Points: 5},
			},
		}
		_, err := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, questionPointsInput)
		assert.NoError(t, err)

		// Try to delete the same question multiple times
		input := model.BatchDeleteQuestionPointsInput{
			TestID:      scenario.Test.ID,
			QuestionIds: []uuid.UUID{scenario.Questions[0].ID, scenario.Questions[0].ID},
		}

		result, err := test.BatchDeleteQuestionPoints(ctx, scenario.User.ID, input)
		// This should succeed as deleting the same question point multiple times is harmless
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchDeleteQuestionPoints_NoExistingPoints", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)

		// Try to delete question points that don't exist
		input := model.BatchDeleteQuestionPointsInput{
			TestID:      scenario.Test.ID,
			QuestionIds: []uuid.UUID{scenario.Questions[0].ID, scenario.Questions[1].ID},
		}

		result, err := test.BatchDeleteQuestionPoints(ctx, scenario.User.ID, input)
		// Should succeed even if no points exist to delete
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchDeleteQuestionPoints_LargeNumberOfQuestions", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 2)

		// Create a collection with many questions
		collectionEntity, manyQuestions := prepare.CreateCollectionWithQuestions(t, scenario.User.ID, 15)
		test.AddMultiCollection(ctx, scenario.User.ID, model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{collectionEntity.ID},
		})

		// Set up question points for all questions
		var questionPointsData []*model.QuestionPointsInput
		var questionIds []uuid.UUID
		for _, question := range manyQuestions {
			questionPointsData = append(questionPointsData, &model.QuestionPointsInput{
				QuestionID: question.ID,
				Points:     2,
			})
			questionIds = append(questionIds, question.ID)
		}

		questionPointsInput := model.BatchUpdateQuestionPointsInput{
			TestID:         scenario.Test.ID,
			QuestionPoints: questionPointsData,
		}
		_, err := test.BatchUpdateQuestionPoints(ctx, scenario.User.ID, questionPointsInput)
		assert.NoError(t, err)

		// Delete all question points
		input := model.BatchDeleteQuestionPointsInput{
			TestID:      scenario.Test.ID,
			QuestionIds: questionIds,
		}

		result, err := test.BatchDeleteQuestionPoints(ctx, scenario.User.ID, input)
		assert.NoError(t, err)
		assert.True(t, result)
	})
}
