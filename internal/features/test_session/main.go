package test_session

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/testsession"
	"template/internal/ent/userquestionanswer"
	"template/internal/graph/model"
	graphqlFields "template/internal/shared/utilities/graphql"
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

	// Start with the base query
	query := client.TestSession.Query().
		Where(testsession.ID(sessionID))

	preloads := graphqlFields.GetPreloadsAsMap(ctx)

	selectFields := []string{}

	if preloads["id"] {
		selectFields = append(selectFields, testsession.FieldID)
	}

	if preloads["totalScore"] {
		selectFields = append(selectFields, testsession.FieldTotalScore)
	}

	if preloads["completedAt"] {
		selectFields = append(selectFields, testsession.FieldCompletedAt)
	}

	if preloads["createdAt"] {
		selectFields = append(selectFields, testsession.FieldCreatedAt)
	}

	if preloads["updatedAt"] {
		selectFields = append(selectFields, testsession.FieldUpdatedAt)
	}

	return query.Select(selectFields...).Only(ctx)
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

	// Open a new client to fetch the updated test session with requested fields
	return GetTestSessionByID(ctx, sessionID)
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
