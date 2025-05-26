package dataloader

import (
	"context"
	"template/internal/ent"
	"template/internal/features/question_option"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

func getQuestionOptions(ctx context.Context, questionIDs []uuid.UUID) ([][]*model.QuestionOption, []error) {
	lu := NewLoaderByIds[ent.QuestionOption, model.QuestionOption](questionIDs)
	lu.LoadItems(ctx, question_option.GetQuestionOptionsByQuestionIDs, func(item *ent.QuestionOption) string {
		return item.QuestionID.String()
	}, func(item *ent.QuestionOption) (*model.QuestionOption, error) {
		return &model.QuestionOption{
			ID:         item.ID,
			OptionText: item.OptionText,
			IsCorrect:  item.IsCorrect,
			QuestionID: item.QuestionID,
		}, nil
	})

	result := make([][]*model.QuestionOption, len(questionIDs))
	errors := make([]error, len(questionIDs))

	for i, questionID := range questionIDs {
		questionOptions := make([]*model.QuestionOption, 0)
		for _, option := range lu.Items {
			if option.QuestionID == questionID {
				questionOptions = append(questionOptions, option)
			}
		}
		result[i] = questionOptions
		errors[i] = nil
	}

	return result, errors
}

// GetQuestionOptions returns question options for a question ID using the dataloader.
func GetQuestionOptions(ctx context.Context, questionID uuid.UUID) ([]*model.QuestionOption, error) {
	loaders := For(ctx)
	return loaders.QuestionOptionLoader.Load(ctx, questionID)
}
