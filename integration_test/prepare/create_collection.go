package prepare

import (
	"context"
	"template/integration_test/utils"
	"template/internal/ent"
	"template/internal/features/question"
	"template/internal/features/question_collection"
	"template/internal/graph/model"
	"testing"

	"github.com/google/uuid"
)

func CreateCollectionWithQuestions(t *testing.T, userID uuid.UUID, questionCount int) (*ent.QuestionCollection, []*ent.Question) {
	collectionInput := model.CreateQuestionCollectionInput{
		Title:       utils.Faker.Lorem().Word(),
		Description: utils.Ptr(utils.Faker.Lorem().Sentence(10)),
	}
	collectionEntity := CreateQuestionCollection(t, userID, collectionInput)

	questionInputs := make([]*model.UpdateQuestionData, questionCount)

	for i := 0; i < questionCount; i++ {
		// Random options with at least one correct option
		correctCount := utils.Faker.IntBetween(1, 3)
		currentCorrectCount := 0
		options := make([]*model.UpdateQuestionOptionInput, 0)
		for {
			isCorrect := utils.Faker.BoolWithChance(40)
			option := &model.UpdateQuestionOptionInput{
				OptionText: utils.Ptr(utils.Faker.Lorem().Word()),
				IsCorrect:  utils.Ptr(isCorrect),
			}
			options = append(options, option)
			if isCorrect {
				currentCorrectCount++
			}
			if currentCorrectCount >= correctCount {
				break
			}
		}
		questionInputs[i] = &model.UpdateQuestionData{
			QuestionText: utils.Ptr(utils.Faker.Lorem().Sentence(10)),
			Options:      options,
		}
	}

	question_collection.UpdateBatchQuestionsByCollection(context.Background(), collectionEntity.ID, model.UpdateBatchQuestionsByCollectionInput{
		CollectionID: collectionEntity.ID,
		Questions:    questionInputs,
	})

	questions, err := question.GetQuestionsByCollectionIDs(context.Background(), []uuid.UUID{collectionEntity.ID})
	if err != nil {
		t.Fatalf("Failed to get questions by collection IDs: %v", err)
	}

	return collectionEntity, questions
}

// CreateQuestionCollection creates a test question collection with the given input and user ID
func CreateQuestionCollection(t *testing.T, userID uuid.UUID, input model.CreateQuestionCollectionInput) *ent.QuestionCollection {
	collectionEntity, err := question_collection.CreateQuestionCollection(context.Background(), userID, input)
	if err != nil {
		t.Fatalf("Failed to create question collection: %v", err)
	}
	return collectionEntity
}
