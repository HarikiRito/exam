package course_section

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/features/common"

	"github.com/google/uuid"
)

// PaginatedCourseSections returns a paginated list of course sections for a course, only if the user is the course creator.
func PaginatedCourseSections(ctx context.Context, userId uuid.UUID, page, limit int) (*common.PaginatedResult[*ent.CourseSection], error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	query := client.CourseSection.Query()
	return common.EntQueryPaginated(ctx, query, page, limit)
}
