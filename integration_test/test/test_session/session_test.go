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
		session, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		})
		require.NoError(t, err)
		require.NotNil(t, session)
	})

	// Input Validation Tests
	t.Run("MissingTestID", func(t *testing.T) {
		_, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			UserID: &scenario.User.ID,
		})
		require.Error(t, err)
	})

	t.Run("InvalidTestID", func(t *testing.T) {
		invalidTestID := uuid.New()
		_, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			TestID: invalidTestID,
			UserID: &scenario.User.ID,
		})
		require.Error(t, err)
	})

	t.Run("MissingUserID", func(t *testing.T) {
		_, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
		})
		require.NoError(t, err)
	})

	t.Run("InvalidUserID", func(t *testing.T) {
		invalidUserID := uuid.New()
		_, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &invalidUserID,
		})
		require.Error(t, err)
	})

	t.Run("MaxPointsCalculation", func(t *testing.T) {
		// Create a test scenario with specific question count requirements
		questionCountConfigs := []prepare.QuestionCountConfig{
			{Count: 5, Points: 10}, // 5 questions * 10 points = 50 points
			{Count: 3, Points: 20}, // 3 questions * 20 points = 60 points
		}
		// Expected max points: 50 + 60 = 110

		scenario := prepare.CreateTestScenario(t, questionCountConfigs)

		session, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		})
		require.NoError(t, err)
		require.NotNil(t, session)

		// Verify that max points are correctly calculated
		expectedMaxPoints := 110 // (5 * 10) + (3 * 20)
		require.Equal(t, expectedMaxPoints, session.MaxPoints)
	})

	// Business Logic Tests
	t.Run("DuplicateTestSession", func(t *testing.T) {
		// Create the first session
		_, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		})
		require.NoError(t, err)

		// Attempt to create a duplicate session
		_, err = test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		})
		require.NoError(t, err)
	})
}
