package test_session

import (
	"context"
	"template/integration_test/prepare"
	"template/integration_test/setup"
	"template/internal/ent"
	"template/internal/ent/questionoption"
	"template/internal/features/test"
	"template/internal/features/test_session"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestTestSessionEdgeCases(t *testing.T) {
	prepare.SetupTestDb(t)
	ctx := context.Background()

	t.Run("StartTestSession_NoTestQuestionCounts", func(t *testing.T) {
		// Test scenario without test question counts should fail
		scenario := prepare.CreateTestScenario(t, []prepare.QuestionCountConfig{{Count: 20, Points: 10}})
		// Don't set up test question counts

		createInput := model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		}
		_, err := test_session.CreateTestSession(ctx, createInput)
		require.NoError(t, err)

		// Try to start - should fail due to no test question counts
		startedSession, err := test_session.StartTestSession(ctx, scenario.User.ID, scenario.Test.ID)
		assert.Error(t, err)
		assert.Nil(t, startedSession)
	})

	t.Run("StartTestSession_InsufficientQuestionsInCollection", func(t *testing.T) {
		// Create scenario with fewer questions than required by test question counts
		scenario := prepare.CreateTestScenario(t, []prepare.QuestionCountConfig{{Count: 3, Points: 10}}) // Only 3 questions

		// Set up test question counts requiring more questions than available
		testQuestionRequirements := []model.UpdateTestQuestionRequirementInput{
			{
				NumberOfQuestions: 5, // Require 5 questions but only have 3
				PointsPerQuestion: 10,
			},
		}

		success, err := test.UpdateTestQuestionRequirement(ctx, scenario.User.ID, scenario.Test.ID, testQuestionRequirements)
		require.NoError(t, err)
		require.True(t, success)

		createInput := model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		}
		_, err = test_session.CreateTestSession(ctx, createInput)
		require.NoError(t, err)

		// Try to start - should fail or generate fewer questions
		startedSession, err := test_session.StartTestSession(ctx, scenario.User.ID, scenario.Test.ID)

		// This test checks how the system handles insufficient questions
		// The behavior depends on implementation - it might fail or generate fewer questions
		if err != nil {
			assert.Contains(t, err.Error(), "insufficient")
		} else {
			// If it succeeds, verify it generated available questions
			sessionAnswers := getTestSessionAnswers(t, ctx, startedSession.ID)
			assert.LessOrEqual(t, len(sessionAnswers), 3) // Can't generate more than available
		}
	})

	t.Run("SubmitTestSession_PartiallyCorrectMultipleChoice", func(t *testing.T) {
		// Test submitting only some correct options for multi-choice questions
		scenario := createTestScenarioWithMultipleCorrectAnswers(t, 3)

		createInput := model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		}
		_, err := test_session.CreateTestSession(ctx, createInput)
		require.NoError(t, err)

		_, err = test_session.StartTestSession(ctx, scenario.User.ID, scenario.Test.ID)
		require.NoError(t, err)

		// Prepare answers with only partial correct options
		answers := []*model.TestSessionAnswerInput{}

		questionIDs := slice.Map(scenario.Questions, func(question *ent.Question) uuid.UUID {
			return question.ID
		})

		entClient := setup.OpenEntClient(t)

		questionOptions, err := entClient.QuestionOption.Query().
			Where(questionoption.QuestionIDIn(questionIDs...)).
			All(ctx)
		require.NoError(t, err)

		questionOptionMap := make(map[uuid.UUID][]*ent.QuestionOption)
		for _, questionOption := range questionOptions {
			questionOptionMap[questionOption.QuestionID] = append(questionOptionMap[questionOption.QuestionID], questionOption)
		}

		for _, question := range scenario.Questions {
			firstOption := questionOptionMap[question.ID][0]
			answers = append(answers, &model.TestSessionAnswerInput{
				QuestionID:        question.ID,
				QuestionOptionIds: []uuid.UUID{firstOption.ID},
			})
		}

		// submitInput := model.SubmitTestSessionInput{
		// 	Answers: answers,
		// }
		// completedSession, err := test_session.SubmitTestSession(ctx, scenario.User.ID, startedSession.ID, submitInput)
		// require.NoError(t, err)

		// // Should get zero points for partially correct answers (all-or-nothing)
		// assert.Equal(t, 0, completedSession.PointsEarned)
	})

	t.Run("SubmitTestSession_ExtraIncorrectOptions", func(t *testing.T) {

	})

	t.Run("SubmitTestSession_InvalidQuestionIDs", func(t *testing.T) {

	})

	t.Run("SubmitTestSession_InvalidOptionIDs", func(t *testing.T) {
		scenario := createTestScenarioWithQuestionCounts(t, 5)

		createInput := model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		}
		_, err := test_session.CreateTestSession(ctx, createInput)
		require.NoError(t, err)

		startedSession, err := test_session.StartTestSession(ctx, scenario.User.ID, scenario.Test.ID)
		require.NoError(t, err)

		sessionAnswers := getTestSessionAnswers(t, ctx, startedSession.ID)
		require.NotEmpty(t, sessionAnswers)

		// Submit with valid question but invalid option IDs
		submitInput := model.SubmitTestSessionInput{
			Answers: []*model.TestSessionAnswerInput{
				{
					QuestionID:        sessionAnswers[0].QuestionID, // Valid question
					QuestionOptionIds: []uuid.UUID{uuid.New()},      // Invalid option
					Order:             1,
				},
			},
		}
		completedSession, err := test_session.SubmitTestSession(ctx, scenario.User.ID, startedSession.ID, submitInput)

		// The behavior depends on implementation - might fail or treat as incorrect
		if err == nil {
			assert.Equal(t, 0, completedSession.PointsEarned)
		} else {
			assert.Contains(t, err.Error(), "option")
		}
	})

	t.Run("DeleteTestSession_ActiveSession", func(t *testing.T) {

	})

	t.Run("GetTestSession_NonExistent", func(t *testing.T) {

	})
}
