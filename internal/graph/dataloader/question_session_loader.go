package dataloader

import (
	"context"
	"template/internal/ent"
	"template/internal/features/question"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

func getQuestionsBySessionIDs(ctx context.Context, sessionIDs []uuid.UUID) ([][]*model.Question, []error) {
	lu := NewLoaderByIds[ent.Question, model.Question](sessionIDs)

	items, errs := lu.LoadItemsOneToMany(ctx, question.GetQuestionsBySessionIDs, func(sessionID uuid.UUID, items []*ent.Question) []*ent.Question {
		// Filter questions that belong to the specific session
		return slice.Filter(items, func(item *ent.Question) bool {
			// Check if this question has an answer for the given session
			if item.Edges.UserQuestionAnswers != nil {
				for _, edge := range item.Edges.UserQuestionAnswers {
					if edge.SessionID == sessionID {
						return true
					}
				}
			}
			return false
		})
	}, func(items []*ent.Question) ([]*model.Question, error) {
		result := slice.Map(items, func(question *ent.Question) *model.Question {
			return model.ConvertQuestionToModel(question)
		})
		return result, nil
	})

	return items, errs
}

// GetQuestionsBySessionID returns questions for a session ID using the dataloader.
func GetQuestionsBySessionID(ctx context.Context, sessionID uuid.UUID) ([]*model.Question, error) {
	loaders := For(ctx)
	return loaders.QuestionsBySessionLoader.Load(ctx, sessionID)
}
