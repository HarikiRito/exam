package test_session

import (
	"context"
	"template/integration_test/prepare"
	"template/internal/features/test_session"
	"template/internal/graph/model"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestPaginatedTestSessions(t *testing.T) {
	prepare.SetupTestDb(t)

	ctx := context.Background()

	// Create test scenario with user and test
	scenario := prepare.CreateTestScenario(t, []prepare.QuestionCountConfig{
		{Count: 5, Points: 5},
		{Count: 3, Points: 10},
	})

	// Create multiple test sessions for the user
	var sessionIDs []string
	for i := 0; i < 15; i++ {
		session, err := test_session.CreateTestSession(ctx, model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		})
		require.NoError(t, err)
		sessionIDs = append(sessionIDs, session.ID.String())
	}

	t.Run("PaginatedTestSessions_DefaultPagination", func(t *testing.T) {
		result, err := test_session.PaginatedTestSessions(ctx, scenario.User.ID, nil)
		require.NoError(t, err)
		require.NotNil(t, result)

		// Should return default limit (20) and show there are no more pages for 15 items
		require.LessOrEqual(t, len(result.Items), 20)
		require.Equal(t, 1, result.CurrentPage)
		require.Equal(t, 15, result.TotalItems)
		require.False(t, result.HasNextPage)
		require.False(t, result.HasPrevPage)
	})

	t.Run("PaginatedTestSessions_WithPaginationInput", func(t *testing.T) {
		page := 1
		limit := 5
		paginationInput := &model.PaginationInput{
			Page:  &page,
			Limit: &limit,
		}

		result, err := test_session.PaginatedTestSessions(ctx, scenario.User.ID, paginationInput)
		require.NoError(t, err)
		require.NotNil(t, result)

		require.Equal(t, 5, len(result.Items))
		require.Equal(t, 1, result.CurrentPage)
		require.Equal(t, 15, result.TotalItems)
		require.True(t, result.HasNextPage)
		require.False(t, result.HasPrevPage)
	})

	t.Run("PaginatedTestSessions_SecondPage", func(t *testing.T) {
		page := 2
		limit := 5
		paginationInput := &model.PaginationInput{
			Page:  &page,
			Limit: &limit,
		}

		result, err := test_session.PaginatedTestSessions(ctx, scenario.User.ID, paginationInput)
		require.NoError(t, err)
		require.NotNil(t, result)

		require.Equal(t, 5, len(result.Items))
		require.Equal(t, 2, result.CurrentPage)
		require.Equal(t, 15, result.TotalItems)
		require.True(t, result.HasNextPage)
		require.True(t, result.HasPrevPage)
	})

	t.Run("PaginatedTestSessions_LastPage", func(t *testing.T) {
		page := 3
		limit := 5
		paginationInput := &model.PaginationInput{
			Page:  &page,
			Limit: &limit,
		}

		result, err := test_session.PaginatedTestSessions(ctx, scenario.User.ID, paginationInput)
		require.NoError(t, err)
		require.NotNil(t, result)

		require.Equal(t, 5, len(result.Items))
		require.Equal(t, 3, result.CurrentPage)
		require.Equal(t, 15, result.TotalItems)
		require.False(t, result.HasNextPage)
		require.True(t, result.HasPrevPage)
	})

	t.Run("PaginatedTestSessions_LargeLimit", func(t *testing.T) {
		page := 1
		limit := 20
		paginationInput := &model.PaginationInput{
			Page:  &page,
			Limit: &limit,
		}

		result, err := test_session.PaginatedTestSessions(ctx, scenario.User.ID, paginationInput)
		require.NoError(t, err)
		require.NotNil(t, result)

		require.Equal(t, 15, len(result.Items))
		require.Equal(t, 1, result.CurrentPage)
		require.Equal(t, 15, result.TotalItems)
		require.False(t, result.HasNextPage)
		require.False(t, result.HasPrevPage)
	})

	t.Run("PaginatedTestSessions_UserIsolation", func(t *testing.T) {
		// Create another user with their own test sessions
		anotherUser := prepare.CreateUser(t, model.RegisterInput{
			Email:    "another@example.com",
			Password: "testpassword123",
		})

		// Create test sessions for the other user
		for i := 0; i < 3; i++ {
			_, err := test_session.CreateTestSession(ctx, model.CreateTestSessionInput{
				TestID: scenario.Test.ID,
				UserID: &anotherUser.ID,
			})
			require.NoError(t, err)
		}

		// First user should still see only their sessions
		result1, err := test_session.PaginatedTestSessions(ctx, scenario.User.ID, nil)
		require.NoError(t, err)
		require.Equal(t, 15, result1.TotalItems)

		// Second user should see only their sessions
		result2, err := test_session.PaginatedTestSessions(ctx, anotherUser.ID, nil)
		require.NoError(t, err)
		require.Equal(t, 3, result2.TotalItems)
	})

	t.Run("PaginatedTestSessions_EmptyResult", func(t *testing.T) {
		// Create a user with no test sessions
		emptyUser := prepare.CreateUser(t, model.RegisterInput{
			Email:    "empty@example.com",
			Password: "testpassword123",
		})

		result, err := test_session.PaginatedTestSessions(ctx, emptyUser.ID, nil)
		require.NoError(t, err)
		require.NotNil(t, result)

		require.Equal(t, 0, len(result.Items))
		require.Equal(t, 1, result.CurrentPage)
		require.Equal(t, 0, result.TotalItems)
		require.False(t, result.HasNextPage)
		require.False(t, result.HasPrevPage)
	})

	t.Run("PaginatedTestSessions_InvalidPage", func(t *testing.T) {
		page := 0
		limit := 5
		paginationInput := &model.PaginationInput{
			Page:  &page,
			Limit: &limit,
		}

		result, err := test_session.PaginatedTestSessions(ctx, scenario.User.ID, paginationInput)
		require.NoError(t, err)
		require.NotNil(t, result)

		// Should default to page 1
		require.Equal(t, 1, result.CurrentPage)
		require.Equal(t, 5, len(result.Items))
	})

	t.Run("PaginatedTestSessions_InvalidLimit", func(t *testing.T) {
		page := 1
		limit := 0
		paginationInput := &model.PaginationInput{
			Page:  &page,
			Limit: &limit,
		}

		result, err := test_session.PaginatedTestSessions(ctx, scenario.User.ID, paginationInput)
		require.NoError(t, err)
		require.NotNil(t, result)

		// Should use default limit (20)
		require.Equal(t, 15, len(result.Items))
	})

	t.Run("PaginatedTestSessions_VerifySessionOrder", func(t *testing.T) {
		// Test that sessions are returned in some consistent order
		page := 1
		limit := 5
		paginationInput := &model.PaginationInput{
			Page:  &page,
			Limit: &limit,
		}

		result1, err := test_session.PaginatedTestSessions(ctx, scenario.User.ID, paginationInput)
		require.NoError(t, err)

		result2, err := test_session.PaginatedTestSessions(ctx, scenario.User.ID, paginationInput)
		require.NoError(t, err)

		// Results should be consistent
		require.Equal(t, len(result1.Items), len(result2.Items))
		for i := range result1.Items {
			require.Equal(t, result1.Items[i].ID, result2.Items[i].ID)
		}
	})
}
