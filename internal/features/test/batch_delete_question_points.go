package test

import (
	"context"
	"errors"
	"template/internal/ent/db"
	"template/internal/ent/schema/mixin"
	"template/internal/ent/test"
	"template/internal/ent/testquestionpoint"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

func BatchDeleteQuestionPoints(ctx context.Context, userId uuid.UUID, input model.BatchDeleteQuestionPointsInput) (bool, error) {
	tx, err := db.OpenTransaction(ctx)

	_, err = tx.Test.Query().
		Where(test.ID(input.TestID)).
		Exist(ctx)
	if err != nil {
		return false, db.Rollback(tx, errors.New("test not found"))
	}

	if len(input.QuestionIds) == 0 {
		return false, db.Rollback(tx, errors.New("no question ids provided"))
	}

	_, err = tx.TestQuestionPoint.Delete().Where(testquestionpoint.QuestionIDIn(input.QuestionIds...)).Exec(mixin.SkipSoftDelete(ctx))

	if err := tx.Commit(); err != nil {
		return false, db.Rollback(tx, err)
	}

	return true, nil
}
