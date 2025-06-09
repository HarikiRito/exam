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
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedQuestion)
		assert.Equal(t, *updateInput.QuestionText, updatedQuestion.QuestionText)
		assert.Equal(t, createdQuestion.CollectionID, updatedQuestion.CollectionID) // Should remain unchanged
	})

	t.Run("UpdateQuestion_CollectionOnly", func(t *testing.T) {
		updateInput := model.UpdateQuestionInput{
			QuestionCollectionID: &anotherCollection.ID,
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedQuestion)
		assert.Equal(t, anotherCollection.ID, updatedQuestion.CollectionID)
	})

	t.Run("UpdateQuestion_WithNewOptions", func(t *testing.T) {
		updateInput := model.UpdateQuestionInput{
			QuestionText: utils.Ptr("Which are programming languages?"),
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
	})

	t.Run("UpdateQuestion_RemoveAllOptions", func(t *testing.T) {
		updateInput := model.UpdateQuestionInput{
			Options: []*model.QuestionOptionInput{}, // Empty slice to remove all options
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedQuestion)
	})

	t.Run("UpdateQuestion_NoCorrectOption", func(t *testing.T) {
		updateInput := model.UpdateQuestionInput{
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
		}

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		assert.Error(t, err)
		assert.Nil(t, updatedQuestion)
		assert.Contains(t, err.Error(), "don't have access")
	})

	t.Run("UpdateQuestion_EmptyUpdate", func(t *testing.T) {
		updateInput := model.UpdateQuestionInput{} // No fields to update

		updatedQuestion, err := question.UpdateQuestion(context.Background(), userID, createdQuestion.ID, updateInput)
		assert.NoError(t, err) // Should succeed even with no changes
		assert.NotNil(t, updatedQuestion)
	})
}
