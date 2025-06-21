package test_session

import (
	"context"
	"template/integration_test/prepare"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/testsession"
	"template/internal/ent/testsessionanswer"
	"template/internal/features/test"
	"template/internal/features/test_session"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"
	"testing"
	"time"

	"github.com/go-playground/assert/v2"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestSessionFlow(t *testing.T) {
	prepare.SetupTestDb(t)
	_, err := db.OpenClient()
	if err != nil {
		t.Fatalf("failed to open db client: %v", err)
	}

	type newSession struct {
		Session *ent.TestSession
		Answers []*ent.TestSessionAnswer
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

	setupNewSession := func() newSession {
		session, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
			TestID: scenario.Test.ID,
			UserID: &scenario.User.ID,
		})
		require.NoError(t, err)

		newSessionEntity, err := test_session.StartTestSession(context.Background(), scenario.User.ID, session.ID)

		require.NoError(t, err)
		require.NotNil(t, newSessionEntity)

		answers, err := getAnswers(context.Background(), newSessionEntity.ID)
		require.NoError(t, err)

		return newSession{
			Session: newSessionEntity,
			Answers: answers,
		}
	}

	// Create the test session
	session, err := test_session.CreateTestSession(context.Background(), model.CreateTestSessionInput{
		TestID: scenario.Test.ID,
		UserID: &scenario.User.ID,
	})

	require.NoError(t, err)
	require.NotNil(t, session)

	t.Run("test_session_in_pending_state", func(t *testing.T) {
		require.Equal(t, session.Status, testsession.StatusPending)
	})

	t.Run("test_session_dont_have_any_question_yet", func(t *testing.T) {
		answers, err := getAnswers(context.Background(), session.ID)
		require.NoError(t, err)
		require.Empty(t, answers)
	})

	t.Run("cannot_start_test_session_due_to_insufficient_questions", func(t *testing.T) {
		questionCollection, err := scenario.Test.QueryQuestionCollections().WithQuestions().All(context.Background())

		if err != nil {
			t.Fatalf("failed to get question collection: %v", err)
		}

		questions := slice.FlatMap(questionCollection, func(collection *ent.QuestionCollection) []*ent.Question {
			return collection.Edges.Questions
		})

		questionIds := slice.Map(questions, func(question *ent.Question) uuid.UUID {
			return question.ID
		})

		test.BatchIgnoreQuestions(context.Background(), scenario.User.ID, model.BatchIgnoreQuestionsInput{
			TestID: scenario.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{
				{QuestionID: questionIds[0]},
			},
		})

		_, err = test_session.StartTestSession(context.Background(), scenario.User.ID, session.ID)
		require.Error(t, err)

		_, err = test.BatchIgnoreQuestions(context.Background(), scenario.User.ID, model.BatchIgnoreQuestionsInput{
			TestID:             scenario.Test.ID,
			QuestionIgnoreData: []*model.QuestionIgnoreData{},
		})
		require.NoError(t, err)
	})

	// Start the test session
	session, err = test_session.StartTestSession(context.Background(), scenario.User.ID, session.ID)
	require.NoError(t, err)
	require.NotNil(t, session)

	t.Run("test_session_is_in_progress_state", func(t *testing.T) {
		require.Equal(t, session.Status, testsession.StatusInProgress)
	})

	t.Run("test_session_has_exact_number_of_questions", func(t *testing.T) {
		answers, err := getAnswers(context.Background(), session.ID)
		require.NoError(t, err)
		require.Equal(t, len(answers), totalQuestionCount)

		t.Run("all_answers_points_must_be_nil", func(t *testing.T) {
			require.True(t, slice.Every(answers, func(answer *ent.TestSessionAnswer) bool {
				return answer.Points == nil
			}))
		})
	})

	t.Run("submit_the_test_session", func(t *testing.T) {
		t.Run("submit_but_not_with_all_answers", func(t *testing.T) {
			answers, err := getAnswers(context.Background(), session.ID)
			require.NoError(t, err)

			t.Run("empty_answers", func(t *testing.T) {
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

			t.Run("not_all_answers_are_submitted", func(t *testing.T) {
				if len(answerInputs) > 1 {
					answerInputs = answerInputs[1:]
				}

				_, err = test_session.SubmitTestSession(context.Background(), scenario.User.ID, session.ID, model.SubmitTestSessionInput{
					Answers: answerInputs,
				})
				require.Error(t, err)
			})
		})

		t.Run("submit_with_all_answers_randomly", func(t *testing.T) {
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

		t.Run("submit_with_all_answers_correctly", func(t *testing.T) {
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
