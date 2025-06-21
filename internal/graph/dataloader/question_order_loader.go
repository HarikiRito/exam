package dataloader

import (
	"context"
	"template/internal/ent"
	"template/internal/features/test_session"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

func getOrderedQuestionsBySessionIDs(ctx context.Context, sessionIDs []uuid.UUID) ([][]*model.QuestionOrder, []error) {
	lu := NewLoaderByIds[ent.TestSessionAnswer, model.QuestionOrder](sessionIDs)

	items, errs := lu.LoadItemsOneToMany(ctx, test_session.GetOrderedQuestionsBySessionIDs, func(sessionID uuid.UUID, items []*ent.TestSessionAnswer) []*ent.TestSessionAnswer {
		// Filter answers that belong to the specific session
		return slice.Filter(items, func(item *ent.TestSessionAnswer) bool {
			return item.SessionID == sessionID
		})
	}, func(items []*ent.TestSessionAnswer) ([]*model.QuestionOrder, error) {
		result := slice.Map(items, func(answer *ent.TestSessionAnswer) *model.QuestionOrder {
			return &model.QuestionOrder{
				QuestionID: answer.QuestionID,
				Order:      answer.Order,
			}
		})
		return result, nil
	})

	return items, errs
}

// GetOrderedQuestionsBySessionID returns ordered questions for a session ID using the dataloader.
func GetOrderedQuestionsBySessionID(ctx context.Context, sessionID uuid.UUID) ([]*model.QuestionOrder, error) {
	loaders := For(ctx)
	return loaders.OrderedQuestionsBySessionLoader.Load(ctx, sessionID)
}
