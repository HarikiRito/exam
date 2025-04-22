package model

import (
	"template/internal/ent"
)

// ConvertTestToModel converts an ent.Test to a model.Test
func ConvertTestToModel(entTest *ent.Test) *Test {
	if entTest == nil {
		return nil
	}
	return &Test{
		ID:   entTest.ID,
		Name: entTest.Name,
		// Convert additional fields if necessary
	}
}
