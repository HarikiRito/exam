package test_session

import (
	"context"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/question"
	"template/internal/ent/testsession"
	"template/internal/ent/testsessionanswer"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"
	"time"

	"github.com/google/uuid"
)

// SubmitTestSession submits a test session with answers and calculates the score
func SubmitTestSession(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID, input model.SubmitTestSessionInput) (*ent.TestSession, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return nil, err
	}

	// Get the session and verify access
	session, err := tx.TestSession.Query().
		Where(testsession.ID(sessionID),
			testsession.UserID(userID),
			testsession.StatusEQ(testsession.StatusInProgress),
			testsession.ExpiredAtGTE(time.Now()),
		).
		Only(ctx)
	if err != nil {
		return nil, db.Rollback(tx, fmt.Errorf("test session not found not submit is not allowed: %w", err))
	}

	totalPoints, err := calculatePoints(ctx, tx, session, input)

	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	// Update session status to completed and set score
	selectFields := TestSessionSelectFields(ctx)
	updatedSession, err := tx.TestSession.UpdateOneID(sessionID).
		SetStatus(testsession.StatusCompleted).
		SetCompletedAt(time.Now()).
		SetPointsEarned(totalPoints).
		Select(testsession.FieldID, selectFields...).
		Save(ctx)
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
		Where(testsessionanswer.SessionID(session.ID), testsessionanswer.PointsIsNil()).Select(testsessionanswer.FieldID, testsessionanswer.FieldQuestionID).
		All(ctx)

	if err != nil {
		return 0, err
	}

	// Total empty answers must match the input sent
	if len(blankAnswers) != len(input.Answers) {
		return 0, fmt.Errorf("test answers doesn't match")
	}

	questionIDs := slice.Map(blankAnswers, func(a *ent.TestSessionAnswer) uuid.UUID { return a.QuestionID })

	questions, err := tx.Question.Query().
		Where(question.IDIn(questionIDs...)).
		Select(question.FieldID, question.FieldPoints).
		WithQuestionOptions().
		All(ctx)

	if err != nil {
		return 0, err
	}

	type Answer struct {
		QuestionID uuid.UUID
		IsCorrect  bool
		Points     int
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

		questionOptions := question.Edges.QuestionOptions
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

		answer := Answer{
			QuestionID: question.ID,
			IsCorrect:  isUserAnswerCorrect,
			Points:     points,
		}

		answers = append(answers, answer)

		totalPoints += answer.Points
	}

	// Batch update the answers record in the table

	for _, answer := range answers {
		updatedCount, err := tx.TestSessionAnswer.Update().
			Where(testsessionanswer.QuestionID(answer.QuestionID),
				testsessionanswer.SessionID(session.ID)).
			SetIsCorrect(answer.IsCorrect).
			SetPoints(answer.Points).
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
