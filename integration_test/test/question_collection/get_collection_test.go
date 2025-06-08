package question_collection

import (
	"context"
	"template/integration_test/prepare"
	"template/integration_test/setup"
	"template/integration_test/utils"
	"template/internal/features/question_collection"
	"template/internal/graph/model"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetQuestionCollectionByID(t *testing.T) {
	dbSchema := utils.RandomDbSchema()
	setup.ResetTestSchema(t, dbSchema)
	t.Cleanup(func() {
		setup.DeleteTestSchema(t, dbSchema)
	})

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
		Title:       "Test Collection for Retrieval",
		Description: utils.Ptr("This collection is used for testing retrieval"),
	}
	testCollection, err := question_collection.CreateQuestionCollection(ctx, user1ID, collectionInput)
	require.NoError(t, err)
	require.NotNil(t, testCollection)

	t.Run("GetCollection_Success", func(t *testing.T) {
		retrievedCollection, err := question_collection.GetQuestionCollectionByID(ctx, user1ID, testCollection.ID)
		assert.NoError(t, err)
		assert.NotNil(t, retrievedCollection)
		assert.Equal(t, testCollection.ID, retrievedCollection.ID)
		assert.Equal(t, testCollection.Title, retrievedCollection.Title)
		assert.Equal(t, testCollection.Description, retrievedCollection.Description)
		assert.Equal(t, testCollection.CreatorID, retrievedCollection.CreatorID)
		assert.True(t, testCollection.CreatedAt.Truncate(time.Microsecond).Equal(retrievedCollection.CreatedAt.Truncate(time.Microsecond)))
		assert.True(t, testCollection.UpdatedAt.Truncate(time.Microsecond).Equal(retrievedCollection.UpdatedAt.Truncate(time.Microsecond)))
	})

	t.Run("GetCollection_NotFound", func(t *testing.T) {
		nonExistentID := uuid.New()
		retrievedCollection, err := question_collection.GetQuestionCollectionByID(ctx, user1ID, nonExistentID)
		assert.Error(t, err)
		assert.Nil(t, retrievedCollection)
	})

	t.Run("GetCollection_UnauthorizedUser", func(t *testing.T) {
		// User2 tries to access User1's collection
		retrievedCollection, err := question_collection.GetQuestionCollectionByID(ctx, user2ID, testCollection.ID)
		assert.Error(t, err)
		assert.Nil(t, retrievedCollection)
	})

	t.Run("GetCollection_InvalidUUID", func(t *testing.T) {
		// Test with nil UUID
		retrievedCollection, err := question_collection.GetQuestionCollectionByID(ctx, user1ID, uuid.Nil)
		assert.Error(t, err)
		assert.Nil(t, retrievedCollection)
	})

	t.Run("GetCollection_AfterCreation", func(t *testing.T) {
		// Create a new collection and immediately retrieve it
		newInput := model.CreateQuestionCollectionInput{
			Title:       "Immediately Retrieved Collection",
			Description: utils.Ptr("Test immediate retrieval"),
		}

		newCollection, err := question_collection.CreateQuestionCollection(ctx, user1ID, newInput)
		require.NoError(t, err)

		retrievedCollection, err := question_collection.GetQuestionCollectionByID(ctx, user1ID, newCollection.ID)
		assert.NoError(t, err)
		assert.NotNil(t, retrievedCollection)
		assert.Equal(t, newCollection.ID, retrievedCollection.ID)
		assert.Equal(t, newInput.Title, retrievedCollection.Title)
		assert.Equal(t, newInput.Description, retrievedCollection.Description)
	})

	t.Run("GetCollection_MultipleUsers_SeparateAccess", func(t *testing.T) {
		// Each user creates their own collection
		user1CollectionInput := model.CreateQuestionCollectionInput{
			Title:       "User1's Collection",
			Description: utils.Ptr("Collection belonging to user1"),
		}
		user1Collection, err := question_collection.CreateQuestionCollection(ctx, user1ID, user1CollectionInput)
		require.NoError(t, err)

		user2CollectionInput := model.CreateQuestionCollectionInput{
			Title:       "User2's Collection",
			Description: utils.Ptr("Collection belonging to user2"),
		}
		user2Collection, err := question_collection.CreateQuestionCollection(ctx, user2ID, user2CollectionInput)
		require.NoError(t, err)

		// User1 can access their own collection
		retrieved1, err := question_collection.GetQuestionCollectionByID(ctx, user1ID, user1Collection.ID)
		assert.NoError(t, err)
		assert.NotNil(t, retrieved1)
		assert.Equal(t, user1Collection.ID, retrieved1.ID)

		// User2 can access their own collection
		retrieved2, err := question_collection.GetQuestionCollectionByID(ctx, user2ID, user2Collection.ID)
		assert.NoError(t, err)
		assert.NotNil(t, retrieved2)
		assert.Equal(t, user2Collection.ID, retrieved2.ID)

		// User1 cannot access User2's collection
		retrieved1FromUser2, err := question_collection.GetQuestionCollectionByID(ctx, user1ID, user2Collection.ID)
		assert.Error(t, err)
		assert.Nil(t, retrieved1FromUser2)

		// User2 cannot access User1's collection
		retrieved2FromUser1, err := question_collection.GetQuestionCollectionByID(ctx, user2ID, user1Collection.ID)
		assert.Error(t, err)
		assert.Nil(t, retrieved2FromUser1)
	})

	t.Run("GetCollection_ConsistentData", func(t *testing.T) {
		// Retrieve the same collection multiple times and verify consistency
		retrieval1, err := question_collection.GetQuestionCollectionByID(ctx, user1ID, testCollection.ID)
		assert.NoError(t, err)
		assert.NotNil(t, retrieval1)

		retrieval2, err := question_collection.GetQuestionCollectionByID(ctx, user1ID, testCollection.ID)
		assert.NoError(t, err)
		assert.NotNil(t, retrieval2)

		// Both retrievals should return identical data
		assert.Equal(t, retrieval1.ID, retrieval2.ID)
		assert.Equal(t, retrieval1.Title, retrieval2.Title)
		assert.Equal(t, retrieval1.Description, retrieval2.Description)
		assert.Equal(t, retrieval1.CreatorID, retrieval2.CreatorID)
		assert.True(t, retrieval1.CreatedAt.Truncate(time.Microsecond).Equal(retrieval2.CreatedAt.Truncate(time.Microsecond)))
		assert.True(t, retrieval1.UpdatedAt.Truncate(time.Microsecond).Equal(retrieval2.UpdatedAt.Truncate(time.Microsecond)))
	})
}
