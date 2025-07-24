package question

import (
	"context"
	"encoding/json"
	"errors"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/question"
	"template/internal/ent/questioncollection"
	"template/internal/ent/questionoption"

	"github.com/google/uuid"
)

// ExportedQuestion represents a question in the AI Quiz JSON format
type ExportedQuestion struct {
	Question string           `json:"question"`
	Points   int              `json:"points"`
	Options  []ExportedOption `json:"options"`
}

// ExportedOption represents an option in the AI Quiz JSON format
type ExportedOption struct {
	Text    string `json:"text"`
	Correct bool   `json:"correct"`
}

// ExportQuestions exports questions by their IDs in the AI Quiz JSON format
func ExportQuestions(ctx context.Context, userId uuid.UUID, questionIDs []uuid.UUID) (string, error) {
	if len(questionIDs) == 0 {
		return "", errors.New("no questions provided")
	}

	client, err := db.OpenClient()
	if err != nil {
		return "", err
	}

	// Fetch questions with their options, ensuring user has access through collection ownership
	questions, err := client.Question.Query().
		Where(
			question.IDIn(questionIDs...),
			question.HasCollectionWith(questioncollection.CreatorID(userId)),
		).
		WithQuestionOptions(func(q *ent.QuestionOptionQuery) {
			q.Order(ent.Asc(questionoption.FieldCreatedAt))
		}).
		All(ctx)
	if err != nil {
		return "", err
	}

	if len(questions) == 0 {
		return "", errors.New("no questions found or you don't have access to them")
	}

	// Convert to export format
	exportedQuestions := make([]ExportedQuestion, 0, len(questions))

	for _, q := range questions {
		exportedOptions := make([]ExportedOption, 0, len(q.Edges.QuestionOptions))
		for _, opt := range q.Edges.QuestionOptions {
			exportedOptions = append(exportedOptions, ExportedOption{
				Text:    opt.OptionText,
				Correct: opt.IsCorrect,
			})
		}

		exportedQuestions = append(exportedQuestions, ExportedQuestion{
			Question: q.QuestionText,
			Points:   q.Points,
			Options:  exportedOptions,
		})
	}

	// Convert to JSON
	jsonData, err := json.Marshal(exportedQuestions)
	if err != nil {
		return "", err
	}

	return string(jsonData), nil
}
