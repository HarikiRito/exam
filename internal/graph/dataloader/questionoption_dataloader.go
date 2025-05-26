package dataloader

import (
	"context"
	"template/internal/ent"
	"template/internal/features/question_option"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

func getQuestionOptions(ctx context.Context, questionIDs []uuid.UUID) ([][]*model.QuestionOption, []error) {
	lu := NewLoaderByIds[ent.QuestionOption, model.QuestionOption](questionIDs)
	items, errs := lu.GenerateItemsList(ctx, question_option.GetQuestionOptionsByQuestionIDs, func(item *ent.QuestionOption) string {
		return item.QuestionID.String()
	}, func(item []*ent.QuestionOption) ([]*model.QuestionOption, error) {
		result := slice.Map(item, func(option *ent.QuestionOption) *model.QuestionOption {
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
