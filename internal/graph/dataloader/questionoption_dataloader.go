package dataloader

import (
	"context"
	"template/internal/ent"
	"template/internal/features/question_option"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

func getQuestionOptionsByQuestionIDs(ctx context.Context, questionIDs []uuid.UUID) ([][]*model.QuestionOption, []error) {
	lu := NewLoaderByIds[ent.QuestionOption, model.QuestionOption](questionIDs)

	items, errs := lu.LoadItemsOneToMany(ctx, question_option.GetQuestionOptionsByQuestionIDs, func(id uuid.UUID, items []*ent.QuestionOption) []*ent.QuestionOption {
		return slice.Filter(items, func(item *ent.QuestionOption) bool {
			return item.QuestionID == id
		})
	}, func(items []*ent.QuestionOption) ([]*model.QuestionOption, error) {
		result := slice.Map(items, func(option *ent.QuestionOption) *model.QuestionOption {
			return &model.QuestionOption{
				ID:         option.ID,
				OptionText: option.OptionText,
				IsCorrect:  option.IsCorrect,
				QuestionID: option.QuestionID,
			}
		})
		return result, nil
	})

	return items, errs
}

// GetQuestionOptions returns question options for a question ID using the dataloader.
func GetQuestionOptions(ctx context.Context, questionID uuid.UUID) ([]*model.QuestionOption, error) {
	loaders := For(ctx)
	return loaders.QuestionOptionLoader.Load(ctx, questionID)
}
