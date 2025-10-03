package test_session

import (
	"context"
	"fmt"
	"template/internal/ent/db"
	entTestSession "template/internal/ent/testsession"
	entTestSessionAnswer "template/internal/ent/testsessionanswer"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// GetTestSessionResult retrieves test session results with selected options from metadata
func GetTestSessionResult(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID, isAdminOrOwner bool) (*model.TestSessionResult, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	// Get the test session
	session, err := client.TestSession.Query().
		Where(entTestSession.ID(sessionID)).
		Select(
			entTestSession.FieldID,
			entTestSession.FieldUserID,
			entTestSession.FieldStatus,
			entTestSession.FieldTestID,
			entTestSession.FieldMaxPoints,
			entTestSession.FieldPointsEarned,
			entTestSession.FieldCompletedAt,
			entTestSession.FieldCreatedAt,
			entTestSession.FieldUpdatedAt,
			entTestSession.FieldStartedAt,
			entTestSession.FieldExpiredAt,
		).
		Only(ctx)

	if err != nil {
		return nil, fmt.Errorf("test session not found: %w", err)
	}

	// Verify permission: user can only view own results unless admin/owner
	if !isAdminOrOwner && (session.UserID == nil || *session.UserID != userID) {
		return nil, fmt.Errorf("unauthorized to view this test result")
	}

	// Verify session is completed
	if session.Status != entTestSession.StatusCompleted {
		return nil, fmt.Errorf("test session is not completed")
	}

	// Get all test session answers
	answers, err := client.TestSessionAnswer.Query().
		Where(entTestSessionAnswer.SessionID(sessionID)).
		Select(
			entTestSessionAnswer.FieldQuestionID,
			entTestSessionAnswer.FieldIsCorrect,
			entTestSessionAnswer.FieldMetadata,
		).
		All(ctx)

	if err != nil {
		return nil, err
	}

	// Build question results
	questionResults := make([]*model.QuestionResult, 0, len(answers))

	for _, answer := range answers {
		// Parse metadata to extract selected options
		var selectedOptions []*model.SelectedOption

		if answer.Metadata != nil {
			if selectedOptionsData, ok := answer.Metadata["selected_options"].([]interface{}); ok {
				for _, opt := range selectedOptionsData {
					if optionText, ok := opt.(string); ok {
						selectedOptions = append(selectedOptions, &model.SelectedOption{
							OptionText: optionText,
						})
					}
				}
			}
		}

		isCorrect := false
		if answer.IsCorrect != nil {
			isCorrect = *answer.IsCorrect
		}

		questionResults = append(questionResults, &model.QuestionResult{
			Question:        &model.Question{ID: answer.QuestionID},
			IsCorrect:       isCorrect,
			SelectedOptions: selectedOptions,
		})
	}

	return &model.TestSessionResult{
		ID:          session.ID,
		TestSession: model.ConvertTestSessionToModel(session),
		Questions:   questionResults,
	}, nil
}
