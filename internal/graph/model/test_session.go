package model

import (
	"template/internal/ent"
	"time"

	"github.com/google/uuid"
)

// TestSessionModel is used for internal conversion between ent.TestSession and GraphQL TestSession
type TestSessionModel struct {
	ID                  uuid.UUID             `json:"id"`
	User                *User                 `json:"user"`
	Test                *Test                 `json:"test"`
	CourseSection       *CourseSection        `json:"courseSection,omitempty"`
	CompletedAt         *time.Time            `json:"completedAt,omitempty"`
	TotalScore          int                   `json:"totalScore"`
	UserQuestionAnswers []*UserQuestionAnswer `json:"userQuestionAnswers"`
	CreatedAt           time.Time             `json:"createdAt"`
	UpdatedAt           time.Time             `json:"updatedAt"`
}

// ConvertTestSessionToModel converts an ent.TestSession to a GraphQL model TestSession.
func ConvertTestSessionToModel(ts *ent.TestSession) *TestSession {
	result := &TestSession{
		ID:         ts.ID,
		TotalScore: ts.TotalScore,
		CreatedAt:  ts.CreatedAt,
		UpdatedAt:  ts.UpdatedAt,
	}

	// Set completedAt if it's not a zero time
	zeroTime := time.Time{}
	if ts.CompletedAt != zeroTime {
		completedAt := ts.CompletedAt
		result.CompletedAt = &completedAt
	}

	return result
}
