package question_collection

import (
	"context"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/questioncollection"
	"template/internal/features/common"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// PaginatedQuestionCollections returns a paginated list of question collections for the authenticated user.
func PaginatedQuestionCollections(ctx context.Context, userId uuid.UUID, paginationInput *model.PaginationInput) (*common.PaginatedResult[*ent.QuestionCollection], error) {
	// Guard clause: Validate user ID
	if userId == uuid.Nil {
		return nil, fmt.Errorf("invalid user ID: cannot be nil")
	}

	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	// Build the query with authorization filter
	query := client.QuestionCollection.Query().
		Where(questioncollection.CreatorID(userId))

	// Apply search filter if provided
	if paginationInput != nil && paginationInput.Search != nil && *paginationInput.Search != "" {
		query = query.Where(questioncollection.TitleContainsFold(*paginationInput.Search))
	}

	// Use fallback values for pagination
	newInput := common.FallbackValue(paginationInput, common.DefaultPaginationInput)

	return common.EntQueryPaginated(ctx, query, *newInput.Page, *newInput.Limit)
}
