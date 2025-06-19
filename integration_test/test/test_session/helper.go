package test_session

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/question"
	"template/internal/ent/testsessionanswer"
	"template/internal/graph/model"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func getTestSessionAnswers(t *testing.T, ctx context.Context, sessionID uuid.UUID) []*ent.TestSessionAnswer {
	client, err := db.OpenClient()
	require.NoError(t, err)

	answers, err := client.TestSessionAnswer.Query().
		Where(testsessionanswer.SessionID(sessionID)).
		All(ctx)
	require.NoError(t, err)

	return answers
}

func prepareCorrectAnswers(t *testing.T, ctx context.Context, sessionID uuid.UUID) []*model.TestSessionAnswerInput {
	sessionAnswers := getTestSessionAnswers(t, ctx, sessionID)

	client, err := db.OpenClient()
	require.NoError(t, err)

	answers := make([]*model.TestSessionAnswerInput, len(sessionAnswers))

	for i, sessionAnswer := range sessionAnswers {
		// Get question with options
		questionWithOptions, err := client.Question.Query().
			Where(question.ID(sessionAnswer.QuestionID)).
			WithQuestionOptions().
			Only(ctx)
		require.NoError(t, err)

		// Find correct options
		var correctOptionIDs []uuid.UUID
		for _, option := range questionWithOptions.Edges.QuestionOptions {
			if option.IsCorrect {
				correctOptionIDs = append(correctOptionIDs, option.ID)
			}
		}

		answers[i] = &model.TestSessionAnswerInput{
			QuestionID:        sessionAnswer.QuestionID,
			QuestionOptionIds: correctOptionIDs,
			Order:             sessionAnswer.Order,
		}
	}

	return answers
}

func prepareIncorrectAnswers(t *testing.T, ctx context.Context, sessionID uuid.UUID) []*model.TestSessionAnswerInput {
	sessionAnswers := getTestSessionAnswers(t, ctx, sessionID)

	client, err := db.OpenClient()
	require.NoError(t, err)

	answers := make([]*model.TestSessionAnswerInput, len(sessionAnswers))

	for i, sessionAnswer := range sessionAnswers {
		// Get question with options
		questionWithOptions, err := client.Question.Query().
			Where(question.ID(sessionAnswer.QuestionID)).
			WithQuestionOptions().
			Only(ctx)
		require.NoError(t, err)

		// Find incorrect options
		var incorrectOptionIDs []uuid.UUID
		for _, option := range questionWithOptions.Edges.QuestionOptions {
			if !option.IsCorrect {
				incorrectOptionIDs = append(incorrectOptionIDs, option.ID)
				break // Just take one incorrect option
			}
		}

		answers[i] = &model.TestSessionAnswerInput{
			QuestionID:        sessionAnswer.QuestionID,
			QuestionOptionIds: incorrectOptionIDs,
			Order:             sessionAnswer.Order,
		}
	}

	return answers
}

func prepareMixedAnswers(t *testing.T, ctx context.Context, sessionID uuid.UUID) []*model.TestSessionAnswerInput {
	sessionAnswers := getTestSessionAnswers(t, ctx, sessionID)

	client, err := db.OpenClient()
	require.NoError(t, err)

	answers := make([]*model.TestSessionAnswerInput, len(sessionAnswers))

	for i, sessionAnswer := range sessionAnswers {
		// Get question with options
		questionWithOptions, err := client.Question.Query().
			Where(question.ID(sessionAnswer.QuestionID)).
			WithQuestionOptions().
			Only(ctx)
		require.NoError(t, err)

		var optionIDs []uuid.UUID

		// Alternate between correct and incorrect answers
		if i%2 == 0 {
			// Even index: correct answer
			for _, option := range questionWithOptions.Edges.QuestionOptions {
				if option.IsCorrect {
					optionIDs = append(optionIDs, option.ID)
				}
			}
		} else {
			// Odd index: incorrect answer
			for _, option := range questionWithOptions.Edges.QuestionOptions {
				if !option.IsCorrect {
					optionIDs = append(optionIDs, option.ID)
					break // Just take one incorrect option
				}
			}
		}

		answers[i] = &model.TestSessionAnswerInput{
			QuestionID:        sessionAnswer.QuestionID,
			QuestionOptionIds: optionIDs,
			Order:             sessionAnswer.Order,
		}
	}

	return answers
}

func prepareMultipleCorrectAnswers(t *testing.T, ctx context.Context, sessionID uuid.UUID) []*model.TestSessionAnswerInput {
	sessionAnswers := getTestSessionAnswers(t, ctx, sessionID)

	client, err := db.OpenClient()
	require.NoError(t, err)

	answers := make([]*model.TestSessionAnswerInput, len(sessionAnswers))

	for i, sessionAnswer := range sessionAnswers {
		// Get question with options
		questionWithOptions, err := client.Question.Query().
			Where(question.ID(sessionAnswer.QuestionID)).
			WithQuestionOptions().
			Only(ctx)
		require.NoError(t, err)

		// Find all correct options
		var correctOptionIDs []uuid.UUID
		for _, option := range questionWithOptions.Edges.QuestionOptions {
			if option.IsCorrect {
				correctOptionIDs = append(correctOptionIDs, option.ID)
			}
		}

		answers[i] = &model.TestSessionAnswerInput{
			QuestionID:        sessionAnswer.QuestionID,
			QuestionOptionIds: correctOptionIDs,
			Order:             sessionAnswer.Order,
		}
	}

	return answers
}

func calculateExpectedPoints(t *testing.T, ctx context.Context, sessionID uuid.UUID) int {
	sessionAnswers := getTestSessionAnswers(t, ctx, sessionID)

	totalPoints := 0
	for _, answer := range sessionAnswers {
		if answer.Points != nil {
			totalPoints += *answer.Points
		}
	}

	return totalPoints
}

func prepareCorrectPlusIncorrectAnswers(t *testing.T, ctx context.Context, sessionID uuid.UUID) []*model.TestSessionAnswerInput {
	sessionAnswers := getTestSessionAnswers(t, ctx, sessionID)

	client, err := db.OpenClient()
	require.NoError(t, err)

	answers := make([]*model.TestSessionAnswerInput, len(sessionAnswers))

	for i, sessionAnswer := range sessionAnswers {
		// Get question with options
		questionWithOptions, err := client.Question.Query().
			Where(question.ID(sessionAnswer.QuestionID)).
			WithQuestionOptions().
			Only(ctx)
		require.NoError(t, err)

		// Find all correct options AND add incorrect options
		var optionIDs []uuid.UUID

		// Add all correct options
		for _, option := range questionWithOptions.Edges.QuestionOptions {
			if option.IsCorrect {
				optionIDs = append(optionIDs, option.ID)
			}
		}

		// Add one incorrect option to make the answer wrong
		for _, option := range questionWithOptions.Edges.QuestionOptions {
			if !option.IsCorrect {
				optionIDs = append(optionIDs, option.ID)
				break // Just add one incorrect option
			}
		}

		answers[i] = &model.TestSessionAnswerInput{
			QuestionID:        sessionAnswer.QuestionID,
			QuestionOptionIds: optionIDs,
			Order:             sessionAnswer.Order,
		}
	}

	return answers
}
