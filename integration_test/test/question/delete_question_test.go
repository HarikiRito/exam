package question

import (
	"context"
	"fmt"
	"template/integration_test/prepare"
	"template/integration_test/utils"
	"template/internal/ent"
	"template/internal/features/auth"
	"template/internal/features/question"
	"template/internal/features/question_collection"
	"template/internal/graph/model"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestDeleteQuestion(t *testing.T) {
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

	t.Run("DeleteQuestion_Success", func(t *testing.T) {
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

		// Delete the question
		success, err := question.DeleteQuestion(context.Background(), userID, createdQuestion.ID)
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify question is deleted
		deletedQuestion, err := question.GetQuestionByID(context.Background(), userID, createdQuestion.ID)
		assert.Error(t, err)
		assert.Nil(t, deletedQuestion)
	})

	t.Run("DeleteQuestion_WithOptions_CascadeDelete", func(t *testing.T) {
		// Create test question with multiple options
		questionInput := model.CreateQuestionInput{
			QuestionText:         "Which are programming languages?",
			QuestionCollectionID: collection.ID,
			Points:               20,
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
				{
					OptionText: "CSS",
					IsCorrect:  false,
				},
			},
		}
		createdQuestion, err := question.CreateQuestion(context.Background(), userID, questionInput)
		require.NoError(t, err)

		// Delete the question
		success, err := question.DeleteQuestion(context.Background(), userID, createdQuestion.ID)
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify question and its options are deleted
		deletedQuestion, err := question.GetQuestionByID(context.Background(), userID, createdQuestion.ID)
		assert.Error(t, err)
		assert.Nil(t, deletedQuestion)
	})

	t.Run("DeleteQuestion_NotFound", func(t *testing.T) {
		nonExistentID := uuid.New()
		success, err := question.DeleteQuestion(context.Background(), userID, nonExistentID)
		assert.Error(t, err)
		assert.False(t, success)
		assert.Contains(t, err.Error(), "question not found")
	})

	t.Run("DeleteQuestion_UnauthorizedUser", func(t *testing.T) {
		// Create test question
		questionInput := model.CreateQuestionInput{
			QuestionText:         "Test question for unauthorized delete",
			QuestionCollectionID: collection.ID,
			Points:               15,
			Options: []*model.QuestionOptionInput{
				{
					OptionText: "Option 1",
					IsCorrect:  true,
				},
			},
		}
		createdQuestion, err := question.CreateQuestion(context.Background(), userID, questionInput)
		require.NoError(t, err)

		// Create another user
		anotherUserInput := model.RegisterInput{
			Email:    utils.Faker.Internet().Email(),
			Password: "testpassword123",
		}
		_, err = auth.Register(context.Background(), anotherUserInput)
		require.NoError(t, err)

		anotherUser, err := auth.Login(context.Background(), model.LoginInput{
			Email:    anotherUserInput.Email,
			Password: anotherUserInput.Password,
		})
		require.NoError(t, err)

		// Try to delete question created by first user
		success, err := question.DeleteQuestion(context.Background(), anotherUser.ID, createdQuestion.ID)
		assert.Error(t, err)
		assert.False(t, success)
		assert.Contains(t, err.Error(), "don't have access")

		// Verify question still exists
		existingQuestion, err := question.GetQuestionByID(context.Background(), userID, createdQuestion.ID)
		assert.NoError(t, err)
		assert.NotNil(t, existingQuestion)
	})

	t.Run("DeleteQuestion_InvalidUUID", func(t *testing.T) {
		success, err := question.DeleteQuestion(context.Background(), userID, uuid.Nil)
		assert.Error(t, err)
		assert.False(t, success)
	})

	t.Run("DeleteQuestion_MultipleQuestions", func(t *testing.T) {
		// Create multiple questions
		questions := make([]*ent.Question, 3)
		for i := 0; i < 3; i++ {
			questionInput := model.CreateQuestionInput{
				QuestionText:         fmt.Sprintf("Test question %d", i+1),
				QuestionCollectionID: collection.ID,
				Points:               5 + i,
				Options: []*model.QuestionOptionInput{
					{
						OptionText: fmt.Sprintf("Option %d", i+1),
						IsCorrect:  true,
					},
				},
			}
			createdQuestion, err := question.CreateQuestion(context.Background(), userID, questionInput)
			require.NoError(t, err)
			questions[i] = createdQuestion
		}

		// Delete each question
		for i, q := range questions {
			success, err := question.DeleteQuestion(context.Background(), userID, q.ID)
			assert.NoError(t, err, "Failed to delete question %d", i+1)
			assert.True(t, success, "Delete operation returned false for question %d", i+1)

			// Verify question is deleted
			deletedQuestion, err := question.GetQuestionByID(context.Background(), userID, q.ID)
			assert.Error(t, err, "Question %d should be deleted", i+1)
			assert.Nil(t, deletedQuestion, "Question %d should be nil after deletion", i+1)
		}
	})

	t.Run("DeleteQuestion_DoesNotAffectOtherQuestions", func(t *testing.T) {
		// Create two questions
		question1Input := model.CreateQuestionInput{
			QuestionText:         "Question to be deleted",
			QuestionCollectionID: collection.ID,
			Points:               10,
			Options: []*model.QuestionOptionInput{
				{
					OptionText: "Option 1",
					IsCorrect:  true,
				},
			},
		}
		question1, err := question.CreateQuestion(context.Background(), userID, question1Input)
		require.NoError(t, err)

		question2Input := model.CreateQuestionInput{
			QuestionText:         "Question to be kept",
			QuestionCollectionID: collection.ID,
			Points:               15,
			Options: []*model.QuestionOptionInput{
				{
					OptionText: "Option 2",
					IsCorrect:  true,
				},
			},
		}
		question2, err := question.CreateQuestion(context.Background(), userID, question2Input)
		require.NoError(t, err)

		// Delete first question
		success, err := question.DeleteQuestion(context.Background(), userID, question1.ID)
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify first question is deleted
		deletedQuestion, err := question.GetQuestionByID(context.Background(), userID, question1.ID)
		assert.Error(t, err)
		assert.Nil(t, deletedQuestion)

		// Verify second question still exists
		existingQuestion, err := question.GetQuestionByID(context.Background(), userID, question2.ID)
		assert.NoError(t, err)
		assert.NotNil(t, existingQuestion)
		assert.Equal(t, question2.ID, existingQuestion.ID)
		assert.Equal(t, question2.QuestionText, existingQuestion.QuestionText)
	})
}
