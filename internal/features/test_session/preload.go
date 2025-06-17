package test_session

import (
	"context"
	"template/internal/ent/testsession"
	graphqlFields "template/internal/shared/utilities/graphql"
)

// TestSessionSelectFields returns the fields to select for a test session based on the query preloads.
func TestSessionSelectFields(ctx context.Context) []string {
	preloads := graphqlFields.GetPreloadsAsMap(ctx)

	selectFields := []string{}

	if preloads["id"] {
		selectFields = append(selectFields, testsession.FieldID)
	}

	if preloads["status"] {
		selectFields = append(selectFields, testsession.FieldStatus)
	}

	if preloads["pointsEarned"] {
		selectFields = append(selectFields, testsession.FieldPointsEarned)
	}

	if preloads["maxPoints"] {
		selectFields = append(selectFields, testsession.FieldMaxPoints)
	}

	if preloads["completedAt"] {
		selectFields = append(selectFields, testsession.FieldCompletedAt)
	}

	if preloads["createdAt"] {
		selectFields = append(selectFields, testsession.FieldCreatedAt)
	}

	if preloads["updatedAt"] {
		selectFields = append(selectFields, testsession.FieldUpdatedAt)
	}

	if preloads["courseSectionId"] {
		selectFields = append(selectFields, testsession.FieldCourseSectionID)
	}

	if preloads["testId"] {
		selectFields = append(selectFields, testsession.FieldTestID)
	}

	if preloads["userId"] {
		selectFields = append(selectFields, testsession.FieldUserID)
	}

	return selectFields
}
