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
func PaginatedTestSessions(ctx context.Context, userId uuid.UUID, isAdminOrOwner bool, paginationInput *model.PaginationInput, filterInput *model.TestSessionFilterInput) (*common.PaginatedResult[*ent.TestSession], error) {
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

	// Apply status filter if provided
	if filterInput != nil && len(filterInput.Statuses) > 0 {
		query = query.Where(testsession.StatusIn(convertStatusesToEntStatuses(filterInput.Statuses)...))
	}

	// Sort by updatedAt descending (most recently updated first)
	query = query.Order(ent.Desc(testsession.FieldUpdatedAt))

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

func convertStatusesToEntStatuses(statuses []model.TestSessionStatus) []testsession.Status {
	result := make([]testsession.Status, len(statuses))
	for i, s := range statuses {
		// Convert GraphQL enum (uppercase) to Ent enum (lowercase with underscores)
		switch s {
		case model.TestSessionStatusPending:
			result[i] = testsession.StatusPending
		case model.TestSessionStatusCompleted:
			result[i] = testsession.StatusCompleted
		case model.TestSessionStatusInProgress:
			result[i] = testsession.StatusInProgress
		case model.TestSessionStatusCancelled:
			result[i] = testsession.StatusCancelled
		case model.TestSessionStatusExpired:
			result[i] = testsession.StatusExpired
		default:
			result[i] = testsession.StatusPending
		}
	}
	return result
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
