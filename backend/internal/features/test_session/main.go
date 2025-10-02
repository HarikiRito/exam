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

// PaginatedTestSessions returns a paginated list of test sessions.
// For admin/owner: shows all sessions
// For regular users: shows only their own sessions
func PaginatedTestSessions(ctx context.Context, userId uuid.UUID, isAdminOrOwner bool, paginationInput *model.PaginationInput) (*common.PaginatedResult[*ent.TestSession], error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	// Build the query with conditional user filter
	query := client.TestSession.Query()

	// Only filter by userId if not admin/owner
	if !isAdminOrOwner {
		query = query.Where(testsession.UserID(userId))
	}

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
