package question

import (
	"context"
	"template/integration_test/prepare"
	"template/integration_test/utils"
	"template/internal/ent"
	"template/internal/features/auth"
	"template/internal/features/question"
	"template/internal/features/question_collection"
	"template/internal/graph/model"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPaginatedQuestions(t *testing.T) {
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

	// Create multiple test questions
	questionTexts := []string{
		"What is the capital of France?",
		"What is 2 + 2?",
		"Which programming language is used for web development?",
		"What is the largest planet in our solar system?",
		"Who wrote Romeo and Juliet?",
		"What is the chemical symbol for gold?",
		"In which year did World War II end?",
		"What is the speed of light?",
	}

	createdQuestions := make([]*ent.Question, len(questionTexts))
	for i, text := range questionTexts {
		questionInput := model.CreateQuestionInput{
			QuestionText:         text,
			QuestionCollectionID: collection.ID,
			Options: []*model.QuestionOptionInput{
				{
					OptionText: "Option A",
					IsCorrect:  true,
				},
				{
					OptionText: "Option B",
					IsCorrect:  false,
				},
			},
		}
		createdQuestion, err := question.CreateQuestion(context.Background(), userID, questionInput)
		require.NoError(t, err)
		createdQuestions[i] = createdQuestion
	}

	t.Run("PaginatedQuestions_DefaultPagination", func(t *testing.T) {
		result, err := question.PaginatedQuestions(context.Background(), userID, nil)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.NotEmpty(t, result.Items)
		assert.GreaterOrEqual(t, len(result.Items), len(questionTexts))
		assert.Greater(t, result.TotalItems, 0)
		assert.Greater(t, result.TotalPages, 0)
		assert.Equal(t, 1, result.CurrentPage)
	})

	t.Run("PaginatedQuestions_WithPageAndLimit", func(t *testing.T) {
		paginationInput := &model.PaginationInput{
			Page:  utils.Ptr(1),
			Limit: utils.Ptr(3),
		}

		result, err := question.PaginatedQuestions(context.Background(), userID, paginationInput)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.LessOrEqual(t, len(result.Items), 3)
		assert.Equal(t, 1, result.CurrentPage)
		assert.GreaterOrEqual(t, result.TotalItems, len(questionTexts))
	})

	t.Run("PaginatedQuestions_SecondPage", func(t *testing.T) {
		paginationInput := &model.PaginationInput{
			Page:  utils.Ptr(2),
			Limit: utils.Ptr(3),
		}

		result, err := question.PaginatedQuestions(context.Background(), userID, paginationInput)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, 2, result.CurrentPage)

		if result.TotalItems > 3 {
			assert.NotEmpty(t, result.Items)
		}
	})

	t.Run("PaginatedQuestions_WithSearch", func(t *testing.T) {
		paginationInput := &model.PaginationInput{
			Search: utils.Ptr("France"),
		}

		result, err := question.PaginatedQuestions(context.Background(), userID, paginationInput)
		assert.NoError(t, err)
		assert.NotNil(t, result)

		// Should find the question about France
		found := false
		for _, item := range result.Items {
			if item.QuestionText == "What is the capital of France?" {
				found = true
				break
			}
		}
		assert.True(t, found, "Should find question containing 'France'")
	})

	t.Run("PaginatedQuestions_SearchNoResults", func(t *testing.T) {
		paginationInput := &model.PaginationInput{
			Search: utils.Ptr("nonexistentterm12345"),
		}

		result, err := question.PaginatedQuestions(context.Background(), userID, paginationInput)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Empty(t, result.Items)
		assert.Equal(t, 0, result.TotalItems)
		assert.Equal(t, 1, result.TotalPages)
	})

	t.Run("PaginatedQuestions_LargePageNumber", func(t *testing.T) {
		paginationInput := &model.PaginationInput{
			Page:  utils.Ptr(999),
			Limit: utils.Ptr(10),
		}

		result, err := question.PaginatedQuestions(context.Background(), userID, paginationInput)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Empty(t, result.Items)
		assert.Equal(t, 999, result.CurrentPage)
	})

	t.Run("PaginatedQuestions_ZeroLimit", func(t *testing.T) {
		paginationInput := &model.PaginationInput{
			Page:  utils.Ptr(1),
			Limit: utils.Ptr(0),
		}

		result, err := question.PaginatedQuestions(context.Background(), userID, paginationInput)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		// Should use default limit or handle gracefully
	})

	t.Run("PaginatedQuestions_NegativeValues", func(t *testing.T) {
		paginationInput := &model.PaginationInput{
			Page:  utils.Ptr(-1),
			Limit: utils.Ptr(-5),
		}

		result, err := question.PaginatedQuestions(context.Background(), userID, paginationInput)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		// Should handle negative values gracefully
	})

	t.Run("PaginatedQuestions_UnauthorizedUser", func(t *testing.T) {
		// Create another user
		anotherUserInput := model.RegisterInput{
			Email:    utils.Faker.Internet().Email(),
			Password: "testpassword123",
		}
		anotherUser := prepare.CreateUser(t, anotherUserInput)

		// Another user should not see first user's questions
		result, err := question.PaginatedQuestions(context.Background(), anotherUser.ID, nil)
		assert.NoError(t, err)
		assert.NotNil(t, result)

		// Should not contain any of the first user's questions
		for _, item := range result.Items {
			for _, createdQuestion := range createdQuestions {
				assert.NotEqual(t, createdQuestion.ID, item.ID, "Should not see other user's questions")
			}
		}
	})

	t.Run("PaginatedQuestions_EmptyDatabase", func(t *testing.T) {
		// Create a new user with no questions
		emptyUserInput := model.RegisterInput{
			Email:    utils.Faker.Internet().Email(),
			Password: "testpassword123",
		}
		emptyUser := prepare.CreateUser(t, emptyUserInput)

		result, err := question.PaginatedQuestions(context.Background(), emptyUser.ID, nil)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Empty(t, result.Items)
		assert.Equal(t, 0, result.TotalItems)
		assert.Equal(t, 1, result.TotalPages)
		assert.Equal(t, 1, result.CurrentPage)
		assert.False(t, result.HasNextPage)
		assert.False(t, result.HasPrevPage)
	})

	t.Run("PaginatedQuestions_HasNextPrevPage", func(t *testing.T) {
		// Test with small page size to ensure multiple pages
		paginationInput := &model.PaginationInput{
			Page:  utils.Ptr(1),
			Limit: utils.Ptr(2),
		}

		result, err := question.PaginatedQuestions(context.Background(), userID, paginationInput)
		assert.NoError(t, err)
		assert.NotNil(t, result)

		if result.TotalItems > 2 {
			assert.True(t, result.HasNextPage)
		}
		assert.False(t, result.HasPrevPage) // First page should not have previous page

		// Test second page
		paginationInput.Page = utils.Ptr(2)
		result, err = question.PaginatedQuestions(context.Background(), userID, paginationInput)
		assert.NoError(t, err)
		assert.NotNil(t, result)

		if result.TotalPages > 1 {
			assert.True(t, result.HasPrevPage) // Second page should have previous page
		}
	})
}
