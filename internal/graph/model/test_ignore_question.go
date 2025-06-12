package model

import (
	"template/internal/ent"
)

func ConvertTestIgnoreQuestionToModel(tiq *ent.TestIgnoreQuestion) *TestIgnoreQuestion {
	return &TestIgnoreQuestion{
		ID:         tiq.ID,
		TestID:     tiq.TestID,
		QuestionID: tiq.QuestionID,
		Reason:     tiq.Reason,
	}
}
