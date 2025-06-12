package model

import (
	"template/internal/ent"
)

func ConvertTestQuestionCountToModel(tqc *ent.TestQuestionCount) *TestQuestionCount {
	return &TestQuestionCount{
		ID:                tqc.ID,
		TestID:            tqc.TestID,
		NumberOfQuestions: tqc.NumberOfQuestions,
		Points:            tqc.Points,
	}
}
