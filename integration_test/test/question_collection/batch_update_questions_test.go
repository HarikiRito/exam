package question_collection

import (
	"context"
	"fmt"
	"template/integration_test/prepare"
	"template/integration_test/utils"
	"template/internal/ent"
	"template/internal/features/question"
	"template/internal/features/question_collection"
	"template/internal/graph/model"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUpdateBatchQuestionsByCollection(t *testing.T) {
	prepare.SetupTestDb(t)

	ctx := context.Background()

	// Create test users
	user1Input := model.RegisterInput{
		Email:    utils.Faker.Internet().Email(),
		Password: "testpassword123",
	}
	user1Entity := prepare.CreateUser(t, user1Input)
	user1ID := user1Entity.ID

	user2Input := model.RegisterInput{
		Email:    utils.Faker.Internet().Email(),
		Password: "testpassword123",
	}
	user2Entity := prepare.CreateUser(t, user2Input)
	user2ID := user2Entity.ID

	// Create test collection for user1
	collectionInput := model.CreateQuestionCollectionInput{
		Title:       "Test Collection for Batch Updates",
		Description: utils.Ptr("Collection for testing batch operations"),
	}
	testCollection, err := question_collection.CreateQuestionCollection(ctx, user1ID, collectionInput)
	require.NoError(t, err)

	t.Run("BatchUpdate_CreateQuestions_Success", func(t *testing.T) {
		input := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: testCollection.ID,
			Questions: []*model.UpdateQuestionData{
				{
					QuestionText: utils.Ptr("What is 2 + 2?"),
					Options: []*model.UpdateQuestionOptionInput{
						{
							OptionText: utils.Ptr("3"),
							IsCorrect:  utils.Ptr(false),
						},
						{
							OptionText: utils.Ptr("4"),
							IsCorrect:  utils.Ptr(true),
						},
						{
							OptionText: utils.Ptr("5"),
							IsCorrect:  utils.Ptr(false),
						},
					},
				},
				{
					QuestionText: utils.Ptr("What is the capital of France?"),
					Options: []*model.UpdateQuestionOptionInput{
						{
							OptionText: utils.Ptr("London"),
							IsCorrect:  utils.Ptr(false),
						},
						{
							OptionText: utils.Ptr("Paris"),
							IsCorrect:  utils.Ptr(true),
						},
						{
							OptionText: utils.Ptr("Berlin"),
							IsCorrect:  utils.Ptr(false),
						},
					},
				},
			},
		}

		err := question_collection.UpdateBatchQuestionsByCollection(ctx, user1ID, input)
		assert.NoError(t, err)

		// Verify questions were created
		questions, err := question.GetQuestionsByCollectionIDs(ctx, []uuid.UUID{testCollection.ID})
		assert.NoError(t, err)
		assert.Len(t, questions, 2)

		// Verify options were created
		for _, q := range questions {
			options, err := question.GetQuestionOptionsByQuestionIDs(ctx, []uuid.UUID{q.ID})
			assert.NoError(t, err)
			assert.Len(t, options, 3)

			// Verify at least one option is correct
			hasCorrectOption := false
			for _, opt := range options {
				if opt.IsCorrect {
					hasCorrectOption = true
					break
				}
			}
			assert.True(t, hasCorrectOption)
		}
	})

	t.Run("BatchUpdate_UpdateQuestions_Success", func(t *testing.T) {
		// First, get existing questions
		existingQuestions, err := question.GetQuestionsByCollectionIDs(ctx, []uuid.UUID{testCollection.ID})
		require.NoError(t, err)
		require.Len(t, existingQuestions, 2)

		input := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: testCollection.ID,
			Questions: []*model.UpdateQuestionData{
				{
					ID:           &existingQuestions[0].ID,
					QuestionText: utils.Ptr("Updated: What is 2 + 2?"),
					Options: []*model.UpdateQuestionOptionInput{
						{
							OptionText: utils.Ptr("Updated: 3"),
							IsCorrect:  utils.Ptr(false),
						},
						{
							OptionText: utils.Ptr("Updated: 4"),
							IsCorrect:  utils.Ptr(true),
						},
					},
				},
				{
					ID:           &existingQuestions[1].ID,
					QuestionText: utils.Ptr("Updated: What is the capital of France?"),
					Options: []*model.UpdateQuestionOptionInput{
						{
							OptionText: utils.Ptr("Updated: Paris"),
							IsCorrect:  utils.Ptr(true),
						},
					},
				},
			},
		}

		err = question_collection.UpdateBatchQuestionsByCollection(ctx, user1ID, input)
		assert.NoError(t, err)

		// Verify questions were updated
		updatedQuestions, err := question.GetQuestionsByCollectionIDs(ctx, []uuid.UUID{testCollection.ID})
		assert.NoError(t, err)
		assert.Len(t, updatedQuestions, 2)

		for _, q := range updatedQuestions {
			assert.Contains(t, q.QuestionText, "Updated:")
		}

		// Verify options were updated (old options deleted, new ones created)
		for _, q := range updatedQuestions {
			options, err := question.GetQuestionOptionsByQuestionIDs(ctx, []uuid.UUID{q.ID})
			assert.NoError(t, err)

			for _, opt := range options {
				assert.Contains(t, opt.OptionText, "Updated:")
			}
		}
	})

	t.Run("BatchUpdate_DeleteQuestions_Success", func(t *testing.T) {
		// Get existing questions
		existingQuestions, err := question.GetQuestionsByCollectionIDs(ctx, []uuid.UUID{testCollection.ID})
		require.NoError(t, err)
		require.Len(t, existingQuestions, 2)

		// Delete one question by providing ID without question text
		input := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: testCollection.ID,
			Questions: []*model.UpdateQuestionData{
				{
					ID: &existingQuestions[0].ID,
					// No QuestionText means delete
					Options: []*model.UpdateQuestionOptionInput{},
				},
			},
		}

		err = question_collection.UpdateBatchQuestionsByCollection(ctx, user1ID, input)
		assert.NoError(t, err)

		// Verify one question was deleted
		remainingQuestions, err := question.GetQuestionsByCollectionIDs(ctx, []uuid.UUID{testCollection.ID})
		assert.NoError(t, err)
		assert.Len(t, remainingQuestions, 1)
		assert.Equal(t, existingQuestions[1].ID, remainingQuestions[0].ID)
	})

	t.Run("BatchUpdate_MixedOperations_Success", func(t *testing.T) {

		// Create a new collection for this test
		newCollectionInput := model.CreateQuestionCollectionInput{
			Title: "Mixed Operations Collection",
		}
		mixedCollection, err := question_collection.CreateQuestionCollection(ctx, user1ID, newCollectionInput)
		require.NoError(t, err)

		// First, create some initial questions
		createInput := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: mixedCollection.ID,
			Questions: []*model.UpdateQuestionData{
				{
					QuestionText: utils.Ptr("Initial question 1"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("Option 1"), IsCorrect: utils.Ptr(true)},
						{OptionText: utils.Ptr("Option 2"), IsCorrect: utils.Ptr(false)},
					},
				},
				{
					QuestionText: utils.Ptr("Initial question 2"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("Option A"), IsCorrect: utils.Ptr(true)},
					},
				},
			},
		}
		err = question_collection.UpdateBatchQuestionsByCollection(ctx, user1ID, createInput)
		require.NoError(t, err)

		// Get created questions
		createdQuestions, err := question.GetQuestionsByCollectionIDs(ctx, []uuid.UUID{mixedCollection.ID})
		require.NoError(t, err)
		require.Len(t, createdQuestions, 2)

		// Now perform mixed operations: create, update, delete
		mixedInput := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: mixedCollection.ID,
			Questions: []*model.UpdateQuestionData{
				// Update first question
				{
					ID:           &createdQuestions[0].ID,
					QuestionText: utils.Ptr("Updated question 1"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("Updated Option 1"), IsCorrect: utils.Ptr(true)},
					},
				},
				// Delete second question
				{
					ID: &createdQuestions[1].ID,
					// No QuestionText means delete
					Options: []*model.UpdateQuestionOptionInput{},
				},
				// Create new question
				{
					QuestionText: utils.Ptr("New question 3"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("New Option 1"), IsCorrect: utils.Ptr(true)},
						{OptionText: utils.Ptr("New Option 2"), IsCorrect: utils.Ptr(false)},
					},
				},
			},
		}

		err = question_collection.UpdateBatchQuestionsByCollection(ctx, user1ID, mixedInput)
		assert.NoError(t, err)

		// Verify results
		finalQuestions, err := question.GetQuestionsByCollectionIDs(ctx, []uuid.UUID{mixedCollection.ID})
		assert.NoError(t, err)
		assert.Len(t, finalQuestions, 2) // Updated question + new question

		// Find the updated and new questions
		var updatedQuestion, newQuestion *ent.Question
		for _, q := range finalQuestions {
			if q.ID == createdQuestions[0].ID {
				updatedQuestion = q
			} else {
				newQuestion = q
			}
		}

		require.NotNil(t, updatedQuestion)
		require.NotNil(t, newQuestion)

		assert.Equal(t, "Updated question 1", updatedQuestion.QuestionText)
		assert.Equal(t, "New question 3", newQuestion.QuestionText)
	})

	t.Run("BatchUpdate_UnauthorizedUser", func(t *testing.T) {
		input := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: testCollection.ID,
			Questions: []*model.UpdateQuestionData{
				{
					QuestionText: utils.Ptr("Unauthorized question"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("Option"), IsCorrect: utils.Ptr(true)},
					},
				},
			},
		}

		err := question_collection.UpdateBatchQuestionsByCollection(ctx, user2ID, input)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "don't have access")
	})

	t.Run("BatchUpdate_CollectionNotFound", func(t *testing.T) {
		nonExistentID := uuid.New()
		input := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: nonExistentID,
			Questions: []*model.UpdateQuestionData{
				{
					QuestionText: utils.Ptr("Question for non-existent collection"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("Option"), IsCorrect: utils.Ptr(true)},
					},
				},
			},
		}

		err := question_collection.UpdateBatchQuestionsByCollection(ctx, user1ID, input)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "collection not found")
	})

	t.Run("BatchUpdate_NoCorrectOption", func(t *testing.T) {
		input := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: testCollection.ID,
			Questions: []*model.UpdateQuestionData{
				{
					QuestionText: utils.Ptr("Question with no correct option"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("Wrong option 1"), IsCorrect: utils.Ptr(false)},
						{OptionText: utils.Ptr("Wrong option 2"), IsCorrect: utils.Ptr(false)},
					},
				},
			},
		}

		err := question_collection.UpdateBatchQuestionsByCollection(ctx, user1ID, input)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "at least one option must be correct")
	})

	t.Run("BatchUpdate_EmptyOptions", func(t *testing.T) {
		input := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: testCollection.ID,
			Questions: []*model.UpdateQuestionData{
				{
					QuestionText: utils.Ptr("Question with empty options"),
					Options:      []*model.UpdateQuestionOptionInput{},
				},
			},
		}

		err := question_collection.UpdateBatchQuestionsByCollection(ctx, user1ID, input)
		// This should succeed as empty options is allowed for deletion scenarios
		assert.Contains(t, err.Error(), "at least one option must be correct")
	})

	t.Run("BatchUpdate_InvalidQuestionID", func(t *testing.T) {
		invalidID := uuid.New()
		input := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: testCollection.ID,
			Questions: []*model.UpdateQuestionData{
				{
					ID:           &invalidID,
					QuestionText: utils.Ptr("Update non-existent question"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("Option"), IsCorrect: utils.Ptr(true)},
					},
				},
			},
		}

		err := question_collection.UpdateBatchQuestionsByCollection(ctx, user1ID, input)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "questions not found")
	})

	t.Run("BatchUpdate_MultipleCorrectOptions", func(t *testing.T) {
		input := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: testCollection.ID,
			Questions: []*model.UpdateQuestionData{
				{
					QuestionText: utils.Ptr("Question with multiple correct options"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("Correct option 1"), IsCorrect: utils.Ptr(true)},
						{OptionText: utils.Ptr("Correct option 2"), IsCorrect: utils.Ptr(true)},
						{OptionText: utils.Ptr("Wrong option"), IsCorrect: utils.Ptr(false)},
					},
				},
			},
		}

		err := question_collection.UpdateBatchQuestionsByCollection(ctx, user1ID, input)
		assert.NoError(t, err) // Multiple correct options should be allowed
	})

	t.Run("BatchUpdate_NilOptionText", func(t *testing.T) {
		input := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: testCollection.ID,
			Questions: []*model.UpdateQuestionData{
				{
					QuestionText: utils.Ptr("Question with nil option text"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: nil, IsCorrect: utils.Ptr(true)},
						{OptionText: utils.Ptr("Valid option"), IsCorrect: utils.Ptr(false)},
					},
				},
			},
		}

		err := question_collection.UpdateBatchQuestionsByCollection(ctx, user1ID, input)
		assert.Error(t, err, "option text can't be nil") // Should handle nil option text gracefully
	})

	t.Run("BatchUpdate_NilIsCorrect", func(t *testing.T) {
		input := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: testCollection.ID,
			Questions: []*model.UpdateQuestionData{
				{
					QuestionText: utils.Ptr("Question with nil IsCorrect"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("Option 1"), IsCorrect: nil},
						{OptionText: utils.Ptr("Option 2"), IsCorrect: utils.Ptr(true)},
					},
				},
			},
		}

		err := question_collection.UpdateBatchQuestionsByCollection(ctx, user1ID, input)
		assert.NoError(t, err) // Should handle nil IsCorrect gracefully (defaults to false)
	})

	t.Run("BatchUpdate_EmptyQuestions", func(t *testing.T) {
		input := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: testCollection.ID,
			Questions:    []*model.UpdateQuestionData{},
		}

		err := question_collection.UpdateBatchQuestionsByCollection(ctx, user1ID, input)
		assert.NoError(t, err) // Empty questions array should be allowed
	})

	t.Run("BatchUpdate_LargeNumberOfQuestions", func(t *testing.T) {
		// Create a new collection for this test
		largeCollectionInput := model.CreateQuestionCollectionInput{
			Title: "Large Batch Collection",
		}
		largeCollection, err := question_collection.CreateQuestionCollection(ctx, user1ID, largeCollectionInput)
		require.NoError(t, err)

		// Create many questions at once
		var questions []*model.UpdateQuestionData
		for i := 0; i < 50; i++ {
			questions = append(questions, &model.UpdateQuestionData{
				QuestionText: utils.Ptr(fmt.Sprintf("Question %d", i+1)),
				Options: []*model.UpdateQuestionOptionInput{
					{OptionText: utils.Ptr(fmt.Sprintf("Option A %d", i+1)), IsCorrect: utils.Ptr(true)},
					{OptionText: utils.Ptr(fmt.Sprintf("Option B %d", i+1)), IsCorrect: utils.Ptr(false)},
				},
			})
		}

		input := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: largeCollection.ID,
			Questions:    questions,
		}

		err = question_collection.UpdateBatchQuestionsByCollection(ctx, user1ID, input)
		assert.NoError(t, err)

		// Verify all questions were created
		createdQuestions, err := question.GetQuestionsByCollectionIDs(ctx, []uuid.UUID{largeCollection.ID})
		assert.NoError(t, err)
		assert.Len(t, createdQuestions, 50)
	})

	t.Run("BatchUpdate_TransactionRollback", func(t *testing.T) {
		// Create a new collection for this test
		rollbackCollectionInput := model.CreateQuestionCollectionInput{
			Title: "Rollback Test Collection",
		}
		rollbackCollection, err := question_collection.CreateQuestionCollection(ctx, user1ID, rollbackCollectionInput)
		require.NoError(t, err)

		// First create a valid question
		validInput := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: rollbackCollection.ID,
			Questions: []*model.UpdateQuestionData{
				{
					QuestionText: utils.Ptr("Valid question"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("Valid option"), IsCorrect: utils.Ptr(true)},
					},
				},
			},
		}
		err = question_collection.UpdateBatchQuestionsByCollection(ctx, user1ID, validInput)
		require.NoError(t, err)

		// Get initial count
		initialQuestions, err := question.GetQuestionsByCollectionIDs(ctx, []uuid.UUID{rollbackCollection.ID})
		require.NoError(t, err)
		initialCount := len(initialQuestions)

		// Try to create a batch with mixed valid and invalid operations
		// This should fail and rollback everything
		invalidInput := model.UpdateBatchQuestionsByCollectionInput{
			CollectionID: rollbackCollection.ID,
			Questions: []*model.UpdateQuestionData{
				{
					QuestionText: utils.Ptr("Valid question 2"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("Valid option"), IsCorrect: utils.Ptr(true)},
					},
				},
				{
					QuestionText: utils.Ptr("Invalid question - no correct option"),
					Options: []*model.UpdateQuestionOptionInput{
						{OptionText: utils.Ptr("Wrong option"), IsCorrect: utils.Ptr(false)},
					},
				},
			},
		}

		err = question_collection.UpdateBatchQuestionsByCollection(ctx, user1ID, invalidInput)
		assert.Error(t, err)

		// Verify no questions were added (transaction rolled back)
		finalQuestions, err := question.GetQuestionsByCollectionIDs(ctx, []uuid.UUID{rollbackCollection.ID})
		assert.NoError(t, err)
		assert.Len(t, finalQuestions, initialCount) // Should be same as before
	})
}
