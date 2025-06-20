package test_session

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/testsession"
	"template/internal/features/common"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// GetTestSessionByID fetches a test session by its ID.
func GetTestSessionByID(ctx context.Context, sessionID uuid.UUID) (*ent.TestSession, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	// Start with the base query
	query := client.TestSession.Query().
		Where(testsession.ID(sessionID))

	selectFields := TestSessionSelectFields(ctx)

	return query.Select(selectFields...).Only(ctx)
}

// PaginatedTestSessions returns a paginated list of test sessions for the authenticated user.
func PaginatedTestSessions(ctx context.Context, userId uuid.UUID, paginationInput *model.PaginationInput) (*common.PaginatedResult[*ent.TestSession], error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	// Build the query with authorization filter
	query := client.TestSession.Query().
		Where(testsession.UserID(userId))

	// Extract pagination parameters
	page := common.DefaultPage
	limit := common.DefaultLimit
	if paginationInput != nil {
		if paginationInput.Page != nil {
			page = *paginationInput.Page
		}
		if paginationInput.Limit != nil {
			limit = *paginationInput.Limit
		}
	}

	return common.EntQueryPaginated(ctx, query, page, limit)
}

// DeleteTestSession deletes a test session by its ID.
func DeleteTestSession(ctx context.Context, sessionID uuid.UUID) (bool, error) {
	// Start a transaction
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return false, err
	}

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
