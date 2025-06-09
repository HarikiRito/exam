package question_collection

import (
	"context"
	"template/integration_test/prepare"
	"template/integration_test/utils"
	"template/internal/features/question_collection"
	"template/internal/graph/model"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestDeleteQuestionCollection(t *testing.T) {
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

	t.Run("DeleteCollection_Success", func(t *testing.T) {
		// Create a collection to delete
		collectionInput := model.CreateQuestionCollectionInput{
			Title:       "Collection to Delete",
			Description: utils.Ptr("This collection will be deleted"),
		}
		testCollection, err := question_collection.CreateQuestionCollection(ctx, user1ID, collectionInput)
		require.NoError(t, err)

		// Delete the collection
		success, err := question_collection.DeleteQuestionCollection(ctx, user1ID, testCollection.ID)
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the collection is deleted by trying to retrieve it
		retrievedCollection, err := question_collection.GetQuestionCollectionByID(ctx, user1ID, testCollection.ID)
		assert.Error(t, err)
		assert.Nil(t, retrievedCollection)
	})

	t.Run("DeleteCollection_NotFound", func(t *testing.T) {
		nonExistentID := uuid.New()
		success, err := question_collection.DeleteQuestionCollection(ctx, user1ID, nonExistentID)
		assert.Error(t, err)
		assert.False(t, success)
		assert.Contains(t, err.Error(), "not found")
	})

	t.Run("DeleteCollection_UnauthorizedUser", func(t *testing.T) {
		// Create a collection as user1
		collectionInput := model.CreateQuestionCollectionInput{
			Title:       "User1's Collection",
			Description: utils.Ptr("Only user1 should be able to delete this"),
		}
		user1Collection, err := question_collection.CreateQuestionCollection(ctx, user1ID, collectionInput)
		require.NoError(t, err)

		// Try to delete as user2
		success, err := question_collection.DeleteQuestionCollection(ctx, user2ID, user1Collection.ID)
		assert.Error(t, err)
		assert.False(t, success)
		assert.Contains(t, err.Error(), "unauthorized")

		// Verify the collection still exists
		retrievedCollection, err := question_collection.GetQuestionCollectionByID(ctx, user1ID, user1Collection.ID)
		assert.NoError(t, err)
		assert.NotNil(t, retrievedCollection)
		assert.Equal(t, user1Collection.ID, retrievedCollection.ID)
	})

	t.Run("DeleteCollection_InvalidUUID", func(t *testing.T) {
		success, err := question_collection.DeleteQuestionCollection(ctx, user1ID, uuid.Nil)
		assert.Error(t, err)
		assert.False(t, success)
	})

	t.Run("DeleteCollection_AlreadyDeleted", func(t *testing.T) {
		// Create a collection to delete
		collectionInput := model.CreateQuestionCollectionInput{
			Title: "Collection to Delete Twice",
		}
		testCollection, err := question_collection.CreateQuestionCollection(ctx, user1ID, collectionInput)
		require.NoError(t, err)

		// First deletion
		success1, err := question_collection.DeleteQuestionCollection(ctx, user1ID, testCollection.ID)
		assert.NoError(t, err)
		assert.True(t, success1)

		// Second deletion attempt
		success2, err := question_collection.DeleteQuestionCollection(ctx, user1ID, testCollection.ID)
		assert.Error(t, err)
		assert.False(t, success2)
		assert.Contains(t, err.Error(), "not found")
	})

	t.Run("DeleteCollection_MultipleCollections", func(t *testing.T) {
		// Create multiple collections
		collection1Input := model.CreateQuestionCollectionInput{
			Title:       "Collection 1",
			Description: utils.Ptr("First collection"),
		}
		collection1, err := question_collection.CreateQuestionCollection(ctx, user1ID, collection1Input)
		require.NoError(t, err)

		collection2Input := model.CreateQuestionCollectionInput{
			Title:       "Collection 2",
			Description: utils.Ptr("Second collection"),
		}
		collection2, err := question_collection.CreateQuestionCollection(ctx, user1ID, collection2Input)
		require.NoError(t, err)

		collection3Input := model.CreateQuestionCollectionInput{
			Title:       "Collection 3",
			Description: utils.Ptr("Third collection"),
		}
		collection3, err := question_collection.CreateQuestionCollection(ctx, user1ID, collection3Input)
		require.NoError(t, err)

		// Delete collection 2
		success, err := question_collection.DeleteQuestionCollection(ctx, user1ID, collection2.ID)
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify collection 1 and 3 still exist
		retrieved1, err := question_collection.GetQuestionCollectionByID(ctx, user1ID, collection1.ID)
		assert.NoError(t, err)
		assert.NotNil(t, retrieved1)

		retrieved3, err := question_collection.GetQuestionCollectionByID(ctx, user1ID, collection3.ID)
		assert.NoError(t, err)
		assert.NotNil(t, retrieved3)

		// Verify collection 2 is deleted
		retrieved2, err := question_collection.GetQuestionCollectionByID(ctx, user1ID, collection2.ID)
		assert.Error(t, err)
		assert.Nil(t, retrieved2)
	})

	t.Run("DeleteCollection_CrossUserValidation", func(t *testing.T) {
		// Each user creates their own collection
		user1CollectionInput := model.CreateQuestionCollectionInput{
			Title: "User1's Collection for Cross Validation",
		}
		user1Collection, err := question_collection.CreateQuestionCollection(ctx, user1ID, user1CollectionInput)
		require.NoError(t, err)

		user2CollectionInput := model.CreateQuestionCollectionInput{
			Title: "User2's Collection for Cross Validation",
		}
		user2Collection, err := question_collection.CreateQuestionCollection(ctx, user2ID, user2CollectionInput)
		require.NoError(t, err)

		// User1 should be able to delete their own collection
		success1, err := question_collection.DeleteQuestionCollection(ctx, user1ID, user1Collection.ID)
		assert.NoError(t, err)
		assert.True(t, success1)

		// User2 should be able to delete their own collection
		success2, err := question_collection.DeleteQuestionCollection(ctx, user2ID, user2Collection.ID)
		assert.NoError(t, err)
		assert.True(t, success2)

		// Verify both collections are deleted
		retrieved1, err := question_collection.GetQuestionCollectionByID(ctx, user1ID, user1Collection.ID)
		assert.Error(t, err)
		assert.Nil(t, retrieved1)

		retrieved2, err := question_collection.GetQuestionCollectionByID(ctx, user2ID, user2Collection.ID)
		assert.Error(t, err)
		assert.Nil(t, retrieved2)
	})

	t.Run("DeleteCollection_WithUpdateBeforeDeletion", func(t *testing.T) {
		// Create a collection
		collectionInput := model.CreateQuestionCollectionInput{
			Title:       "Collection to Update then Delete",
			Description: utils.Ptr("Original description"),
		}
		testCollection, err := question_collection.CreateQuestionCollection(ctx, user1ID, collectionInput)
		require.NoError(t, err)

		// Update the collection
		updateInput := model.UpdateQuestionCollectionInput{
			Title:       utils.Ptr("Updated Title Before Deletion"),
			Description: utils.Ptr("Updated description before deletion"),
		}
		updatedCollection, err := question_collection.UpdateQuestionCollection(ctx, user1ID, testCollection.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedCollection)

		// Delete the updated collection
		success, err := question_collection.DeleteQuestionCollection(ctx, user1ID, testCollection.ID)
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the collection is deleted
		retrievedCollection, err := question_collection.GetQuestionCollectionByID(ctx, user1ID, testCollection.ID)
		assert.Error(t, err)
		assert.Nil(t, retrievedCollection)
	})

	t.Run("DeleteCollection_ConcurrentDeletion", func(t *testing.T) {
		// Create a collection
		collectionInput := model.CreateQuestionCollectionInput{
			Title: "Collection for Concurrent Deletion Test",
		}
		testCollection, err := question_collection.CreateQuestionCollection(ctx, user1ID, collectionInput)
		require.NoError(t, err)

		// Simulate concurrent deletion attempts
		// This test verifies that the system handles race conditions gracefully
		done := make(chan bool, 2)
		var success1, success2 bool
		var err1, err2 error

		// First goroutine
		go func() {
			success1, err1 = question_collection.DeleteQuestionCollection(ctx, user1ID, testCollection.ID)
			done <- true
		}()

		// Second goroutine
		go func() {
			success2, err2 = question_collection.DeleteQuestionCollection(ctx, user1ID, testCollection.ID)
			done <- true
		}()

		// Wait for both to complete
		<-done
		<-done

		// At least one should succeed, and one should fail with "not found"
		if success1 {
			assert.NoError(t, err1)
			assert.Error(t, err2)
			assert.False(t, success2)
		} else if success2 {
			assert.NoError(t, err2)
			assert.Error(t, err1)
			assert.False(t, success1)
		} else {
			t.Fatal("Both deletion attempts failed, at least one should have succeeded")
		}

		// Verify the collection is deleted
		retrievedCollection, err := question_collection.GetQuestionCollectionByID(ctx, user1ID, testCollection.ID)
		assert.Error(t, err)
		assert.Nil(t, retrievedCollection)
	})

	t.Run("DeleteCollection_SoftDelete_Verification", func(t *testing.T) {
		// Create a collection
		collectionInput := model.CreateQuestionCollectionInput{
			Title: "Collection for Soft Delete Verification",
		}
		testCollection, err := question_collection.CreateQuestionCollection(ctx, user1ID, collectionInput)
		require.NoError(t, err)

		// Delete the collection
		success, err := question_collection.DeleteQuestionCollection(ctx, user1ID, testCollection.ID)
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the collection cannot be retrieved
		retrievedCollection, err := question_collection.GetQuestionCollectionByID(ctx, user1ID, testCollection.ID)
		assert.Error(t, err)
		assert.Nil(t, retrievedCollection)

		// Try to update the deleted collection
		updateInput := model.UpdateQuestionCollectionInput{
			Title: utils.Ptr("Trying to update deleted collection"),
		}
		updatedCollection, err := question_collection.UpdateQuestionCollection(ctx, user1ID, testCollection.ID, updateInput)
		assert.Error(t, err)
		assert.Nil(t, updatedCollection)

		// Try to delete the already deleted collection again
		success2, err := question_collection.DeleteQuestionCollection(ctx, user1ID, testCollection.ID)
		assert.Error(t, err)
		assert.False(t, success2)
	})
}
