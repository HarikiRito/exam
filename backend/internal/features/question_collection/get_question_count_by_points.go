package question_collection

import (
	"context"
	"template/internal/ent/db"
	"template/internal/ent/question"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// GetQuestionCountByPoints returns the count of questions grouped by points for given collection IDs
func GetQuestionCountByPoints(ctx context.Context, collectionIDs []uuid.UUID) ([]*model.QuestionPointsCount, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	// Get all questions for the specified collections
	questions, err := client.Question.Query().
		Where(question.CollectionIDIn(collectionIDs...)).
		Select(
			question.FieldPoints,
		).
		All(ctx)
	if err != nil {
		return nil, err
	}

	// Count questions by points in a single loop
	pointsMap := make(map[int]int)

	for _, q := range questions {
		pointsMap[q.Points]++
	}

	// Convert to the expected return format
	var pointsCounts []*model.QuestionPointsCount
	for points, count := range pointsMap {
		pointsCounts = append(pointsCounts, &model.QuestionPointsCount{
			Points: points,
			Count:  count,
		})
	}

	return pointsCounts, nil
}
