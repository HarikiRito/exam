package dataloader

import (
	"context"
	"template/internal/ent"
	"template/internal/features/question"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

func getQuestionsByCollectionID(ctx context.Context, collectionIDs []uuid.UUID) ([][]*model.Question, []error) {
	lu := NewLoaderByIds[ent.Question, model.Question](collectionIDs)
	lu.LoadItems(ctx, question.GetQuestionsByCollectionIDs, func(item *ent.Question) string {
		return item.CollectionID.String()
	}, func(item *ent.Question) (*model.Question, error) {
		return model.ConvertQuestionToModel(item), nil
	})

	result := make([][]*model.Question, len(collectionIDs))
	errors := make([]error, len(collectionIDs))

	for i, collectionID := range collectionIDs {
		questions := make([]*model.Question, 0)
		for _, question := range lu.Items {
			if question != nil && question.CollectionID == collectionID {
				questions = append(questions, question)
			}
		}
		result[i] = questions
		errors[i] = nil
	}

	return result, errors
}

// GetQuestionsByCollectionID returns questions for a collection ID using the dataloader.
func GetQuestionsByCollectionID(ctx context.Context, collectionID uuid.UUID) ([]*model.Question, error) {
	loaders := For(ctx)
	return loaders.QuestionsByCollectionLoader.Load(ctx, collectionID)
}
