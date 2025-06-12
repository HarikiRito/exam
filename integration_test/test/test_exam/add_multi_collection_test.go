package test_exam

import (
	"context"
	"sync"
	"template/integration_test/prepare"
	"template/integration_test/utils"
	"template/internal/features/test"
	"template/internal/graph/model"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestAddMultiCollection(t *testing.T) {
	prepare.SetupTestDb(t)

	ctx := context.Background()

	t.Run("AddMultiCollection_Success", func(t *testing.T) {
		t.Parallel()
		// Create test scenario with user, course, test, and multiple collections
		scenario := prepare.CreateTestScenario(t, 3)

		input := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{scenario.Collection.ID},
		}

		result, err := test.UpdateQuestionCollectionsForTest(ctx, scenario.User.ID, input)
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("AddMultiCollection_SingleCollection", func(t *testing.T) {
		t.Parallel()
		// Create test scenario with user, course, test, and one collection
		scenario := prepare.CreateTestScenario(t, 3)

		input := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{scenario.Collection.ID},
		}

		result, err := test.UpdateQuestionCollectionsForTest(ctx, scenario.User.ID, input)
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("AddMultiCollection_ReplaceExistingCollections", func(t *testing.T) {
		t.Parallel()
		// Create test scenario with user, course, test, and initial collection
		scenario := prepare.CreateTestScenario(t, 3)

		// Add initial collection
		initialInput := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{scenario.Collection.ID},
		}
		result, err := test.UpdateQuestionCollectionsForTest(ctx, scenario.User.ID, initialInput)
		assert.NoError(t, err)
		assert.True(t, result)

		// Create new collections and replace the existing ones
		collection2, _ := prepare.CreateCollectionWithQuestions(t, scenario.User.ID, 4)
		collection3, _ := prepare.CreateCollectionWithQuestions(t, scenario.User.ID, 6)

		replaceInput := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{collection2.ID, collection3.ID},
		}

		result, err = test.UpdateQuestionCollectionsForTest(ctx, scenario.User.ID, replaceInput)
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("AddMultiCollection_TestNotFound", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)
		nonExistentTestID := uuid.New()

		input := model.AddMultiCollectionToTestInput{
			TestID:        nonExistentTestID,
			CollectionIds: []uuid.UUID{scenario.Collection.ID},
		}

		result, err := test.UpdateQuestionCollectionsForTest(ctx, scenario.User.ID, input)
		assert.Error(t, err)
		assert.False(t, result)
		assert.Contains(t, err.Error(), "test not found")
	})

	t.Run("AddMultiCollection_UnauthorizedCollection", func(t *testing.T) {
		t.Parallel()
		// Create first user with test and collection
		scenario := prepare.CreateTestScenario(t, 3)

		// Create second user with collection
		userInput2 := model.RegisterInput{
			Email:    utils.Faker.Internet().Email(),
			Password: "testpassword123",
		}
		userEntity2 := prepare.CreateUser(t, userInput2)
		unauthorizedCollection, _ := prepare.CreateCollectionWithQuestions(t, userEntity2.ID, 3)

		// Try to add second user's collection to first user's test
		input := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{unauthorizedCollection.ID},
		}

		result, err := test.UpdateQuestionCollectionsForTest(ctx, scenario.User.ID, input)
		assert.Error(t, err)
		assert.False(t, result)
		assert.Contains(t, err.Error(), "one or more collections not found or unauthorized")
	})

	t.Run("AddMultiCollection_MixedAuthorizedUnauthorized", func(t *testing.T) {
		t.Parallel()
		// Create first user with test and collection
		scenario := prepare.CreateTestScenario(t, 3)

		// Create second user with collection
		userInput2 := model.RegisterInput{
			Email:    utils.Faker.Internet().Email(),
			Password: "testpassword123",
		}
		userEntity2 := prepare.CreateUser(t, userInput2)
		unauthorizedCollection, _ := prepare.CreateCollectionWithQuestions(t, userEntity2.ID, 3)

		// Try to add both authorized and unauthorized collections
		input := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{scenario.Collection.ID, unauthorizedCollection.ID},
		}

		result, err := test.UpdateQuestionCollectionsForTest(ctx, scenario.User.ID, input)
		assert.Error(t, err)
		assert.False(t, result)
		assert.Contains(t, err.Error(), "one or more collections not found or unauthorized")
	})

	t.Run("AddMultiCollection_NonExistentCollection", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)
		nonExistentCollectionID := uuid.New()

		input := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{nonExistentCollectionID},
		}

		result, err := test.UpdateQuestionCollectionsForTest(ctx, scenario.User.ID, input)
		assert.Error(t, err)
		assert.False(t, result)
		assert.Contains(t, err.Error(), "one or more collections not found or unauthorized")
	})

	t.Run("AddMultiCollection_DuplicateCollectionIds", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)

		// Try to add the same collection multiple times
		input := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{scenario.Collection.ID, scenario.Collection.ID},
		}

		result, err := test.UpdateQuestionCollectionsForTest(ctx, scenario.User.ID, input)
		// This should still succeed, but the collection will only be added once
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("AddMultiCollection_EmptyCollectionIds", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)

		input := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: []uuid.UUID{},
		}

		result, err := test.UpdateQuestionCollectionsForTest(ctx, scenario.User.ID, input)
		// Should succeed as clearing collections is valid
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("AddMultiCollection_LargeNumberOfCollections", func(t *testing.T) {
		t.Parallel()
		scenario := prepare.CreateTestScenario(t, 3)

		// Create multiple collections concurrently
		var wg sync.WaitGroup
		// Use a buffered channel to collect collection IDs

		var collectionIds []uuid.UUID

		for i := 0; i < 10; i++ {
			wg.Add(1)
			go func() {
				defer wg.Done()
				collection, _ := prepare.CreateCollectionWithQuestions(t, scenario.User.ID, 2)
				collectionIds = append(collectionIds, collection.ID)
			}()
		}

		wg.Wait() // Wait for all goroutines to complete

		input := model.AddMultiCollectionToTestInput{
			TestID:        scenario.Test.ID,
			CollectionIds: collectionIds,
		}

		result, err := test.UpdateQuestionCollectionsForTest(ctx, scenario.User.ID, input)
		assert.NoError(t, err)
		assert.True(t, result)
	})
}
