package question

import (
	"context"
	"fmt"
	"template/integration_test/setup"
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

func TestBulkQuestionOperations(t *testing.T) {
	dbSchema := utils.RandomDbSchema()
	setup.ResetTestSchema(t, dbSchema)
	t.Cleanup(func() {
		setup.DeleteTestSchema(t, dbSchema)
	})

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

	// Create test question collections
	collection1Input := model.CreateQuestionCollectionInput{
		Title:       "Collection 1",
		Description: utils.Ptr("First test collection"),
	}
	collection1, err := question_collection.CreateQuestionCollection(context.Background(), userID, collection1Input)
	require.NoError(t, err)

	collection2Input := model.CreateQuestionCollectionInput{
		Title:       "Collection 2",
		Description: utils.Ptr("Second test collection"),
	}
	collection2, err := question_collection.CreateQuestionCollection(context.Background(), userID, collection2Input)
	require.NoError(t, err)

	collection3Input := model.CreateQuestionCollectionInput{
		Title:       "Collection 3",
		Description: utils.Ptr("Third test collection"),
	}
	collection3, err := question_collection.CreateQuestionCollection(context.Background(), userID, collection3Input)
	require.NoError(t, err)

	// Create questions in different collections
	var collection1Questions []*ent.Question
	var collection2Questions []*ent.Question
	var allQuestionIDs []uuid.UUID

	// Questions for collection 1
	for i := 0; i < 3; i++ {
		questionInput := model.CreateQuestionInput{
			QuestionText:         fmt.Sprintf("Collection 1 Question %d", i+1),
			QuestionCollectionID: collection1.ID,
			Options: []*model.QuestionOptionInput{
				{
					OptionText: fmt.Sprintf("Option A%d", i+1),
					IsCorrect:  true,
				},
				{
					OptionText: fmt.Sprintf("Option B%d", i+1),
					IsCorrect:  false,
				},
			},
		}
		createdQuestion, err := question.CreateQuestion(context.Background(), userID, questionInput)
		require.NoError(t, err)
		collection1Questions = append(collection1Questions, createdQuestion)
		allQuestionIDs = append(allQuestionIDs, createdQuestion.ID)
	}

	// Questions for collection 2
	for i := 0; i < 2; i++ {
		questionInput := model.CreateQuestionInput{
			QuestionText:         fmt.Sprintf("Collection 2 Question %d", i+1),
			QuestionCollectionID: collection2.ID,
			Options: []*model.QuestionOptionInput{
				{
					OptionText: fmt.Sprintf("Option X%d", i+1),
					IsCorrect:  true,
				},
				{
					OptionText: fmt.Sprintf("Option Y%d", i+1),
					IsCorrect:  false,
				},
				{
					OptionText: fmt.Sprintf("Option Z%d", i+1),
					IsCorrect:  false,
				},
			},
		}
		createdQuestion, err := question.CreateQuestion(context.Background(), userID, questionInput)
		require.NoError(t, err)
		collection2Questions = append(collection2Questions, createdQuestion)
		allQuestionIDs = append(allQuestionIDs, createdQuestion.ID)
	}

	t.Run("GetQuestionsByCollectionIDs_SingleCollection", func(t *testing.T) {
		collectionIDs := []uuid.UUID{collection1.ID}
		questions, err := question.GetQuestionsByCollectionIDs(context.Background(), collectionIDs)
		assert.NoError(t, err)
		assert.NotNil(t, questions)
		assert.Len(t, questions, 3) // Should return 3 questions from collection 1

		// Verify all returned questions belong to collection 1
		for _, q := range questions {
			assert.Equal(t, collection1.ID, q.CollectionID)
		}
	})

	t.Run("GetQuestionsByCollectionIDs_MultipleCollections", func(t *testing.T) {
		collectionIDs := []uuid.UUID{collection1.ID, collection2.ID}
		questions, err := question.GetQuestionsByCollectionIDs(context.Background(), collectionIDs)
		assert.NoError(t, err)
		assert.NotNil(t, questions)
		assert.Len(t, questions, 5) // Should return 3 + 2 = 5 questions

		// Verify questions belong to the correct collections
		collection1Count := 0
		collection2Count := 0
		for _, q := range questions {
			if q.CollectionID == collection1.ID {
				collection1Count++
			} else if q.CollectionID == collection2.ID {
				collection2Count++
			}
		}
		assert.Equal(t, 3, collection1Count)
		assert.Equal(t, 2, collection2Count)
	})

	t.Run("GetQuestionsByCollectionIDs_EmptyCollection", func(t *testing.T) {
		collectionIDs := []uuid.UUID{collection3.ID} // Collection with no questions
		questions, err := question.GetQuestionsByCollectionIDs(context.Background(), collectionIDs)
		assert.NoError(t, err)
		assert.NotNil(t, questions)
		assert.Empty(t, questions)
	})

	t.Run("GetQuestionsByCollectionIDs_NonExistentCollection", func(t *testing.T) {
		nonExistentID := uuid.New()
		collectionIDs := []uuid.UUID{nonExistentID}
		questions, err := question.GetQuestionsByCollectionIDs(context.Background(), collectionIDs)
		assert.NoError(t, err)
		assert.NotNil(t, questions)
		assert.Empty(t, questions)
	})

	t.Run("GetQuestionsByCollectionIDs_EmptyInput", func(t *testing.T) {
		collectionIDs := []uuid.UUID{}
		questions, err := question.GetQuestionsByCollectionIDs(context.Background(), collectionIDs)
		assert.NoError(t, err)
		assert.NotNil(t, questions)
		assert.Empty(t, questions)
	})

	t.Run("GetQuestionsByCollectionIDs_UnauthorizedUser", func(t *testing.T) {
		// Note: This function doesn't have user authorization built-in
		// It returns all questions for the given collection IDs regardless of user
		// Authorization should be handled at a higher level
		collectionIDs := []uuid.UUID{collection1.ID, collection2.ID}
		questions, err := question.GetQuestionsByCollectionIDs(context.Background(), collectionIDs)
		assert.NoError(t, err)
		assert.NotNil(t, questions)
		assert.Len(t, questions, 5) // Will return all questions since no auth check
	})

	t.Run("GetQuestionOptionsByQuestionIDs_SingleQuestion", func(t *testing.T) {
		questionIDs := []uuid.UUID{collection1Questions[0].ID}
		options, err := question.GetQuestionOptionsByQuestionIDs(context.Background(), questionIDs)
		assert.NoError(t, err)
		assert.NotNil(t, options)
		assert.Len(t, options, 2) // Each question has 2 options

		// Verify all options belong to the correct question
		for _, option := range options {
			assert.Equal(t, collection1Questions[0].ID, option.QuestionID)
		}
	})

	t.Run("GetQuestionOptionsByQuestionIDs_MultipleQuestions", func(t *testing.T) {
		questionIDs := []uuid.UUID{
			collection1Questions[0].ID, // 2 options
			collection2Questions[0].ID, // 3 options
		}
		options, err := question.GetQuestionOptionsByQuestionIDs(context.Background(), questionIDs)
		assert.NoError(t, err)
		assert.NotNil(t, options)
		assert.Len(t, options, 5) // 2 + 3 = 5 options

		// Count options per question
		optionCounts := make(map[uuid.UUID]int)
		for _, option := range options {
			optionCounts[option.QuestionID]++
		}
		assert.Equal(t, 2, optionCounts[collection1Questions[0].ID])
		assert.Equal(t, 3, optionCounts[collection2Questions[0].ID])
	})

	t.Run("GetQuestionOptionsByQuestionIDs_AllQuestions", func(t *testing.T) {
		options, err := question.GetQuestionOptionsByQuestionIDs(context.Background(), allQuestionIDs)
		assert.NoError(t, err)
		assert.NotNil(t, options)

		// Collection 1: 3 questions × 2 options = 6 options
		// Collection 2: 2 questions × 3 options = 6 options
		// Total: 12 options
		assert.Len(t, options, 12)

		// Verify all questions have their options
		optionCounts := make(map[uuid.UUID]int)
		for _, option := range options {
			optionCounts[option.QuestionID]++
		}

		// Collection 1 questions should have 2 options each
		for _, q := range collection1Questions {
			assert.Equal(t, 2, optionCounts[q.ID])
		}

		// Collection 2 questions should have 3 options each
		for _, q := range collection2Questions {
			assert.Equal(t, 3, optionCounts[q.ID])
		}
	})

	t.Run("GetQuestionOptionsByQuestionIDs_NonExistentQuestion", func(t *testing.T) {
		nonExistentID := uuid.New()
		questionIDs := []uuid.UUID{nonExistentID}
		options, err := question.GetQuestionOptionsByQuestionIDs(context.Background(), questionIDs)
		assert.NoError(t, err)
		assert.NotNil(t, options)
		assert.Empty(t, options)
	})

	t.Run("GetQuestionOptionsByQuestionIDs_EmptyInput", func(t *testing.T) {
		questionIDs := []uuid.UUID{}
		options, err := question.GetQuestionOptionsByQuestionIDs(context.Background(), questionIDs)
		assert.NoError(t, err)
		assert.NotNil(t, options)
		assert.Empty(t, options)
	})

	t.Run("GetQuestionOptionsByQuestionIDs_UnauthorizedUser", func(t *testing.T) {
		// Note: This function doesn't have user authorization built-in
		// It returns all options for the given question IDs regardless of user
		// Authorization should be handled at a higher level
		options, err := question.GetQuestionOptionsByQuestionIDs(context.Background(), allQuestionIDs)
		assert.NoError(t, err)
		assert.NotNil(t, options)
		assert.Len(t, options, 12) // Will return all options since no auth check
	})

	t.Run("GetQuestionOptionsByQuestionIDs_MixedExistentAndNonExistent", func(t *testing.T) {
		nonExistentID := uuid.New()
		questionIDs := []uuid.UUID{
			collection1Questions[0].ID, // Exists - 2 options
			nonExistentID,              // Does not exist
			collection2Questions[0].ID, // Exists - 3 options
		}
		options, err := question.GetQuestionOptionsByQuestionIDs(context.Background(), questionIDs)
		assert.NoError(t, err)
		assert.NotNil(t, options)
		assert.Len(t, options, 5) // Only options from existing questions

		// Verify no options for non-existent question
		for _, option := range options {
			assert.NotEqual(t, nonExistentID, option.QuestionID)
		}
	})
}
