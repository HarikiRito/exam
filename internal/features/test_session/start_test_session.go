package test_session

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/question"
	"template/internal/ent/questioncollection"
	"template/internal/ent/test"
	"template/internal/ent/testsession"
	"template/internal/shared/utilities/slice"
	"time"

	"entgo.io/ent/dialect/sql"
	"github.com/google/uuid"
)

// StartTestSession starts a test session for a user
func StartTestSession(ctx context.Context, userID uuid.UUID, testID uuid.UUID) (*ent.TestSession, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return nil, err
	}

	// Check if user already has an active session for this test
	existingSession, err := tx.TestSession.Query().
		Where(
			testsession.TestID(testID),
			testsession.UserID(userID),
			testsession.StatusEQ(testsession.StatusPending),
		).
		Select(testsession.FieldID, testsession.FieldTestID).
		First(ctx)
	if err == nil {
		// Session already exists, return it
		if err := tx.Commit(); err != nil {
			return nil, err
		}
		return existingSession, nil
	}
	if !ent.IsNotFound(err) {
		return nil, db.Rollback(tx, err)
	}

	// Update the session to in progress
	existingSession, err = tx.TestSession.UpdateOneID(existingSession.ID).
		SetStatus(testsession.StatusInProgress).
		SetStartedAt(time.Now()).
		Save(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	err = GenerateTestSessionAnswers(ctx, tx, existingSession)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return existingSession, nil
}

// Generate test_session_answers based on the settings of the test
func GenerateTestSessionAnswers(ctx context.Context, tx *ent.Tx, session *ent.TestSession) error {
	testEntity, err := tx.Test.Query().
		Where(test.ID(session.TestID)).
		WithTestQuestionCounts().
		WithQuestionCollections(func(qcq *ent.QuestionCollectionQuery) {
			qcq.Select(questioncollection.FieldID)
		}).
		Only(ctx)
	if err != nil {
		return err
	}

	questionCounts := testEntity.Edges.TestQuestionCounts
	collectionIDs := slice.Map(testEntity.Edges.QuestionCollections, func(c *ent.QuestionCollection) uuid.UUID {
		return c.ID
	})

	type selectedQuestion struct {
		ID     uuid.UUID
		Points int
	}

	selectedQuestions := make([]selectedQuestion, 0)

	// Randomly select questions from the collections based on the question settings in the question_counts table
	for _, questionCount := range questionCounts {
		questions, err := tx.Client().Debug().Question.Query().
			Where(
				question.CollectionIDIn(collectionIDs...),
				question.PointsEQ(questionCount.Points),
			).
			Order((sql.OrderByRand())).
			Limit(questionCount.NumberOfQuestions).
			Select(question.FieldID, question.FieldPoints).
			All(ctx)
		if err != nil {
			return err
		}

		selectedQuestions = append(selectedQuestions, slice.Map(questions, func(q *ent.Question) selectedQuestion {
			return selectedQuestion{
				ID:     q.ID,
				Points: q.Points,
			}
		})...)
	}

	// Create test_session_answers for the selected questions. Using bulk create.
	answers := make([]*ent.TestSessionAnswerCreate, len(selectedQuestions))
	for index, question := range selectedQuestions {
		answers[index] = tx.TestSessionAnswer.Create().
			SetTestSessionID(session.ID).
			SetQuestionID(question.ID).
			SetPoints(question.Points).
			SetOrder(index)
	}

	_, err = tx.TestSessionAnswer.CreateBulk(answers...).Save(ctx)
	if err != nil {
		return err
	}
	return nil
}
