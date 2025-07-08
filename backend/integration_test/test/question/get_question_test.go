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

func TestGetQuestionByID(t *testing.T) {
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

	// Create test question
	questionInput := model.CreateQuestionInput{
		QuestionText:         "What is the capital of France?",
		QuestionCollectionID: collection.ID,
		Points:               15,
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

	t.Run("GetQuestionByID_Success", func(t *testing.T) {
		retrievedQuestion, err := question.GetQuestionByID(context.Background(), userID, createdQuestion.ID)
		assert.NoError(t, err)
		assert.NotNil(t, retrievedQuestion)
		assert.Equal(t, createdQuestion.ID, retrievedQuestion.ID)
		assert.Equal(t, createdQuestion.QuestionText, retrievedQuestion.QuestionText)
		assert.Equal(t, createdQuestion.CollectionID, retrievedQuestion.CollectionID)
		assert.Equal(t, createdQuestion.Points, retrievedQuestion.Points)
	})

	t.Run("GetQuestionByID_NotFound", func(t *testing.T) {
		nonExistentID := uuid.New()
		retrievedQuestion, err := question.GetQuestionByID(context.Background(), userID, nonExistentID)
		assert.Error(t, err)
		assert.Nil(t, retrievedQuestion)
	})

	t.Run("GetQuestionByID_UnauthorizedUser", func(t *testing.T) {
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

		// Try to get question created by first user
		retrievedQuestion, err := question.GetQuestionByID(context.Background(), anotherUser.ID, createdQuestion.ID)
		assert.Error(t, err)
		assert.Nil(t, retrievedQuestion)
	})

	t.Run("GetQuestionByID_InvalidUUID", func(t *testing.T) {
		// Test with nil UUID
		retrievedQuestion, err := question.GetQuestionByID(context.Background(), userID, uuid.Nil)
		assert.Error(t, err)
		assert.Nil(t, retrievedQuestion)
	})
}
