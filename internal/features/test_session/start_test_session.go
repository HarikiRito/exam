package test_session

import (
	"context"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/question"
	"template/internal/ent/questioncollection"
	"template/internal/ent/test"
	"template/internal/ent/testignorequestion"
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

	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	if ent.IsNotFound(err) {
		return nil, db.Rollback(tx, fmt.Errorf("test session not found"))
	}

	// Update the session to in progress
	existingSession, err = tx.TestSession.UpdateOneID(existingSession.ID).
		SetStatus(testsession.StatusInProgress).
		SetStartedAt(time.Now()).
		Save(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	err = randomGenerateTestSessionAnswers(ctx, tx, existingSession)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return existingSession, nil
}

// Generate test_session_answers based on the settings of the test
func randomGenerateTestSessionAnswers(ctx context.Context, tx *ent.Tx, session *ent.TestSession) error {
	testEntity, err := tx.Test.Query().
		Where(test.ID(session.TestID)).
		WithTestQuestionCounts().
		WithQuestionCollections(func(questionCollectionQuery *ent.QuestionCollectionQuery) {
			questionCollectionQuery.Select(questioncollection.FieldID)
			questionCollectionQuery.WithQuestions(func(questionQuery *ent.QuestionQuery) {
				questionQuery.Select(question.FieldID, question.FieldPoints)
			})
		}).
		WithTestIgnoreQuestions(func(testIgnoreQuestionQuery *ent.TestIgnoreQuestionQuery) {
			testIgnoreQuestionQuery.Select(testignorequestion.FieldQuestionID)
		}).
		Only(ctx)
	if err != nil {
		return err
	}

	ignoreQuestionIds := slice.Map(testEntity.Edges.TestIgnoreQuestions, func(i *ent.TestIgnoreQuestion) uuid.UUID {
		return i.QuestionID
	})

	questionCounts := testEntity.Edges.TestQuestionCounts

	availableTestQuestions := slice.FlatMap(testEntity.Edges.QuestionCollections, func(c *ent.QuestionCollection) []*ent.Question {
		return slice.Filter(c.Edges.Questions, func(q *ent.Question) bool {
			return !slice.Contains(ignoreQuestionIds, q.ID)
		})
	})

	if len(questionCounts) == 0 {
		return fmt.Errorf("no question counts found for test")
	}

	// Check if the questions is sufficient based on the question counts settings
	for _, questionCount := range questionCounts {
		totalAvailableQuestions := slice.Filter(availableTestQuestions, func(q *ent.Question) bool {
			return q.Points == questionCount.Points
		})

		if len(totalAvailableQuestions) < questionCount.NumberOfQuestions {
			return fmt.Errorf("insufficient questions available for test based on the question counts settings")
		}
	}

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
		questions, err := tx.Question.Query().
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
			SetOrder(index + 1)
	}

	_, err = tx.TestSessionAnswer.CreateBulk(answers...).Save(ctx)
	if err != nil {
		return err
	}
	return nil
}
