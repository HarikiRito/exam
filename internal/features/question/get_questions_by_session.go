package question

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/question"
	"template/internal/ent/testsession"

	"github.com/google/uuid"
)

// GetQuestionsBySessionIDs fetches questions for multiple session IDs through test_session_answers.
func GetQuestionsBySessionIDs(ctx context.Context, sessionIDs []uuid.UUID) (map[uuid.UUID][]*ent.Question, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	sessions, err := client.TestSession.Query().
		Where(testsession.IDIn(sessionIDs...)).
		WithTestSessionAnswers(func(q *ent.TestSessionAnswerQuery) {
			q.WithQuestion(func(q *ent.QuestionQuery) {
				q.Select(question.FieldID, question.FieldQuestionText)
			})
		}).
		All(ctx)
	if err != nil {
		return nil, err
	}

	questionsMapBySessionID := make(map[uuid.UUID][]*ent.Question, len(sessionIDs))

	for _, session := range sessions {
		for _, answer := range session.Edges.TestSessionAnswers {
			questionsMapBySessionID[session.ID] = append(questionsMapBySessionID[session.ID], answer.Edges.Question)
		}
	}

	return questionsMapBySessionID, nil
}
