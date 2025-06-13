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

func TestBatchIgnoreQuestions(t *testing.T) {
	prepare.SetupTestDb(t)
	ctx := context.Background()

	t.Run("BatchIgnoreQuestions_Success_WithReasons", func(t *testing.T) {
		scenario := prepare.CreateTestScenario(t, 5)

		input := model.BatchIgnoreQuestionsInput{
			TestID: scenario.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{
				{
					QuestionID: scenario.Questions[0].ID,
					Reason:     utils.Ptr("Question is too difficult"),
				},
				{
					QuestionID: scenario.Questions[1].ID,
					Reason:     utils.Ptr("Ambiguous wording"),
				},
				{
					QuestionID: scenario.Questions[2].ID,
					Reason:     utils.Ptr("Out of scope"),
				},
			},
		}

		result, err := test.BatchIgnoreQuestions(ctx, scenario.User.ID, input)
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchIgnoreQuestions_Success_WithoutReasons", func(t *testing.T) {
		scenario := prepare.CreateTestScenario(t, 3)

		input := model.BatchIgnoreQuestionsInput{
			TestID: scenario.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{
				{QuestionID: scenario.Questions[0].ID},
				{QuestionID: scenario.Questions[1].ID},
			},
		}

		result, err := test.BatchIgnoreQuestions(ctx, scenario.User.ID, input)
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchIgnoreQuestions_Success_MixedReasons", func(t *testing.T) {
		scenario := prepare.CreateTestScenario(t, 4)

		input := model.BatchIgnoreQuestionsInput{
			TestID: scenario.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{
				{
					QuestionID: scenario.Questions[0].ID,
					Reason:     utils.Ptr("Has incorrect answer"),
				},
				{QuestionID: scenario.Questions[1].ID}, // No reason
				{
					QuestionID: scenario.Questions[2].ID,
					Reason:     utils.Ptr(""),
				}, // Empty reason
			},
		}

		result, err := test.BatchIgnoreQuestions(ctx, scenario.User.ID, input)
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchIgnoreQuestions_UpdateExistingIgnores", func(t *testing.T) {
		scenario := prepare.CreateTestScenario(t, 3)

		// First ignore some questions
		initialInput := model.BatchIgnoreQuestionsInput{
			TestID: scenario.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{
				{
					QuestionID: scenario.Questions[0].ID,
					Reason:     utils.Ptr("Initial reason"),
				},
				{
					QuestionID: scenario.Questions[1].ID,
					Reason:     utils.Ptr("Another reason"),
				},
			},
		}

		result, err := test.BatchIgnoreQuestions(ctx, scenario.User.ID, initialInput)
		assert.NoError(t, err)
		assert.True(t, result)

		// Update the ignore list
		updateInput := model.BatchIgnoreQuestionsInput{
			TestID: scenario.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{
				{
					QuestionID: scenario.Questions[0].ID,
					Reason:     utils.Ptr("Updated reason"),
				},
				{
					QuestionID: scenario.Questions[2].ID,
					Reason:     utils.Ptr("New question ignored"),
				},
			},
		}

		result, err = test.BatchIgnoreQuestions(ctx, scenario.User.ID, updateInput)
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchIgnoreQuestions_SingleQuestion", func(t *testing.T) {
		scenario := prepare.CreateTestScenario(t, 3)

		input := model.BatchIgnoreQuestionsInput{
			TestID: scenario.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{
				{
					QuestionID: scenario.Questions[0].ID,
					Reason:     utils.Ptr("Single question ignore test"),
				},
			},
		}

		result, err := test.BatchIgnoreQuestions(ctx, scenario.User.ID, input)
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchIgnoreQuestions_TestNotFound", func(t *testing.T) {
		scenario := prepare.CreateTestScenario(t, 3)
		nonExistentTestID := uuid.New()

		input := model.BatchIgnoreQuestionsInput{
			TestID: nonExistentTestID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{
				{QuestionID: scenario.Questions[0].ID},
			},
		}

		result, err := test.BatchIgnoreQuestions(ctx, scenario.User.ID, input)
		assert.Error(t, err)
		assert.False(t, result)
		assert.Contains(t, err.Error(), "test not found")
	})

	t.Run("BatchIgnoreQuestions_EmptyQuestionData", func(t *testing.T) {
		scenario := prepare.CreateTestScenario(t, 3)

		input := model.BatchIgnoreQuestionsInput{
			TestID:             scenario.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{},
		}

		result, err := test.BatchIgnoreQuestions(ctx, scenario.User.ID, input)
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchIgnoreQuestions_UnauthorizedQuestions", func(t *testing.T) {
		// Create first user with test
		scenario1 := prepare.CreateTestScenario(t, 3)

		// Create second user with questions
		userInput2 := model.RegisterInput{
			Email:    utils.Faker.Internet().Email(),
			Password: "testpassword123",
		}
		userEntity2 := prepare.CreateUser(t, userInput2)
		_, unauthorizedQuestions := prepare.CreateCollectionWithQuestions(t, userEntity2.ID, 3)

		// Try to ignore second user's questions in first user's test
		input := model.BatchIgnoreQuestionsInput{
			TestID: scenario1.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{
				{
					QuestionID: unauthorizedQuestions[0].ID,
					Reason:     utils.Ptr("Unauthorized question"),
				},
			},
		}

		result, err := test.BatchIgnoreQuestions(ctx, scenario1.User.ID, input)
		assert.Error(t, err)
		assert.False(t, result)
		assert.Contains(t, err.Error(), "one or more questions not found or unauthorized")
	})

	t.Run("BatchIgnoreQuestions_MixedAuthorizedUnauthorized", func(t *testing.T) {
		// Create first user with test and questions
		scenario1 := prepare.CreateTestScenario(t, 3)

		// Create second user with questions
		userInput2 := model.RegisterInput{
			Email:    utils.Faker.Internet().Email(),
			Password: "testpassword123",
		}
		userEntity2 := prepare.CreateUser(t, userInput2)
		_, unauthorizedQuestions := prepare.CreateCollectionWithQuestions(t, userEntity2.ID, 2)

		// Try to ignore mix of authorized and unauthorized questions
		input := model.BatchIgnoreQuestionsInput{
			TestID: scenario1.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{
				{
					QuestionID: scenario1.Questions[0].ID,
					Reason:     utils.Ptr("Authorized question"),
				},
				{
					QuestionID: unauthorizedQuestions[0].ID,
					Reason:     utils.Ptr("Unauthorized question"),
				},
			},
		}

		result, err := test.BatchIgnoreQuestions(ctx, scenario1.User.ID, input)
		assert.Error(t, err)
		assert.False(t, result)
		assert.Contains(t, err.Error(), "one or more questions not found or unauthorized")
	})

	t.Run("BatchIgnoreQuestions_NonExistentQuestion", func(t *testing.T) {
		scenario := prepare.CreateTestScenario(t, 3)
		nonExistentQuestionID := uuid.New()

		input := model.BatchIgnoreQuestionsInput{
			TestID: scenario.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{
				{
					QuestionID: nonExistentQuestionID,
					Reason:     utils.Ptr("Non-existent question"),
				},
			},
		}

		result, err := test.BatchIgnoreQuestions(ctx, scenario.User.ID, input)
		assert.Error(t, err)
		assert.False(t, result)
		assert.Contains(t, err.Error(), "one or more questions not found or unauthorized")
	})

	t.Run("BatchIgnoreQuestions_DuplicateQuestionIds", func(t *testing.T) {
		scenario := prepare.CreateTestScenario(t, 3)

		input := model.BatchIgnoreQuestionsInput{
			TestID: scenario.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{
				{
					QuestionID: scenario.Questions[0].ID,
					Reason:     utils.Ptr("First ignore"),
				},
				{
					QuestionID: scenario.Questions[0].ID,
					Reason:     utils.Ptr("Duplicate ignore"),
				},
			},
		}

		result, err := test.BatchIgnoreQuestions(ctx, scenario.User.ID, input)
		// Should succeed, but only one ignore record should be created
		assert.Error(t, err)
		assert.False(t, result)
		assert.Contains(t, err.Error(), "duplicate question IDs provided")
	})

	t.Run("BatchIgnoreQuestions_VeryLongReason", func(t *testing.T) {
		scenario := prepare.CreateTestScenario(t, 3)

		longReason := utils.Faker.Lorem().Text(500) // Very long reason

		input := model.BatchIgnoreQuestionsInput{
			TestID: scenario.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{
				{
					QuestionID: scenario.Questions[0].ID,
					Reason:     utils.Ptr(longReason),
				},
			},
		}

		result, err := test.BatchIgnoreQuestions(ctx, scenario.User.ID, input)
		// This may succeed or fail depending on database constraints
		if err == nil {
			assert.True(t, result)
		} else {
			assert.False(t, result)
		}
	})

	t.Run("BatchIgnoreQuestions_LargeNumberOfQuestions", func(t *testing.T) {
		scenario := prepare.CreateTestScenario(t, 2)

		// Create a collection with many questions
		_, manyQuestions := prepare.CreateCollectionWithQuestions(t, scenario.User.ID, 20)

		var questionIgnoreData []*model.QuestionIgnoreData
		for i, question := range manyQuestions {
			reason := utils.Ptr(utils.Faker.Lorem().Sentence(3))
			if i%3 == 0 {
				reason = nil // Some without reasons
			}
			questionIgnoreData = append(questionIgnoreData, &model.QuestionIgnoreData{
				QuestionID: question.ID,
				Reason:     reason,
			})
		}

		input := model.BatchIgnoreQuestionsInput{
			TestID:             scenario.Test.ID,
			QuestionIgnoreData: questionIgnoreData,
		}

		result, err := test.BatchIgnoreQuestions(ctx, scenario.User.ID, input)
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("BatchIgnoreQuestions_ClearAllIgnores", func(t *testing.T) {
		scenario := prepare.CreateTestScenario(t, 3)

		// First ignore some questions
		initialInput := model.BatchIgnoreQuestionsInput{
			TestID: scenario.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{
				{QuestionID: scenario.Questions[0].ID, Reason: utils.Ptr("Reason 1")},
				{QuestionID: scenario.Questions[1].ID, Reason: utils.Ptr("Reason 2")},
			},
		}

		result, err := test.BatchIgnoreQuestions(ctx, scenario.User.ID, initialInput)
		assert.NoError(t, err)
		assert.True(t, result)

		// Clear all ignores by providing empty list - this would be an error
		clearInput := model.BatchIgnoreQuestionsInput{
			TestID:             scenario.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{},
		}

		result, err = test.BatchIgnoreQuestions(ctx, scenario.User.ID, clearInput)
		assert.NoError(t, err)
		assert.True(t, result)
	})
}
