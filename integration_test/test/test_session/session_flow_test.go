package test_session

import (
	"context"
	"template/integration_test/prepare"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/testsession"
	"template/internal/ent/testsessionanswer"
	"template/internal/features/test_session"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSessionFlow(t *testing.T) {
	prepare.SetupTestDb(t)
	_, err := db.OpenClient()
	if err != nil {
		t.Fatalf("failed to open db client: %v", err)
	}

	maxQuestionCount := 10

	questionCountConfigs := []prepare.QuestionCountConfig{
		{Count: maxQuestionCount, Points: 25},
		{Count: maxQuestionCount, Points: 20},
		{Count: maxQuestionCount, Points: 15},
	}

	totalQuestionCount := slice.Reduce(questionCountConfigs, func(acc int, config prepare.QuestionCountConfig) int {
		return acc + config.Count
	}, 0)

	scenario := prepare.CreateTestScenario(t, questionCountConfigs)

	// Create the test session
	session, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
		TestID: scenario.Test.ID,
		UserID: &scenario.User.ID,
	})

	require.NoError(t, err)
	require.NotNil(t, session)

	t.Run("Test session in pending state", func(t *testing.T) {
		require.Equal(t, session.Status, testsession.StatusPending)
	})

	t.Run("Test session don't have any question yet", func(t *testing.T) {
		answers, err := getAnswers(context.Background(), session.ID)
		require.NoError(t, err)
		require.Empty(t, answers)
	})

	// Start the test session
	session, err = test_session.StartTestSession(context.Background(), scenario.User.ID, scenario.Test.ID)
	require.NoError(t, err)
	require.NotNil(t, session)

	t.Run("Test session is in progress state", func(t *testing.T) {
		require.Equal(t, session.Status, testsession.StatusInProgress)
	})

	t.Run("Test session has exact number of questions", func(t *testing.T) {
		answers, err := getAnswers(context.Background(), session.ID)
		require.NoError(t, err)
		require.Equal(t, len(answers), totalQuestionCount)

		t.Run("All answers points must be nil", func(t *testing.T) {
			require.True(t, slice.Every(answers, func(answer *ent.TestSessionAnswer) bool {
				return answer.Points == nil
			}))
		})
	})

	t.Run("Submit the test session", func(t *testing.T) {
		t.Run("Submit but not with all answers", func(t *testing.T) {
			answers, err := getAnswers(context.Background(), session.ID)
			require.NoError(t, err)

			t.Run("Empty answers", func(t *testing.T) {
				_, err = test_session.SubmitTestSession(context.Background(), scenario.User.ID, session.ID, model.SubmitTestSessionInput{
					Answers: []*model.TestSessionAnswerInput{},
				})
				require.Error(t, err)

			})

			answerInputs := slice.Map(answers, func(answer *ent.TestSessionAnswer) *model.TestSessionAnswerInput {
				optionIds := slice.Map(answer.Edges.Question.Edges.QuestionOptions, func(option *ent.QuestionOption) uuid.UUID {
					return option.ID
				})
				return &model.TestSessionAnswerInput{
					QuestionID:        answer.QuestionID,
					QuestionOptionIds: optionIds,
				}
			})

			require.True(t, len(answerInputs) > 1)

			// Remove the first answer if length of answerInputs is greater than 1 to simulate the case that user didn't answer all questions

			t.Run("Not all answers are submitted", func(t *testing.T) {
				if len(answerInputs) > 1 {
					answerInputs = answerInputs[1:]
				}

				_, err = test_session.SubmitTestSession(context.Background(), scenario.User.ID, session.ID, model.SubmitTestSessionInput{
					Answers: answerInputs,
				})
				require.Error(t, err)
			})
		})

		type newSession struct {
			Session *ent.TestSession
			Answers []*ent.TestSessionAnswer
		}

		setupNewSession := func() newSession {
			_, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
				TestID: scenario.Test.ID,
				UserID: &scenario.User.ID,
			})
			require.NoError(t, err)

			newSessionEntity, err := test_session.StartTestSession(context.Background(), scenario.User.ID, scenario.Test.ID)

			require.NoError(t, err)
			require.NotNil(t, newSessionEntity)

			answers, err := getAnswers(context.Background(), newSessionEntity.ID)
			require.NoError(t, err)

			return newSession{
				Session: newSessionEntity,
				Answers: answers,
			}
		}

		t.Run("Submit with all answers randomly", func(t *testing.T) {
			newSession := setupNewSession()
			answerInputs := slice.Map(newSession.Answers, func(answer *ent.TestSessionAnswer) *model.TestSessionAnswerInput {
				optionIds := slice.Map(answer.Edges.Question.Edges.QuestionOptions, func(option *ent.QuestionOption) uuid.UUID {
					return option.ID
				})
				return &model.TestSessionAnswerInput{
					QuestionID:        answer.QuestionID,
					QuestionOptionIds: optionIds,
				}
			})

			timeoutCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
			defer cancel()

			_, err = test_session.SubmitTestSession(timeoutCtx, scenario.User.ID, newSession.Session.ID, model.SubmitTestSessionInput{
				Answers: answerInputs,
			})
			require.NoError(t, err)
		})

		t.Run("Submit with all answers correctly", func(t *testing.T) {
			newSession := setupNewSession()
			answerInputs := slice.Map(newSession.Answers, func(answer *ent.TestSessionAnswer) *model.TestSessionAnswerInput {
				optionIds := slice.Map(
					slice.Filter(answer.Edges.Question.Edges.QuestionOptions, func(option *ent.QuestionOption) bool {
						return option.IsCorrect
					}), func(option *ent.QuestionOption) uuid.UUID {
						return option.ID
					})

				return &model.TestSessionAnswerInput{
					QuestionID:        answer.QuestionID,
					QuestionOptionIds: optionIds,
				}
			})

			updatedSession, err := test_session.SubmitTestSession(context.Background(), scenario.User.ID, newSession.Session.ID, model.SubmitTestSessionInput{
				Answers: answerInputs,
			})
			require.NoError(t, err)
			maxPoints := slice.Reduce(questionCountConfigs, func(acc int, config prepare.QuestionCountConfig) int {
				return acc + config.Count*config.Points
			}, 0)
			assert.Equal(t, updatedSession.PointsEarned, maxPoints)
		})
	})
}

func getAnswers(ctx context.Context, sessionID uuid.UUID) ([]*ent.TestSessionAnswer, error) {
	dbClient, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	answers, err := dbClient.TestSessionAnswer.Query().WithQuestion(
		func(q *ent.QuestionQuery) {
			q.WithQuestionOptions()
		},
	).Where(testsessionanswer.SessionID(sessionID)).All(ctx)
	if err != nil {
		return nil, err
	}

	return answers, nil
}
