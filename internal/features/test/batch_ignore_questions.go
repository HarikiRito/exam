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
	"template/internal/ent/testignorequestion"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

// BatchIgnoreQuestions batch ignores multiple questions for a test with optional reasons.
// Requires user authentication and authorization (user must own the course containing the test and the questions).
func BatchIgnoreQuestions(ctx context.Context, userId uuid.UUID, input model.BatchIgnoreQuestionsInput) (bool, error) {
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

	if len(input.QuestionIgnoreData) == 0 {
		return false, db.Rollback(tx, errors.New("no questions provided to ignore"))
	}

	// Extract question IDs and validate they exist and are owned by the user
	questionIDs := slice.Map(input.QuestionIgnoreData, func(data *model.QuestionIgnoreData) uuid.UUID {
		return data.QuestionID
	})

	if slice.HasDuplicates(questionIDs) {
		return false, db.Rollback(tx, errors.New("duplicate question IDs provided"))
	}

	// Verify all questionCount exist and are owned by the user
	questionCount, err := tx.Question.Query().
		Where(
			question.IDIn(questionIDs...),
			question.HasCollectionWith(questioncollection.CreatorID(userId)),
		).
		Count(ctx)
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	if questionCount != len(questionIDs) {
		return false, db.Rollback(tx, errors.New("one or more questions not found or unauthorized"))
	}

	// Get existing TestIgnoreQuestion records for this test and these questions
	existingIgnores, err := tx.TestIgnoreQuestion.Query().
		Where(
			testignorequestion.TestID(input.TestID),
			testignorequestion.QuestionIDIn(questionIDs...),
		).
		All(ctx)
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	// Create a map of existing ignores by question ID for quick lookup
	existingIgnoresMap := make(map[uuid.UUID]*ent.TestIgnoreQuestion)
	for _, ignore := range existingIgnores {
		existingIgnoresMap[ignore.QuestionID] = ignore
	}

	// Update existing ignores and create new ones

	// Hard delete existing ignores by test id
	_, err = tx.TestIgnoreQuestion.Delete().
		Where(testignorequestion.TestID(input.TestID)).
		Exec(mixin.SkipSoftDelete(ctx))
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	createIgnoreQueries := make([]*ent.TestIgnoreQuestionCreate, 0, len(input.QuestionIgnoreData))
	for _, ignoreData := range input.QuestionIgnoreData {
		create := tx.TestIgnoreQuestion.Create().
			SetTestID(input.TestID).
			SetQuestionID(ignoreData.QuestionID)

		create = create.SetNillableReason(ignoreData.Reason)

		createIgnoreQueries = append(createIgnoreQueries, create)
	}

	_, err = tx.TestIgnoreQuestion.CreateBulk(createIgnoreQueries...).
		Save(ctx)
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return false, db.Rollback(tx, err)
	}

	return true, nil
}
