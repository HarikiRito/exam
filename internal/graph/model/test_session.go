package model

import (
	"template/internal/ent"
	"template/internal/ent/testsession"
	"time"

	"github.com/google/uuid"
)

// TestSession is used for internal conversion between ent.TestSession and GraphQL TestSession
type TestSession struct {
	ID           uuid.UUID         `json:"id"`
	CompletedAt  *time.Time        `json:"completedAt,omitempty"`
	MaxPoints    int               `json:"maxPoints"`
	PointsEarned int               `json:"pointsEarned"`
	CreatedAt    time.Time         `json:"createdAt"`
	UpdatedAt    time.Time         `json:"updatedAt"`
	Status       TestSessionStatus `json:"status"`
	StartedAt    *time.Time        `json:"startedAt,omitempty"`
	ExpiredAt    *time.Time        `json:"expiredAt,omitempty"`
}

// ConvertTestSessionToModel converts an ent.TestSession to a GraphQL model TestSession.
func ConvertTestSessionToModel(ts *ent.TestSession) *TestSession {
	result := &TestSession{
		ID:           ts.ID,
		CompletedAt:  ts.CompletedAt,
		MaxPoints:    ts.MaxPoints,
		PointsEarned: ts.PointsEarned,
		CreatedAt:    ts.CreatedAt,
		UpdatedAt:    ts.UpdatedAt,
		StartedAt:    ts.StartedAt,
		ExpiredAt:    ts.ExpiredAt,
		Status:       convertEntStatusToGraphQLStatus(ts.Status),
	}

	return result
}

// convertEntStatusToGraphQLStatus converts ent TestSession status to GraphQL TestSessionStatus
func convertEntStatusToGraphQLStatus(entStatus testsession.Status) TestSessionStatus {
	switch entStatus {
	case testsession.StatusPending:
		return TestSessionStatusPending
	case testsession.StatusCompleted:
		return TestSessionStatusCompleted
	case testsession.StatusInProgress:
		return TestSessionStatusInProgress
	case testsession.StatusCancelled:
		return TestSessionStatusCancelled
	case testsession.StatusExpired:
		return TestSessionStatusExpired
	default:
		return TestSessionStatusPending
	}
}
