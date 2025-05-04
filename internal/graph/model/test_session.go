package model

import (
	"template/internal/ent"
	"time"

	"github.com/google/uuid"
)

// TestSession is used for internal conversion between ent.TestSession and GraphQL TestSession
type TestSession struct {
	ID          uuid.UUID  `json:"id"`
	CompletedAt *time.Time `json:"completedAt,omitempty"`
	TotalScore  int        `json:"totalScore"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

// ConvertTestSessionToModel converts an ent.TestSession to a GraphQL model TestSession.
func ConvertTestSessionToModel(ts *ent.TestSession) *TestSession {
	result := &TestSession{
		ID:          ts.ID,
		CompletedAt: ts.CompletedAt,
		TotalScore:  ts.TotalScore,
		CreatedAt:   ts.CreatedAt,
		UpdatedAt:   ts.UpdatedAt,
	}

	return result
}
