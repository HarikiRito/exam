package dataloader

import (
	"context"
	"fmt"
	"template/internal/ent"
	"template/internal/features/question"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

func getQuestionsBySessionIDs(ctx context.Context, sessionIDs []uuid.UUID) ([][]*model.Question, []error) {
	questionMapBySessionID, err := question.GetQuestionsBySessionIDs(ctx, sessionIDs)
	if err != nil {
		return nil, []error{err}
	}

	items := make([][]*model.Question, len(sessionIDs))
	errs := make([]error, len(sessionIDs))
	for i, sessionID := range sessionIDs {
		questions, ok := questionMapBySessionID[sessionID]
		if !ok {
			errs[i] = fmt.Errorf("no questions found for session %s", sessionID)
			continue
		}
		items[i] = slice.Map(questions, func(question *ent.Question) *model.Question {
			return model.ConvertQuestionToModel(question)
		})
	}

	return items, errs
}

// GetQuestionsBySessionID returns questions for a session ID using the dataloader.
func GetQuestionsBySessionID(ctx context.Context, sessionID uuid.UUID) ([]*model.Question, error) {
	loaders := For(ctx)
	return loaders.QuestionsBySessionLoader.Load(ctx, sessionID)
}
