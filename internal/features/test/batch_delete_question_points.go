package test

import (
	"context"
	"errors"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/question"
	"template/internal/ent/questioncollection"
	"template/internal/ent/schema/mixin"
	"template/internal/ent/test"
	"template/internal/ent/testquestionpoint"
	"template/internal/ent/user"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

func BatchDeleteQuestionPoints(ctx context.Context, userId uuid.UUID, input model.BatchDeleteQuestionPointsInput) (bool, error) {
	tx, err := db.OpenTransaction(ctx)

	if err != nil {
		return false, err
	}

	testExists, err := tx.Test.Query().
		Where(test.ID(input.TestID)).
		Exist(ctx)
	if err != nil || !testExists {
		return false, db.Rollback(tx, errors.New("test not found"))
	}

	questionIds := slice.Unique(input.QuestionIds)

	if len(input.QuestionIds) == 0 {
		return false, db.Rollback(tx, errors.New("no question ids provided"))
	}

	// Make sure all the question ids belong to the collection that the user created
	accessedQuestions, err := tx.Question.Query().Where(
		question.HasCollectionWith(
			questioncollection.HasCreatorWith(user.ID(userId)),
		),
		question.IDIn(questionIds...),
	).All(ctx)

	if err != nil {
		return false, db.Rollback(tx, err)
	}

	accessedQuestionIds := slice.Map(accessedQuestions, func(q *ent.Question) uuid.UUID {
		return q.ID
	})

	if len(accessedQuestionIds) != len(questionIds) {
		return false, db.Rollback(tx, errors.New("some questions are not accessible"))
	}

	_, err = tx.TestQuestionPoint.Delete().Where(testquestionpoint.QuestionIDIn(accessedQuestionIds...)).Exec(mixin.SkipSoftDelete(ctx))

	if err != nil {
		return false, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return false, db.Rollback(tx, err)
	}

	return true, nil
}
