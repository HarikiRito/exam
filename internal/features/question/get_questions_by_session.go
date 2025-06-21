package question

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/question"
	"template/internal/ent/testsessionanswer"

	"github.com/google/uuid"
)

// GetQuestionsBySessionIDs fetches questions for multiple session IDs through test_session_answers.
func GetQuestionsBySessionIDs(ctx context.Context, sessionIDs []uuid.UUID) ([]*ent.Question, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	questions, err := client.Question.Query().
		Where(question.HasUserQuestionAnswersWith(
			testsessionanswer.SessionIDIn(sessionIDs...),
		)).
		// WithUserQuestionAnswers(func(q *ent.TestSessionAnswerQuery) {
		// 	q.Where(testsessionanswer.SessionIDIn(sessionIDs...))
		// }).
		All(ctx)
	if err != nil {
		return nil, err
	}

	return questions, nil
}
