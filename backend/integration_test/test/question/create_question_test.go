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
	success, err := auth.Register(context.Background(), userInput)
	require.NoError(t, err)
	require.True(t, success)

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

	t.Run("CreateQuestion_Success", func(t *testing.T) {
		input := model.CreateQuestionInput{
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
		assert.Equal(t, input.Points, createdQuestion.Points)
		assert.NotEqual(t, uuid.Nil, createdQuestion.ID)
	})

	t.Run("CreateQuestion_WithoutOptions", func(t *testing.T) {
		input := model.CreateQuestionInput{
			QuestionText:         "What is 2+2?",
			QuestionCollectionID: collection.ID,
			Points:               5,
			Options:              []*model.QuestionOptionInput{},
		}

		createdQuestion, err := question.CreateQuestion(context.Background(), userID, input)
		assert.NoError(t, err)
		assert.NotNil(t, createdQuestion)
		assert.Equal(t, input.QuestionText, createdQuestion.QuestionText)
		assert.Equal(t, input.Points, createdQuestion.Points)
	})

	t.Run("CreateQuestion_ZeroPoints", func(t *testing.T) {
		input := model.CreateQuestionInput{
			QuestionText:         "Question with zero points?",
			QuestionCollectionID: collection.ID,
			Points:               0,
			Options: []*model.QuestionOptionInput{
				{
					OptionText: "Answer",
					IsCorrect:  true,
				},
			},
		}

		createdQuestion, err := question.CreateQuestion(context.Background(), userID, input)
		assert.NoError(t, err)
		assert.NotNil(t, createdQuestion)
	})

	t.Run("create question with negative points", func(t *testing.T) {
		input := model.CreateQuestionInput{
			QuestionText:         "Question with negative points?",
			QuestionCollectionID: collection.ID,
			Points:               -5,
		}

		createdQuestion, err := question.CreateQuestion(context.Background(), userID, input)
		assert.Error(t, err)
		assert.Nil(t, createdQuestion)
	})

	t.Run("CreateQuestion_NegativePoints", func(t *testing.T) {
		input := model.CreateQuestionInput{
			QuestionText:         "Question with negative points?",
			QuestionCollectionID: collection.ID,
			Points:               -5,
			Options: []*model.QuestionOptionInput{
				{
					OptionText: "Answer",
					IsCorrect:  true,
				},
			},
		}

		createdQuestion, err := question.CreateQuestion(context.Background(), userID, input)
		// Negative points should fail due to schema validation (Positive() constraint)
		assert.Error(t, err)
		assert.Nil(t, createdQuestion)
		assert.Contains(t, err.Error(), "value out of range")
	})

	t.Run("CreateQuestion_HighPoints", func(t *testing.T) {
		input := model.CreateQuestionInput{
			QuestionText:         "High-value question?",
			QuestionCollectionID: collection.ID,
			Points:               100,
			Options: []*model.QuestionOptionInput{
				{
					OptionText: "Correct answer",
					IsCorrect:  true,
				},
				{
					OptionText: "Wrong answer",
					IsCorrect:  false,
				},
			},
		}

		createdQuestion, err := question.CreateQuestion(context.Background(), userID, input)
		assert.NoError(t, err)
		assert.NotNil(t, createdQuestion)
		assert.Equal(t, input.Points, createdQuestion.Points)
		assert.Equal(t, 100, createdQuestion.Points)
	})

	t.Run("CreateQuestion_InvalidCollection", func(t *testing.T) {
		invalidCollectionID := uuid.New()
		input := model.CreateQuestionInput{
			QuestionText:         "Test question",
			QuestionCollectionID: invalidCollectionID,
			Points:               10,
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
			Points:               10,
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
			Points:               10,
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
			Points:               15,
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
		assert.Equal(t, input.Points, createdQuestion.Points)
	})

	t.Run("CreateQuestion_LongQuestionText", func(t *testing.T) {
		longText := utils.Faker.Lorem().Sentence(100) // Very long question text
		input := model.CreateQuestionInput{
			QuestionText:         longText,
			QuestionCollectionID: collection.ID,
			Points:               20,
			Options:              []*model.QuestionOptionInput{},
		}

		createdQuestion, err := question.CreateQuestion(context.Background(), userID, input)
		assert.NoError(t, err)
		assert.NotNil(t, createdQuestion)
		assert.Equal(t, longText, createdQuestion.QuestionText)
		assert.Equal(t, input.Points, createdQuestion.Points)
	})
}
