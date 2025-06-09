package question

import (
	"context"
	"template/integration_test/prepare"
	"template/integration_test/utils"
	"template/internal/features/auth"
	"template/internal/features/question"
	"template/internal/features/question_collection"
	"template/internal/graph/model"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUpdateQuestion(t *testing.T) {
	prepare.SetupTestDb(t)

	// Create test user
	userInput := model.RegisterInput{
		Email:    utils.Faker.Internet().Email(),
		Password: "testpassword123",
	}
	_, err := auth.Register(context.Background(), userInput)
	require.NoError(t, err)

	user, err := auth.Login(context.Background(), model.LoginInput{
		Email:    userInput.Email,
		Password: userInput.Password,
	})
	require.NoError(t, err)
	userID := user.ID

	// Create test question collection
	collectionInput := model.CreateQuestionCollectionInput{
		Title:       "Test Collection",
		Description: utils.Ptr("Test collection description"),
	}
	collection, err := question_collection.CreateQuestionCollection(context.Background(), userID, collectionInput)
	require.NoError(t, err)

	// Create another collection for testing collection updates
	anotherCollectionInput := model.CreateQuestionCollectionInput{
		Title:       "Another Collection",
		Description: utils.Ptr("Another collection description"),
	}
	anotherCollection, err := question_collection.CreateQuestionCollection(context.Background(), userID, anotherCollectionInput)
	require.NoError(t, err)

	// Create test question
	questionInput := model.CreateQuestionInput{
		QuestionText:         "What is the capital of France?",
		QuestionCollectionID: collection.ID,
		Points:               10,
		Options: []*model.QuestionOptionInput{
			{
				OptionText: "Paris",
				IsCorrect:  true,
			},
			{
				OptionText: "London",
				IsCorrect:  false,
			},
		},
	}
	createdQuestion, err := question.CreateQuestion(context.Background(), userID, questionInput)
	require.NoError(t, err)

	t.Run("UpdateQuestion_QuestionTextOnly", func(t *testing.T) {
		updateInput := model.UpdateQuestionInput{
			QuestionText: utils.Ptr("What is the capital of Germany?"),
			Points:       createdQuestion.Points, // Keep existing points
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedQuestion)
		assert.Equal(t, *updateInput.QuestionText, updatedQuestion.QuestionText)
		assert.Equal(t, createdQuestion.CollectionID, updatedQuestion.CollectionID) // Should remain unchanged
		assert.Equal(t, createdQuestion.Points, updatedQuestion.Points)             // Should remain unchanged
	})

	t.Run("UpdateQuestion_PointsOnly", func(t *testing.T) {
		// Create a fresh question for this test
		freshQuestionInput := model.CreateQuestionInput{
			QuestionText:         "Fresh question for points-only test",
			QuestionCollectionID: collection.ID,
			Points:               15,
			Options: []*model.QuestionOptionInput{
				{
					OptionText: "Fresh option",
					IsCorrect:  true,
				},
			},
		}
		freshQuestion, err := question.CreateQuestion(context.Background(), userID, freshQuestionInput)
		require.NoError(t, err)

		updateInput := model.UpdateQuestionInput{
			Points: 25,
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, freshQuestion.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedQuestion)
		assert.Equal(t, updateInput.Points, updatedQuestion.Points)
		assert.Equal(t, freshQuestion.QuestionText, updatedQuestion.QuestionText) // Should remain unchanged
		assert.Equal(t, freshQuestion.CollectionID, updatedQuestion.CollectionID) // Should remain unchanged
	})

	t.Run("UpdateQuestion_ZeroPoints", func(t *testing.T) {
		updateInput := model.UpdateQuestionInput{
			Points: 0,
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		// Zero points should fail due to schema validation (Positive() constraint)
		assert.Error(t, err)
		assert.Nil(t, updatedQuestion)
		assert.Contains(t, err.Error(), "value out of range")
	})

	t.Run("UpdateQuestion_NegativePoints", func(t *testing.T) {
		updateInput := model.UpdateQuestionInput{
			Points: -10,
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		// Negative points should fail due to schema validation (Positive() constraint)
		assert.Error(t, err)
		assert.Nil(t, updatedQuestion)
		assert.Contains(t, err.Error(), "value out of range")
	})

	t.Run("UpdateQuestion_HighPoints", func(t *testing.T) {
		updateInput := model.UpdateQuestionInput{
			Points: 100,
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedQuestion)
		assert.Equal(t, 100, updatedQuestion.Points)
	})

	t.Run("UpdateQuestion_CollectionOnly", func(t *testing.T) {
		updateInput := model.UpdateQuestionInput{
			QuestionCollectionID: &anotherCollection.ID,
			Points:               createdQuestion.Points, // Keep existing points
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedQuestion)
		assert.Equal(t, anotherCollection.ID, updatedQuestion.CollectionID)
		assert.Equal(t, createdQuestion.Points, updatedQuestion.Points) // Should remain unchanged
	})

	t.Run("UpdateQuestion_TextAndPoints", func(t *testing.T) {
		updateInput := model.UpdateQuestionInput{
			QuestionText: utils.Ptr("What is the capital of Italy?"),
			Points:       15,
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedQuestion)
		assert.Equal(t, *updateInput.QuestionText, updatedQuestion.QuestionText)
		assert.Equal(t, updateInput.Points, updatedQuestion.Points)
	})

	t.Run("UpdateQuestion_WithNewOptions", func(t *testing.T) {
		updateInput := model.UpdateQuestionInput{
			QuestionText: utils.Ptr("Which are programming languages?"),
			Points:       20,
			Options: []*model.QuestionOptionInput{
				{
					OptionText: "Go",
					IsCorrect:  true,
				},
				{
					OptionText: "Python",
					IsCorrect:  true,
				},
				{
					OptionText: "HTML",
					IsCorrect:  false,
				},
			},
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedQuestion)
		assert.Equal(t, *updateInput.QuestionText, updatedQuestion.QuestionText)
		assert.Equal(t, updateInput.Points, updatedQuestion.Points)
	})

	t.Run("UpdateQuestion_RemoveAllOptions", func(t *testing.T) {
		updateInput := model.UpdateQuestionInput{
			Options: []*model.QuestionOptionInput{}, // Empty slice to remove all options
			Points:  5,
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedQuestion)
		assert.Equal(t, updateInput.Points, updatedQuestion.Points)
	})

	t.Run("UpdateQuestion_NoCorrectOption", func(t *testing.T) {
		updateInput := model.UpdateQuestionInput{
			Points: 15,
			Options: []*model.QuestionOptionInput{
				{
					OptionText: "Wrong 1",
					IsCorrect:  false,
				},
				{
					OptionText: "Wrong 2",
					IsCorrect:  false,
				},
			},
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		assert.Error(t, err)
		assert.Nil(t, updatedQuestion)
		assert.Contains(t, err.Error(), "at least one option must be correct")
	})

	t.Run("UpdateQuestion_NotFound", func(t *testing.T) {
		nonExistentID := uuid.New()
		updateInput := model.UpdateQuestionInput{
			QuestionText: utils.Ptr("Updated question"),
			Points:       10,
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, nonExistentID, updateInput)
		assert.Error(t, err)
		assert.Nil(t, updatedQuestion)
		assert.Contains(t, err.Error(), "question not found")
	})

	t.Run("UpdateQuestion_UnauthorizedUser", func(t *testing.T) {
		// Create another user
		anotherUserInput := model.RegisterInput{
			Email:    utils.Faker.Internet().Email(),
			Password: "testpassword123",
		}
		_, err := auth.Register(context.Background(), anotherUserInput)
		require.NoError(t, err)

		anotherUser, err := auth.Login(context.Background(), model.LoginInput{
			Email:    anotherUserInput.Email,
			Password: anotherUserInput.Password,
		})
		require.NoError(t, err)

		updateInput := model.UpdateQuestionInput{
			QuestionText: utils.Ptr("Unauthorized update"),
			Points:       10,
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), anotherUser.ID, createdQuestion.ID, updateInput)
		assert.Error(t, err)
		assert.Nil(t, updatedQuestion)
		assert.Contains(t, err.Error(), "don't have access")
	})

	t.Run("UpdateQuestion_InvalidCollection", func(t *testing.T) {
		invalidCollectionID := uuid.New()
		updateInput := model.UpdateQuestionInput{
			QuestionCollectionID: &invalidCollectionID,
			Points:               10,
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		assert.Error(t, err)
		assert.Nil(t, updatedQuestion)
		assert.Contains(t, err.Error(), "collection not found")
	})

	t.Run("UpdateQuestion_UnauthorizedCollection", func(t *testing.T) {
		// Create another user and their collection
		anotherUserInput := model.RegisterInput{
			Email:    utils.Faker.Internet().Email(),
			Password: "testpassword123",
		}
		_, err := auth.Register(context.Background(), anotherUserInput)
		require.NoError(t, err)

		anotherUser, err := auth.Login(context.Background(), model.LoginInput{
			Email:    anotherUserInput.Email,
			Password: anotherUserInput.Password,
		})
		require.NoError(t, err)

		// Create collection for another user
		anotherUserCollectionInput := model.CreateQuestionCollectionInput{
			Title: "Another User's Collection",
		}
		anotherUserCollection, err := question_collection.CreateQuestionCollection(context.Background(), anotherUser.ID, anotherUserCollectionInput)
		require.NoError(t, err)

		// Try to move question to another user's collection
		updateInput := model.UpdateQuestionInput{
			QuestionCollectionID: &anotherUserCollection.ID,
			Points:               10,
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		assert.Error(t, err)
		assert.Nil(t, updatedQuestion)
		assert.Contains(t, err.Error(), "don't have access")
	})

	t.Run("UpdateQuestion_EmptyUpdate", func(t *testing.T) {
		updateInput := model.UpdateQuestionInput{
			Points: createdQuestion.Points, // At minimum, points is required
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		assert.NoError(t, err) // Should succeed even with minimal changes
		assert.NotNil(t, updatedQuestion)
		assert.Equal(t, createdQuestion.Points, updatedQuestion.Points)
	})

	t.Run("UpdateQuestion_PointsValidation", func(t *testing.T) {
		testCases := []struct {
			name           string
			points         int
			expectedPoints int
			shouldSucceed  bool
		}{
			{
				name:           "Update to positive points",
				points:         75,
				expectedPoints: 75,
				shouldSucceed:  true,
			},
			{
				name:           "Update to minimum valid points (1)",
				points:         1,
				expectedPoints: 1,
				shouldSucceed:  true,
			},
			{
				name:           "Update to zero points (should fail)",
				points:         0,
				expectedPoints: 0,
				shouldSucceed:  false,
			},
			{
				name:           "Update to negative points (should fail)",
				points:         -30,
				expectedPoints: -30,
				shouldSucceed:  false,
			},
			{
				name:           "Update to large points value",
				points:         1000000,
				expectedPoints: 1000000,
				shouldSucceed:  true,
			},
			{
				name:           "Update to very negative points (should fail)",
				points:         -1000000,
				expectedPoints: -1000000,
				shouldSucceed:  false,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				updateInput := model.UpdateQuestionInput{
					Points: tc.points,
				}

				updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)

				if tc.shouldSucceed {
					assert.NoError(t, err)
					assert.NotNil(t, updatedQuestion)
					assert.Equal(t, tc.expectedPoints, updatedQuestion.Points)
				} else {
					assert.Error(t, err)
					assert.Nil(t, updatedQuestion)
					assert.Contains(t, err.Error(), "value out of range")
				}
			})
		}
	})

	t.Run("UpdateQuestion_PointsAndOptionsValidation", func(t *testing.T) {
		// Test updating both points and options together
		updateInput := model.UpdateQuestionInput{
			Points: 25,
			Options: []*model.QuestionOptionInput{
				{
					OptionText: "New correct option",
					IsCorrect:  true,
				},
				{
					OptionText: "New incorrect option",
					IsCorrect:  false,
				},
			},
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedQuestion)
		assert.Equal(t, 25, updatedQuestion.Points)
	})

	t.Run("UpdateQuestion_PointsWithCompleteUpdate", func(t *testing.T) {
		// Test updating all fields including points
		updateInput := model.UpdateQuestionInput{
			QuestionText:         utils.Ptr("Completely updated question with new points?"),
			QuestionCollectionID: &anotherCollection.ID,
			Points:               50,
			Options: []*model.QuestionOptionInput{
				{
					OptionText: "Updated option 1",
					IsCorrect:  true,
				},
				{
					OptionText: "Updated option 2",
					IsCorrect:  false,
				},
				{
					OptionText: "Updated option 3",
					IsCorrect:  false,
				},
			},
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedQuestion)
		assert.Equal(t, *updateInput.QuestionText, updatedQuestion.QuestionText)
		assert.Equal(t, anotherCollection.ID, updatedQuestion.CollectionID)
		assert.Equal(t, updateInput.Points, updatedQuestion.Points)
	})
}
