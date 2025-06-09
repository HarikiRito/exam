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

func TestCreateQuestion(t *testing.T) {
	prepare.SetupTestDb(t)

	// Create test user
	userInput := model.RegisterInput{
		Email:    utils.Faker.Internet().Email(),
		Password: "testpassword123",
	}
	tokenPair, err := auth.Register(context.Background(), userInput)
	require.NoError(t, err)
	require.NotEmpty(t, tokenPair.AccessToken)

	// Parse user ID from token for direct function calls
	userID, err := uuid.Parse(tokenPair.AccessToken) // This is a placeholder - in real implementation you'd decode the JWT
	if err != nil {
		// For testing purposes, create a user directly and get the ID
		user, err := auth.Login(context.Background(), model.LoginInput{
			Email:    userInput.Email,
			Password: userInput.Password,
		})
		require.NoError(t, err)
		userID = user.ID
	}

	// Create test question collection
	collectionInput := model.CreateQuestionCollectionInput{
		Title:       "Test Collection",
		Description: utils.Ptr("Test collection description"),
	}
	collection, err := question_collection.CreateQuestionCollection(context.Background(), userID, collectionInput)
	require.NoError(t, err)

	t.Run("CreateQuestion_Success", func(t *testing.T) {
		input := model.CreateQuestionInput{
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
				{
					OptionText: "Berlin",
					IsCorrect:  false,
				},
				{
					OptionText: "Madrid",
					IsCorrect:  false,
				},
			},
		}

		createdQuestion, err := question.CreateQuestion(context.Background(), userID, input)
		assert.NoError(t, err)
		assert.NotNil(t, createdQuestion)
		assert.Equal(t, input.QuestionText, createdQuestion.QuestionText)
		assert.Equal(t, collection.ID, createdQuestion.CollectionID)
		assert.NotEqual(t, uuid.Nil, createdQuestion.ID)
	})

	t.Run("CreateQuestion_WithoutOptions", func(t *testing.T) {
		input := model.CreateQuestionInput{
			QuestionText:         "What is 2+2?",
			QuestionCollectionID: collection.ID,
			Options:              []*model.QuestionOptionInput{},
		}

		createdQuestion, err := question.CreateQuestion(context.Background(), userID, input)
		assert.NoError(t, err)
		assert.NotNil(t, createdQuestion)
		assert.Equal(t, input.QuestionText, createdQuestion.QuestionText)
	})

	t.Run("CreateQuestion_InvalidCollection", func(t *testing.T) {
		invalidCollectionID := uuid.New()
		input := model.CreateQuestionInput{
			QuestionText:         "Test question",
			QuestionCollectionID: invalidCollectionID,
			Options:              []*model.QuestionOptionInput{},
		}

		createdQuestion, err := question.CreateQuestion(context.Background(), userID, input)
		assert.Error(t, err)
		assert.Nil(t, createdQuestion)
		assert.Contains(t, err.Error(), "collection not found")
	})

	t.Run("CreateQuestion_UnauthorizedCollection", func(t *testing.T) {
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

		// Try to create question in first user's collection
		input := model.CreateQuestionInput{
			QuestionText:         "Unauthorized question",
			QuestionCollectionID: collection.ID,
			Options:              []*model.QuestionOptionInput{},
		}

		createdQuestion, err := question.CreateQuestion(context.Background(), anotherUser.ID, input)
		assert.Error(t, err)
		assert.Nil(t, createdQuestion)
		assert.Contains(t, err.Error(), "don't have access")
	})

	t.Run("CreateQuestion_EmptyQuestionText", func(t *testing.T) {
		input := model.CreateQuestionInput{
			QuestionText:         "",
			QuestionCollectionID: collection.ID,
			Options:              []*model.QuestionOptionInput{},
		}

		createdQuestion, err := question.CreateQuestion(context.Background(), userID, input)
		assert.Error(t, err)
		assert.Nil(t, createdQuestion)
	})

	t.Run("CreateQuestion_MultipleCorrectOptions", func(t *testing.T) {
		input := model.CreateQuestionInput{
			QuestionText:         "Which are programming languages?",
			QuestionCollectionID: collection.ID,
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

		createdQuestion, err := question.CreateQuestion(context.Background(), userID, input)
		assert.NoError(t, err)
		assert.NotNil(t, createdQuestion)
	})

	t.Run("CreateQuestion_LongQuestionText", func(t *testing.T) {
		longText := utils.Faker.Lorem().Sentence(100) // Very long question text
		input := model.CreateQuestionInput{
			QuestionText:         longText,
			QuestionCollectionID: collection.ID,
			Options:              []*model.QuestionOptionInput{},
		}

		createdQuestion, err := question.CreateQuestion(context.Background(), userID, input)
		assert.NoError(t, err)
		assert.NotNil(t, createdQuestion)
		assert.Equal(t, longText, createdQuestion.QuestionText)
	})
}
