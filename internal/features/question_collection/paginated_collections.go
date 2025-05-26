package question_collection

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/questioncollection"
	"template/internal/features/common"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// PaginatedQuestionCollections returns a paginated list of question collections for the authenticated user.
func PaginatedQuestionCollections(ctx context.Context, userId uuid.UUID, paginationInput *model.PaginationInput) (*common.PaginatedResult[*ent.QuestionCollection], error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	// Build the query with authorization filter
	query := client.QuestionCollection.Query().
		Where(questioncollection.CreatorID(userId))

	// Extract pagination parameters
	page := 1
	limit := 10
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
