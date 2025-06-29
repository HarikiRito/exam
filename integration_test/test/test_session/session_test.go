package test_session

import (
	"context"
	"template/integration_test/prepare"
	"template/internal/features/test_session"
	"template/internal/graph/model"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestStartTestSession(t *testing.T) {
	prepare.SetupTestDb(t)

	questionCountConfigs := []prepare.QuestionCountConfig{
		{Count: 30, Points: 25},
		{Count: 30, Points: 20},
		{Count: 30, Points: 15},
	}

	scenario := prepare.CreateTestScenario(t, questionCountConfigs)

	t.Run("CreateTestSession", func(t *testing.T) {
		sessions, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			TestID:  scenario.Test.ID,
			UserIds: []uuid.UUID{scenario.User.ID},
		})
		require.NoError(t, err)
		require.NotNil(t, sessions)
		require.Len(t, sessions, 1) // Should return one session for backward compatibility
		require.Equal(t, scenario.Test.ID, sessions[0].TestID)
		require.Equal(t, &scenario.User.ID, sessions[0].UserID)
	})

	// Bulk creation tests
	t.Run("BulkCreateTestSessions", func(t *testing.T) {
		// Create additional users for bulk testing
		user2 := prepare.CreateUser(t, model.RegisterInput{
			Email:    "user2@example.com",
			Password: "password123",
		})
		user3 := prepare.CreateUser(t, model.RegisterInput{
			Email:    "user3@example.com",
			Password: "password123",
		})

		userIds := []uuid.UUID{scenario.User.ID, user2.ID, user3.ID}

		sessions, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			TestID:  scenario.Test.ID,
			UserIds: userIds,
		})
		require.NoError(t, err)
		require.NotNil(t, sessions)
		require.Len(t, sessions, 3) // Should return three sessions

		// Verify each session was created correctly
		for i, session := range sessions {
			require.Equal(t, scenario.Test.ID, session.TestID)
			require.Equal(t, &userIds[i], session.UserID)
			require.Equal(t, 1800, session.MaxPoints) // Expected max points based on config
		}
	})

	t.Run("BulkCreateWithEmptyUserIds", func(t *testing.T) {
		// Test with empty userIds array - should fall back to single creation
		sessions, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			TestID:  scenario.Test.ID,
			UserIds: []uuid.UUID{scenario.User.ID},
		})
		require.NoError(t, err)
		require.NotNil(t, sessions)
		require.Len(t, sessions, 1) // Should create single session
		require.Equal(t, scenario.Test.ID, sessions[0].TestID)
		require.Equal(t, &scenario.User.ID, sessions[0].UserID)
	})

	// Input Validation Tests
	t.Run("MissingTestID", func(t *testing.T) {
		_, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			UserIds: []uuid.UUID{scenario.User.ID},
		})
		require.Error(t, err)
	})

	t.Run("InvalidTestID", func(t *testing.T) {
		invalidTestID := uuid.New()
		_, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			TestID:  invalidTestID,
			UserIds: []uuid.UUID{scenario.User.ID},
		})
		require.Error(t, err)
	})

	t.Run("MissingUserID", func(t *testing.T) {
		_, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			TestID:  scenario.Test.ID,
			UserIds: []uuid.UUID{},
		})
		require.Error(t, err)
	})

	t.Run("InvalidUserID", func(t *testing.T) {
		invalidUserID := uuid.New()
		_, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			TestID:  scenario.Test.ID,
			UserIds: []uuid.UUID{invalidUserID},
		})
		require.Error(t, err)
	})

	t.Run("BulkCreateWithInvalidUserID", func(t *testing.T) {
		invalidUserID := uuid.New()
		userIds := []uuid.UUID{scenario.User.ID, invalidUserID}

		_, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			TestID:  scenario.Test.ID,
			UserIds: userIds,
		})
		require.Error(t, err) // Should fail on invalid user ID
	})

	t.Run("MaxPointsCalculation", func(t *testing.T) {
		// Create a test scenario with specific question count requirements
		questionCountConfigs := []prepare.QuestionCountConfig{
			{Count: 5, Points: 10}, // 5 questions * 10 points = 50 points
			{Count: 3, Points: 20}, // 3 questions * 20 points = 60 points
		}
		// Expected max points: 50 + 60 = 110

		scenario := prepare.CreateTestScenario(t, questionCountConfigs)

		sessions, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			TestID:  scenario.Test.ID,
			UserIds: []uuid.UUID{scenario.User.ID},
		})
		require.NoError(t, err)
		require.NotNil(t, sessions)
		require.Len(t, sessions, 1)

		// Verify that max points are correctly calculated
		expectedMaxPoints := 110 // (5 * 10) + (3 * 20)
		require.Equal(t, expectedMaxPoints, sessions[0].MaxPoints)
	})

	// Business Logic Tests
	t.Run("DuplicateTestSession", func(t *testing.T) {
		// Create the first session
		_, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			TestID:  scenario.Test.ID,
			UserIds: []uuid.UUID{scenario.User.ID},
		})
		require.NoError(t, err)

		// Attempt to create a duplicate session
		_, err = test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			TestID:  scenario.Test.ID,
			UserIds: []uuid.UUID{scenario.User.ID},
		})
		require.NoError(t, err)
	})
}
