package test_session

import (
	"context"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	entQuestion "template/internal/ent/question"
	entQuestionOption "template/internal/ent/questionoption"
	entTestSession "template/internal/ent/testsession"
	entTestSessionAnswer "template/internal/ent/testsessionanswer"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"
	"time"

	"github.com/google/uuid"
)

// AnswerMetadata represents the structured metadata stored in test_session_answers
type AnswerMetadata struct {
	SelectedOptions []string `json:"selected_options"`
}

// SubmitTestSession submits a test session with answers and calculates the score
func SubmitTestSession(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID, input model.SubmitTestSessionInput) (*ent.TestSession, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return nil, err
	}

	// Get the session and verify access
	session, err := tx.TestSession.Query().
		Where(entTestSession.ID(sessionID),
			entTestSession.UserID(userID),
			entTestSession.StatusEQ(entTestSession.StatusInProgress),
		).
		Only(ctx)
	if err != nil {
		return nil, db.Rollback(tx, fmt.Errorf("test session not found or submit is not allowed: %w", err))
	}

	totalPoints, err := calculatePoints(ctx, tx, session, input)

	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	// Update session status to completed and set score
	selectFields := TestSessionSelectFields(ctx)

	updateSessionQuery := tx.TestSession.UpdateOneID(sessionID).
		SetStatus(entTestSession.StatusCompleted).
		SetCompletedAt(time.Now()).
		SetPointsEarned(totalPoints)

	if len(selectFields) > 0 {
		updateSessionQuery = updateSessionQuery.Select(entTestSession.FieldID, selectFields...)
	}

	updatedSession, err := updateSessionQuery.Save(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return updatedSession, nil
}

func calculatePoints(ctx context.Context, tx *ent.Tx, session *ent.TestSession, input model.SubmitTestSessionInput) (int, error) {
	totalPoints := 0

	blankAnswers, err := tx.TestSessionAnswer.Query().
		Where(entTestSessionAnswer.SessionID(session.ID), entTestSessionAnswer.PointsIsNil()).Select(entTestSessionAnswer.FieldID, entTestSessionAnswer.FieldQuestionID).
		All(ctx)

	if err != nil {
		return 0, err
	}

	// Total empty answers must match the input sent
	if len(blankAnswers) != len(input.Answers) {
		return 0, fmt.Errorf("test answers doesn't match. needed %d answers, got %d", len(blankAnswers), len(input.Answers))
	}

	questionIDs := slice.Map(blankAnswers, func(a *ent.TestSessionAnswer) uuid.UUID { return a.QuestionID })

	questions, err := tx.Question.Query().
		Where(entQuestion.IDIn(questionIDs...)).
		Select(entQuestion.FieldID, entQuestion.FieldPoints).
		All(ctx)

	if err != nil {
		return 0, err
	}

	// Fetch question options separately
	questionOptions, err := tx.QuestionOption.Query().
		Where(entQuestionOption.QuestionIDIn(questionIDs...)).
		All(ctx)

	if err != nil {
		return 0, err
	}

	// Group options by question ID
	optionsByQuestion := make(map[uuid.UUID][]*ent.QuestionOption)
	for _, opt := range questionOptions {
		optionsByQuestion[opt.QuestionID] = append(optionsByQuestion[opt.QuestionID], opt)
	}

	type Answer struct {
		QuestionID      uuid.UUID
		IsCorrect       bool
		Points          int
		SelectedOptions []string
	}

	answers := make([]Answer, 0, len(input.Answers))

	questionMap := slice.ToMap(questions, func(q *ent.Question) (uuid.UUID, *ent.Question) {
		return q.ID, q
	})

	for _, answerOfUser := range input.Answers {
		question := questionMap[answerOfUser.QuestionID]
		if question == nil {
			return 0, fmt.Errorf("answer of user doesn't match the question")
		}

		questionOptions := optionsByQuestion[question.ID]
		userAnswerOptionIds := answerOfUser.QuestionOptionIds
		correctOptions := slice.Filter(questionOptions, func(qo *ent.QuestionOption) bool {
			return qo.IsCorrect
		})

		// Map the correct options to a map for faster lookup with the user answer options
		correntOptionMap := slice.ToMap(correctOptions, func(qo *ent.QuestionOption) (uuid.UUID, *ent.QuestionOption) {
			return qo.ID, qo
		})

		// Only mark the answer as correct if the user selected all the options match the question options
		isUserAnswerCorrect := len(userAnswerOptionIds) == len(correctOptions) && slice.Every(userAnswerOptionIds, func(optionId uuid.UUID) bool {
			return correntOptionMap[optionId] != nil
		})

		points := 0
		if isUserAnswerCorrect {
			points = question.Points
		}

		// Build metadata with selected option texts
		selectedOptions := make([]string, 0, len(userAnswerOptionIds))
		for _, optionID := range userAnswerOptionIds {
			for _, option := range questionOptions {
				if option.ID == optionID {
					selectedOptions = append(selectedOptions, option.OptionText)
					break
				}
			}
		}

		answer := Answer{
			QuestionID:      question.ID,
			IsCorrect:       isUserAnswerCorrect,
			Points:          points,
			SelectedOptions: selectedOptions,
		}

		answers = append(answers, answer)

		totalPoints += answer.Points
	}

	// Batch update the answers record in the table

	for _, answer := range answers {
		metadata := map[string]interface{}{
			"selected_options": answer.SelectedOptions,
		}

		updatedCount, err := tx.TestSessionAnswer.Update().
			Where(entTestSessionAnswer.QuestionID(answer.QuestionID),
				entTestSessionAnswer.SessionID(session.ID)).
			SetIsCorrect(answer.IsCorrect).
			SetPoints(answer.Points).
			SetMetadata(metadata).
			Save(ctx)

		if err != nil {
			return 0, err
		}

		if updatedCount != 1 {
			return 0, fmt.Errorf("something went wrong while updating the answer. the number of updated records should be 1")
		}
	}

	return totalPoints, nil
}
