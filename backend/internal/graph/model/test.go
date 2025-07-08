package model

import (
	"template/internal/ent"

	"github.com/google/uuid"
)

// ConvertTestToModel converts an ent.Test to a model.Test
func ConvertTestToModel(entTest *ent.Test) *Test {
	if entTest == nil {
		return nil
	}
	return &Test{
		ID:        entTest.ID,
		Name:      entTest.Name,
		TotalTime: entTest.TotalTime,
	}
}

type Test struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	TotalTime *int      `json:"totalTime"`
}
