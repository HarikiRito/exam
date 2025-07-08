package question_collection

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/question"
	"template/internal/ent/questioncollection"
	"template/internal/ent/test"

	"github.com/google/uuid"
)

// GetQuestionCollectionByQuestionIDs fetches question collections for multiple question IDs.
func GetQuestionCollectionByQuestionIDs(ctx context.Context, questionIDs []uuid.UUID) ([]*ent.QuestionCollection, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	collections, err := client.QuestionCollection.Query().
		Where(questioncollection.HasQuestionsWith(question.IDIn(questionIDs...))).
		WithQuestions(func(q *ent.QuestionQuery) {
			q.Where(question.IDIn(questionIDs...)).Select(question.FieldID)
		}).
		All(ctx)
	if err != nil {
		return nil, err
	}

	return collections, nil
}

// GetQuestionCollectionsByTestIDs fetches question collections for multiple test IDs.
func GetQuestionCollectionsByTestIDs(ctx context.Context, testIDs []uuid.UUID) ([]*ent.QuestionCollection, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	collections, err := client.QuestionCollection.Query().
		Where(questioncollection.HasTestWith(test.IDIn(testIDs...))).
		WithTest(func(q *ent.TestQuery) {
			q.Where(test.IDIn(testIDs...)).Select(test.FieldID)
		}).
		All(ctx)
	if err != nil {
		return nil, err
	}

	return collections, nil
}
