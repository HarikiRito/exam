package test_session

import (
	"context"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/questionoption"
	"template/internal/ent/testsession"
	"template/internal/graph/model"
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
		Where(testsession.ID(sessionID)).
		WithUser().
		WithTest(func(tq *ent.TestQuery) {
			tq.WithCourse().
				WithCourseSection(func(csq *ent.CourseSectionQuery) {
					csq.WithCourse()
				})
		}).
		Only(ctx)
	if err != nil {
		return nil, db.Rollback(tx, fmt.Errorf("test session not found: %w", err))
	}

	// Verify user has access to this session
	if session.Edges.User != nil && session.Edges.User.ID != userID {
		return nil, db.Rollback(tx, fmt.Errorf("unauthorized: user does not have access to this test session"))
	}

	// Also verify user has access to the underlying test
	if session.Edges.Test != nil {
		var hasAccess bool
		if session.Edges.Test.Edges.Course != nil {
			hasAccess = session.Edges.Test.Edges.Course.CreatorID == userID
		} else if session.Edges.Test.Edges.CourseSection != nil && session.Edges.Test.Edges.CourseSection.Edges.Course != nil {
			hasAccess = session.Edges.Test.Edges.CourseSection.Edges.Course.CreatorID == userID
		}

		if !hasAccess {
			return nil, db.Rollback(tx, fmt.Errorf("unauthorized: user does not have access to the test"))
		}
	}

	// Check if session is in the correct status (IN_PROGRESS)
	if session.Status != testsession.StatusInProgress {
		return nil, db.Rollback(tx, fmt.Errorf("cannot submit: test session status is %s, expected %s", session.Status, testsession.StatusInProgress))
	}

	// Check if session has expired
	now := time.Now()
	if session.ExpiredAt != nil && now.After(*session.ExpiredAt) {
		// Update session status to expired
		_, err = tx.TestSession.UpdateOneID(sessionID).
			SetStatus(testsession.StatusExpired).
			Save(ctx)
		if err != nil {
			return nil, db.Rollback(tx, err)
		}
		return nil, db.Rollback(tx, fmt.Errorf("cannot submit: test session has expired"))
	}

	// Process answers and calculate score
	totalPoints := 0
	for _, answer := range input.Answers {
		// Validate that at least one option is selected
		if len(answer.QuestionOptionIds) == 0 {
			continue // Skip questions with no selected options
		}

		// For now, handle single option selection (can be extended for multiple choice)
		selectedOptionID := answer.QuestionOptionIds[0]

		// Get the question option to check if it's correct
		option, err := tx.QuestionOption.Query().
			Where(questionoption.ID(selectedOptionID)).
			Only(ctx)
		if err != nil {
			return nil, db.Rollback(tx, fmt.Errorf("question option not found: %w", err))
		}

		// Calculate points based on correctness
		var earnedPoints int
		isCorrect := option.IsCorrect
		if isCorrect && answer.Points != nil {
			earnedPoints = *answer.Points
		} else if isCorrect {
			// Default point value if not specified
			earnedPoints = 1
		}

		totalPoints += earnedPoints

		// Create or update test session answer
		_, err = tx.TestSessionAnswer.Create().
			SetQuestionID(answer.QuestionID).
			SetSelectedOptionID(selectedOptionID).
			SetSessionID(sessionID).
			SetNillableSelectedOptionText(&option.OptionText).
			SetNillablePoints(&earnedPoints).
			SetOrder(answer.Order).
			SetNillableIsCorrect(&isCorrect).
			Save(ctx)
		if err != nil {
			return nil, db.Rollback(tx, fmt.Errorf("failed to save answer: %w", err))
		}
	}

	// Update session status to completed and set score
	selectFields := TestSessionSelectFields(ctx)
	updatedSession, err := tx.TestSession.UpdateOneID(sessionID).
		SetStatus(testsession.StatusCompleted).
		SetCompletedAt(now).
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

// ValidateTestSessionForSubmission checks if a test session can be submitted
func ValidateTestSessionForSubmission(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID) error {
	client, err := db.OpenClient()
	if err != nil {
		return err
	}

	session, err := client.TestSession.Query().
		Where(testsession.ID(sessionID)).
		WithUser().
		Only(ctx)
	if err != nil {
		return fmt.Errorf("test session not found: %w", err)
	}

	// Verify user has access to this session
	if session.Edges.User != nil && session.Edges.User.ID != userID {
		return fmt.Errorf("unauthorized: user does not have access to this test session")
	}

	// Check if session is in the correct status
	if session.Status != testsession.StatusInProgress {
		return fmt.Errorf("cannot submit: test session status is %s, expected %s", session.Status, testsession.StatusInProgress)
	}

	// Check if session has expired
	now := time.Now()
	if session.ExpiredAt != nil && now.After(*session.ExpiredAt) {
		return fmt.Errorf("cannot submit: test session has expired")
	}

	return nil
}
