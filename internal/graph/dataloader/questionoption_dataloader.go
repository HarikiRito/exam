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

func GetCorrectOptionCountByQuestionIds(ctx context.Context, questionIDs []uuid.UUID) ([]int, []error) {
	// Get the correct option counts from the database
	countMap, err := question_option.GetCorrectOptionCountByQuestionIDs(ctx, questionIDs)
	if err != nil {
		// Return errors for all question IDs
		errors := make([]error, len(questionIDs))
		for i := range errors {
			errors[i] = err
		}
		return make([]int, len(questionIDs)), errors
	}

	// Build result slice maintaining the order of input questionIDs
	result := make([]int, len(questionIDs))
	errors := make([]error, len(questionIDs))
	for i, questionID := range questionIDs {
		if count, exists := countMap[questionID]; exists {
			result[i] = count
		} else {
			result[i] = 0 // Default to 0 if no correct options found
		}
		errors[i] = nil
	}

	return result, errors
}

// GetCorrectOptionCount returns the count of correct options for a question ID using the dataloader.
func GetCorrectOptionCount(ctx context.Context, questionID uuid.UUID) (int, error) {
	loaders := For(ctx)
	return loaders.CorrectOptionCountLoader.Load(ctx, questionID)
}
