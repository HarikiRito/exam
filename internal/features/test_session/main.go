package test_session

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/testsession"
	"template/internal/ent/userquestionanswer"
	"template/internal/features/common"
	"template/internal/graph/model"
	"time"

	"github.com/google/uuid"
)

// CreateTestSession creates a new test session with the given input.
func CreateTestSession(ctx context.Context, userID uuid.UUID, input model.CreateTestSessionInput) (*ent.TestSession, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	builder := client.TestSession.Create().
		SetUserID(userID).
		SetTestID(input.TestID).
		SetNillableCourseSectionID(input.CourseSectionID)

	session, err := builder.Save(ctx)
	if err != nil {
		return nil, err
	}

	return session, nil
}

// GetTestSessionByID fetches a test session by its ID.
func GetTestSessionByID(ctx context.Context, sessionID uuid.UUID) (*ent.TestSession, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	return client.TestSession.Query().
		Where(testsession.ID(sessionID)).
		Only(ctx)
}

// UpdateTestSession updates a test session by its ID with the provided input.
func UpdateTestSession(ctx context.Context, sessionID uuid.UUID, input model.UpdateTestSessionInput) (*ent.TestSession, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	update := client.TestSession.UpdateOneID(sessionID)

	update.SetNillableTotalScore(input.TotalScore)
	update.SetNillableCompletedAt(input.CompletedAt)

	return update.Save(ctx)
}

// CompleteTestSession marks a test session as completed and calculates the total score.
func CompleteTestSession(ctx context.Context, sessionID uuid.UUID) (*ent.TestSession, error) {
	// Start a transaction
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return nil, err
	}
	defer db.CloseTransaction(tx)

	// Verify the session exists within the transaction
	_, err = tx.TestSession.Get(ctx, sessionID)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	// Get all user answers for this session within the transaction
	answers, err := tx.UserQuestionAnswer.Query().
		Where(
			userquestionanswer.SessionID(sessionID),
		).
		WithQuestion().
		WithSelectedOption().
		All(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	// Calculate the score
	totalScore := 0
	for _, answer := range answers {
		if answer.Edges.SelectedOption.IsCorrect {
			totalScore++
		}
	}

	// Update the session within the transaction
	now := time.Now()
	_, err = tx.TestSession.UpdateOneID(sessionID).
		SetCompletedAt(now).
		SetTotalScore(totalScore).
		Save(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		return nil, err
	}

	// Open a new client to fetch the updated test session
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	return client.TestSession.Query().
		Where(testsession.ID(sessionID)).
		Only(ctx)
}

// DeleteTestSession deletes a test session by its ID.
func DeleteTestSession(ctx context.Context, sessionID uuid.UUID) (bool, error) {
	// Start a transaction
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return false, err
	}
	defer db.CloseTransaction(tx)

	// Delete the test session within the transaction
	err = tx.TestSession.DeleteOneID(sessionID).Exec(ctx)
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		return false, err
	}

	return true, nil
}

// PaginatedTestSessions returns a paginated list of test sessions.
func PaginatedTestSessions(ctx context.Context, input *model.PaginationInput) (*common.PaginatedResult[*ent.TestSession], error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	query := client.TestSession.Query()

	newInput := common.FallbackValue(input, common.DefaultPaginationInput)

	return common.EntQueryPaginated(ctx, query, newInput.Page, newInput.Limit)
}

// GetUserTestSessions returns all test sessions for a specific user.
func GetUserTestSessions(ctx context.Context, userId uuid.UUID) ([]*ent.TestSession, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	return client.TestSession.Query().
		Where(testsession.UserID(userId)).
		All(ctx)
}
