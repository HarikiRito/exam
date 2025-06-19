package prepare

import (
	"context"
	"template/integration_test/utils"
	"template/internal/ent"
	"template/internal/features/course"
	"template/internal/features/question"
	"template/internal/features/test"
	"template/internal/graph/model"
	"testing"

	"github.com/google/uuid"
)

// CreateCourse creates a test course with the given input
func CreateCourse(t *testing.T, userID uuid.UUID, input model.CreateCourseInput) *ent.Course {
	courseEntity, err := course.CreateCourse(context.Background(), userID, input)
	if err != nil {
		t.Fatalf("Failed to create course: %v", err)
	}
	return courseEntity
}

// CreateQuestion creates a test question with the given input and user ID
func CreateQuestion(t *testing.T, userID uuid.UUID, input model.CreateQuestionInput) *ent.Question {
	questionEntity, err := question.CreateQuestion(context.Background(), userID, input)
	if err != nil {
		t.Fatalf("Failed to create question: %v", err)
	}
	return questionEntity
}

// CreateTest creates a test test with the given input
func CreateTest(t *testing.T, input model.CreateTestInput) *ent.Test {
	testEntity, err := test.CreateTest(context.Background(), input)
	if err != nil {
		t.Fatalf("Failed to create test: %v", err)
	}
	return testEntity
}

// CreateTestWithCourse creates a course and a test associated with it
func CreateTestWithCourse(t *testing.T, userID uuid.UUID) (*ent.Course, *ent.Test) {
	courseInput := model.CreateCourseInput{
		Title:       utils.Faker.Lorem().Word(),
		Description: utils.Ptr(utils.Faker.Lorem().Sentence(10)),
	}
	courseEntity := CreateCourse(t, userID, courseInput)

	testInput := model.CreateTestInput{
		Name:     utils.Faker.Lorem().Word(),
		CourseID: &courseEntity.ID,
	}
	testEntity := CreateTest(t, testInput)

	return courseEntity, testEntity
}

type TestScenario struct {
	User       *ent.User
	Test       *ent.Test
	Collection *ent.QuestionCollection
	Questions  []*ent.Question
}

// CreateTestScenario creates a complete test scenario with user, course, test, collection and questions
func CreateTestScenario(t *testing.T, questionCountConfigs []QuestionCountConfig) TestScenario {
	userInput := model.RegisterInput{
		Email:    utils.Faker.Internet().Email(),
		Password: "testpassword123",
	}
	userEntity := CreateUser(t, userInput)

	testEntity := CreateTest(t, model.CreateTestInput{
		Name: utils.Faker.Lorem().Word(),
	})
	collectionEntity, questions := CreateCollectionWithQuestions(t, userEntity.ID, questionCountConfigs)

	_, err := test.UpdateQuestionCollectionsForTest(context.Background(), userEntity.ID, model.AddMultiCollectionToTestInput{
		TestID:        testEntity.ID,
		CollectionIds: []uuid.UUID{collectionEntity.ID},
	})

	if err != nil {
		t.Fatalf("Failed to add multi collection to test: %v", err)
	}

	return TestScenario{
		User:       userEntity,
		Test:       testEntity,
		Collection: collectionEntity,
		Questions:  questions,
	}
}
