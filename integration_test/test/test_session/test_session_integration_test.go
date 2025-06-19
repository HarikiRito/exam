package test_session

import (
	"context"
	"template/integration_test/prepare"
	"template/integration_test/utils"
	"template/internal/ent/testsession"
	"template/internal/features/question"
	"template/internal/features/question_collection"
	"template/internal/features/test"
	"template/internal/features/test_session"
	"template/internal/graph/model"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestTestSessionIntegration(t *testing.T) {
	prepare.SetupTestDb(t)
	ctx := context.Background()

	t.Run("CompleteTestSessionFlow_Success", func(t *testing.T) {
		// Step 1: Create test scenario with questions and test question counts
		scenario := createTestScenarioWithQuestionCounts(t, 15)

		// Step 2: Create test session
		createInput := model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		}
		session, err := test_session.CreateTestSession(ctx, createInput)
		require.NoError(t, err)
		require.NotNil(t, session)
		assert.Equal(t, scenario.Test.ID, session.TestID)
		assert.Equal(t, scenario.User.ID, *session.UserID)
		assert.Equal(t, testsession.StatusPending, session.Status)

		// Step 3: Start test session
		startedSession, err := test_session.StartTestSession(ctx, scenario.User.ID, scenario.Test.ID)
		require.NoError(t, err)
		require.NotNil(t, startedSession)
		assert.Equal(t, testsession.StatusInProgress, startedSession.Status)
		assert.NotNil(t, startedSession.StartedAt)
		assert.Equal(t, session.ID, startedSession.ID) // Should be the same session

		// Step 4: Prepare correct answers for submit
		answers := prepareCorrectAnswers(t, ctx, startedSession.ID)

		// Step 5: Submit test session
		submitInput := model.SubmitTestSessionInput{
			Answers: answers,
		}
		completedSession, err := test_session.SubmitTestSession(ctx, scenario.User.ID, startedSession.ID, submitInput)
		require.NoError(t, err)
		require.NotNil(t, completedSession)
		assert.Equal(t, testsession.StatusCompleted, completedSession.Status)
		assert.NotNil(t, completedSession.CompletedAt)
		assert.Greater(t, completedSession.PointsEarned, 0) // Should have earned points for correct answers
	})

	t.Run("CreateTestSession_Success_WithoutUser", func(t *testing.T) {
		scenario := createTestScenarioWithQuestionCounts(t, 5)

		createInput := model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			// UserID is nil/optional
		}
		session, err := test_session.CreateTestSession(ctx, createInput)
		require.NoError(t, err)
		require.NotNil(t, session)
		assert.Equal(t, scenario.Test.ID, session.TestID)
		assert.Nil(t, session.UserID)
		assert.Equal(t, testsession.StatusPending, session.Status)
	})

	t.Run("CreateTestSession_InvalidTestID", func(t *testing.T) {
		nonExistentTestID := uuid.New()
		createInput := model.CreateTestSessionInput{
			TestID: nonExistentTestID,
		}
		session, err := test_session.CreateTestSession(ctx, createInput)
		assert.Error(t, err)
		assert.Nil(t, session)
	})

	t.Run("StartTestSession_AlreadyExistsAndPending", func(t *testing.T) {
		scenario := createTestScenarioWithQuestionCounts(t, 8)

		// Create first session
		createInput := model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		}
		firstSession, err := test_session.CreateTestSession(ctx, createInput)
		require.NoError(t, err)

		// Try to start - should use existing session
		startedSession, err := test_session.StartTestSession(ctx, scenario.User.ID, scenario.Test.ID)
		require.NoError(t, err)
		assert.Equal(t, firstSession.ID, startedSession.ID)
		assert.Equal(t, testsession.StatusInProgress, startedSession.Status)
	})

	t.Run("StartTestSession_NoExistingSession_ShouldFail", func(t *testing.T) {
		scenario := createTestScenarioWithQuestionCounts(t, 5)

		// Try to start without creating session first
		startedSession, err := test_session.StartTestSession(ctx, scenario.User.ID, scenario.Test.ID)
		assert.Error(t, err)
		assert.Nil(t, startedSession)
	})

	t.Run("StartTestSession_QuestionGeneration_DifferentPoints", func(t *testing.T) {
		scenario := createTestScenarioWithQuestionCounts(t, 20)

		// Create test session
		createInput := model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		}
		_, err := test_session.CreateTestSession(ctx, createInput)
		require.NoError(t, err)

		// Start test session and verify question generation
		startedSession, err := test_session.StartTestSession(ctx, scenario.User.ID, scenario.Test.ID)
		require.NoError(t, err)

		// Verify questions were generated according to test question counts
		sessionAnswers := getTestSessionAnswers(t, ctx, startedSession.ID)

		// Should have exactly the number of questions specified in test question counts
		// Based on our scenario: 2 questions with 5 points, 3 questions with 10 points, 2 questions with 15 points
		assert.Len(t, sessionAnswers, 7) // 2 + 3 + 2 = 7 total questions

		// Verify point distribution
		pointCounts := make(map[int]int)
		for _, answer := range sessionAnswers {
			points := 0
			if answer.Points != nil {
				points = *answer.Points
			}
			pointCounts[points]++
		}
		assert.Equal(t, 2, pointCounts[5])  // 2 questions with 5 points
		assert.Equal(t, 3, pointCounts[10]) // 3 questions with 10 points
		assert.Equal(t, 2, pointCounts[15]) // 2 questions with 15 points
	})

	t.Run("SubmitTestSession_CorrectAnswers_FullPoints", func(t *testing.T) {
		scenario := createTestScenarioWithQuestionCounts(t, 10)

		// Create and start session
		createInput := model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		}
		_, err := test_session.CreateTestSession(ctx, createInput)
		require.NoError(t, err)

		startedSession, err := test_session.StartTestSession(ctx, scenario.User.ID, scenario.Test.ID)
		require.NoError(t, err)

		// Prepare all correct answers
		answers := prepareCorrectAnswers(t, ctx, startedSession.ID)

		// Submit with correct answers
		submitInput := model.SubmitTestSessionInput{
			Answers: answers,
		}
		completedSession, err := test_session.SubmitTestSession(ctx, scenario.User.ID, startedSession.ID, submitInput)
		require.NoError(t, err)

		// Should get full points for all correct answers
		expectedPoints := calculateExpectedPoints(t, ctx, startedSession.ID)
		assert.Equal(t, expectedPoints, completedSession.PointsEarned)
	})

	t.Run("SubmitTestSession_IncorrectAnswers_ZeroPoints", func(t *testing.T) {
		scenario := createTestScenarioWithQuestionCounts(t, 10)

		// Create and start session
		createInput := model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		}
		_, err := test_session.CreateTestSession(ctx, createInput)
		require.NoError(t, err)

		startedSession, err := test_session.StartTestSession(ctx, scenario.User.ID, scenario.Test.ID)
		require.NoError(t, err)

		// Prepare all incorrect answers
		answers := prepareIncorrectAnswers(t, ctx, startedSession.ID)

		// Submit with incorrect answers
		submitInput := model.SubmitTestSessionInput{
			Answers: answers,
		}
		completedSession, err := test_session.SubmitTestSession(ctx, scenario.User.ID, startedSession.ID, submitInput)
		require.NoError(t, err)

		// Should get zero points for all incorrect answers
		assert.Equal(t, 0, completedSession.PointsEarned)
	})

	t.Run("SubmitTestSession_MixedAnswers_PartialPoints", func(t *testing.T) {
		scenario := createTestScenarioWithQuestionCounts(t, 10)

		// Create and start session
		createInput := model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		}
		_, err := test_session.CreateTestSession(ctx, createInput)
		require.NoError(t, err)

		startedSession, err := test_session.StartTestSession(ctx, scenario.User.ID, scenario.Test.ID)
		require.NoError(t, err)

		// Prepare mixed correct/incorrect answers (50% correct)
		answers := prepareMixedAnswers(t, ctx, startedSession.ID)

		// Submit with mixed answers
		submitInput := model.SubmitTestSessionInput{
			Answers: answers,
		}
		completedSession, err := test_session.SubmitTestSession(ctx, scenario.User.ID, startedSession.ID, submitInput)
		require.NoError(t, err)

		// Should get partial points (roughly half the total)
		expectedPoints := calculateExpectedPoints(t, ctx, startedSession.ID)
		assert.Greater(t, completedSession.PointsEarned, 0)
		assert.Less(t, completedSession.PointsEarned, expectedPoints)
	})

	t.Run("SubmitTestSession_WrongSessionStatus", func(t *testing.T) {
		scenario := createTestScenarioWithQuestionCounts(t, 5)

		// Create session but don't start it
		createInput := model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		}
		session, err := test_session.CreateTestSession(ctx, createInput)
		require.NoError(t, err)

		// Try to submit without starting (status is still PENDING)
		submitInput := model.SubmitTestSessionInput{
			Answers: []*model.TestSessionAnswerInput{},
		}
		completedSession, err := test_session.SubmitTestSession(ctx, scenario.User.ID, session.ID, submitInput)
		assert.Error(t, err)
		assert.Nil(t, completedSession)
		assert.Contains(t, err.Error(), "test session not found")
	})

	t.Run("SubmitTestSession_WrongNumberOfAnswers", func(t *testing.T) {
		scenario := createTestScenarioWithQuestionCounts(t, 8)

		// Create and start session
		createInput := model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		}
		_, err := test_session.CreateTestSession(ctx, createInput)
		require.NoError(t, err)

		startedSession, err := test_session.StartTestSession(ctx, scenario.User.ID, scenario.Test.ID)
		require.NoError(t, err)

		// Submit with wrong number of answers (too few)
		submitInput := model.SubmitTestSessionInput{
			Answers: []*model.TestSessionAnswerInput{
				{
					QuestionID:        uuid.New(),
					QuestionOptionIds: []uuid.UUID{uuid.New()},
					Order:             1,
				},
			},
		}
		completedSession, err := test_session.SubmitTestSession(ctx, scenario.User.ID, startedSession.ID, submitInput)
		assert.Error(t, err)
		assert.Nil(t, completedSession)
		assert.Contains(t, err.Error(), "test answers doesn't match")
	})

	t.Run("SubmitTestSession_UnauthorizedUser", func(t *testing.T) {
		scenario := createTestScenarioWithQuestionCounts(t, 5)

		// Create user 2
		user2Input := model.RegisterInput{
			Email:    utils.Faker.Internet().Email(),
			Password: "testpassword123",
		}
		user2Entity := prepare.CreateUser(t, user2Input)

		// Create and start session with user 1
		createInput := model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		}
		_, err := test_session.CreateTestSession(ctx, createInput)
		require.NoError(t, err)

		startedSession, err := test_session.StartTestSession(ctx, scenario.User.ID, scenario.Test.ID)
		require.NoError(t, err)

		// Try to submit with user 2 (unauthorized)
		submitInput := model.SubmitTestSessionInput{
			Answers: []*model.TestSessionAnswerInput{},
		}
		completedSession, err := test_session.SubmitTestSession(ctx, user2Entity.ID, startedSession.ID, submitInput)
		assert.Error(t, err)
		assert.Nil(t, completedSession)
		assert.Contains(t, err.Error(), "test session not found")
	})

	t.Run("SubmitTestSession_MultipleCorrectOptions", func(t *testing.T) {
		// This test covers questions with multiple correct answers
		scenario := createTestScenarioWithMultipleCorrectAnswers(t, 5)

		// Create and start session
		createInput := model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		}
		_, err := test_session.CreateTestSession(ctx, createInput)
		require.NoError(t, err)

		startedSession, err := test_session.StartTestSession(ctx, scenario.User.ID, scenario.Test.ID)
		require.NoError(t, err)

		// Prepare answers with all correct options selected
		answers := prepareMultipleCorrectAnswers(t, ctx, startedSession.ID)

		// Submit answers
		submitInput := model.SubmitTestSessionInput{
			Answers: answers,
		}
		completedSession, err := test_session.SubmitTestSession(ctx, scenario.User.ID, startedSession.ID, submitInput)
		require.NoError(t, err)

		// Should get full points for selecting all correct options
		expectedPoints := calculateExpectedPoints(t, ctx, startedSession.ID)
		assert.Equal(t, expectedPoints, completedSession.PointsEarned)
	})
}

// Helper functions for test setup and validation

func createTestScenarioWithQuestionCounts(t *testing.T, questionCount int) prepare.TestScenario {
	scenario := prepare.CreateTestScenario(t, []prepare.QuestionCountConfig{{Count: questionCount, Points: 10}})

	// Create test question counts with different point values
	testQuestionRequirements := []model.UpdateTestQuestionRequirementInput{
		{
			NumberOfQuestions: 2,
			PointsPerQuestion: 5,
		},
		{
			NumberOfQuestions: 3,
			PointsPerQuestion: 10,
		},
		{
			NumberOfQuestions: 2,
			PointsPerQuestion: 15,
		},
	}

	success, err := test.UpdateTestQuestionRequirement(context.Background(), scenario.User.ID, scenario.Test.ID, testQuestionRequirements)
	require.NoError(t, err)
	require.True(t, success)

	return scenario
}

func createTestScenarioWithMultipleCorrectAnswers(t *testing.T, questionCount int) prepare.TestScenario {
	userInput := model.RegisterInput{
		Email:    utils.Faker.Internet().Email(),
		Password: "testpassword123",
	}
	userEntity := prepare.CreateUser(t, userInput)

	testEntity := prepare.CreateTest(t, model.CreateTestInput{
		Name: utils.Faker.Lorem().Word(),
	})

	// Create collection with questions that have multiple correct answers
	collectionEntity := prepare.CreateQuestionCollection(t, userEntity.ID, model.CreateQuestionCollectionInput{
		Title:       utils.Faker.Lorem().Word(),
		Description: utils.Ptr(utils.Faker.Lorem().Sentence(10)),
	})

	// Create questions with multiple correct options
	questionInputs := make([]*model.UpdateQuestionData, questionCount)
	for i := 0; i < questionCount; i++ {
		options := []*model.UpdateQuestionOptionInput{
			{OptionText: utils.Ptr("Correct Option 1"), IsCorrect: utils.Ptr(true)},
			{OptionText: utils.Ptr("Correct Option 2"), IsCorrect: utils.Ptr(true)},
			{OptionText: utils.Ptr("Incorrect Option 1"), IsCorrect: utils.Ptr(false)},
			{OptionText: utils.Ptr("Incorrect Option 2"), IsCorrect: utils.Ptr(false)},
		}
		questionInputs[i] = &model.UpdateQuestionData{
			QuestionText: utils.Ptr(utils.Faker.Lorem().Sentence(10)),
			Options:      options,
			Points:       10,
		}
	}

	err := question_collection.UpdateBatchQuestionsByCollection(context.Background(), userEntity.ID, model.UpdateBatchQuestionsByCollectionInput{
		CollectionID: collectionEntity.ID,
		Questions:    questionInputs,
	})
	require.NoError(t, err)

	questions, err := question.GetQuestionsByCollectionIDs(context.Background(), []uuid.UUID{collectionEntity.ID})
	require.NoError(t, err)

	_, err = test.UpdateQuestionCollectionsForTest(context.Background(), userEntity.ID, model.AddMultiCollectionToTestInput{
		TestID:        testEntity.ID,
		CollectionIds: []uuid.UUID{collectionEntity.ID},
	})
	require.NoError(t, err)

	// Set up test question counts
	testQuestionRequirements := []model.UpdateTestQuestionRequirementInput{
		{
			NumberOfQuestions: questionCount,
			PointsPerQuestion: 10,
		},
	}

	success, err := test.UpdateTestQuestionRequirement(context.Background(), userEntity.ID, testEntity.ID, testQuestionRequirements)
	require.NoError(t, err)
	require.True(t, success)

	return prepare.TestScenario{
		User:       userEntity,
		Test:       testEntity,
		Collection: collectionEntity,
		Questions:  questions,
	}
}
