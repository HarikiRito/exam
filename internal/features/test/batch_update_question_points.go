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
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

// UpdateQuestionPoints updates the points for a specific question in a test.
// Requires user authentication and authorization (user must own the course containing the test and the question collection).
func BatchUpdateQuestionPoints(ctx context.Context, userId uuid.UUID, input model.BatchUpdateQuestionPointsInput) (bool, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return false, err
	}

	// Get the test and verify ownership through course or course_section
	testExists, err := tx.Test.Query().
		Where(test.ID(input.TestID)).
		Exist(ctx)
	if err != nil || !testExists {
		return false, db.Rollback(tx, errors.New("test not found"))
	}

	questionIds := slice.Map(input.QuestionPoints, func(q *model.QuestionPointsInput) uuid.UUID {
		return q.QuestionID
	})

	// Verify the question exists and is owned by the user
	questions, err := tx.Question.Query().
		Where(
			question.IDIn(questionIds...),
			question.HasCollectionWith(
				questioncollection.CreatorID(userId),
				questioncollection.HasTestWith(test.ID(input.TestID)),
			),
		).
		Select(question.FieldID).
		All(ctx)
	if err != nil {
		return false, db.Rollback(tx, errors.New("question not found or unauthorized"))
	}

	if len(questions) != len(questionIds) {
		return false, db.Rollback(tx, errors.New("some questions are not owned by the user"))
	}

	_, err = tx.TestQuestionPoint.Delete().Where(testquestionpoint.TestID(input.TestID)).Exec(mixin.SkipSoftDelete(ctx))
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	questionPointsCreateQueries := slice.Map(input.QuestionPoints, func(q *model.QuestionPointsInput) *ent.TestQuestionPointCreate {
		return tx.TestQuestionPoint.Create().
			SetQuestionID(q.QuestionID).
			SetPoints(q.Points).
			SetTestID(input.TestID)
	})

	_, err = tx.TestQuestionPoint.CreateBulk(questionPointsCreateQueries...).Save(ctx)

	if err != nil {
		return false, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return false, db.Rollback(tx, err)
	}

	return true, nil
}
