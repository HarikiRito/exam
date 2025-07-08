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

func TestUpdateQuestionCollection(t *testing.T) {
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
	originalInput := model.CreateQuestionCollectionInput{
		Title:       "Original Collection Title",
		Description: utils.Ptr("Original collection description"),
	}
	testCollection, err := question_collection.CreateQuestionCollection(ctx, user1ID, originalInput)
	require.NoError(t, err)
	require.NotNil(t, testCollection)

	t.Run("UpdateCollection_Success_TitleOnly", func(t *testing.T) {
		updateInput := model.UpdateQuestionCollectionInput{
			Title: utils.Ptr("Updated Title Only"),
		}

		updatedCollection, err := question_collection.UpdateQuestionCollection(ctx, user1ID, testCollection.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedCollection)
		assert.Equal(t, *updateInput.Title, updatedCollection.Title)
		assert.Equal(t, testCollection.Description, updatedCollection.Description) // Should remain unchanged
		assert.Equal(t, testCollection.ID, updatedCollection.ID)
		assert.Equal(t, testCollection.CreatorID, updatedCollection.CreatorID)
	})

	t.Run("UpdateCollection_Success_DescriptionOnly", func(t *testing.T) {
		updateInput := model.UpdateQuestionCollectionInput{
			Description: utils.Ptr("Updated description only"),
		}

		updatedCollection, err := question_collection.UpdateQuestionCollection(ctx, user1ID, testCollection.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedCollection)
		assert.Equal(t, *updateInput.Description, *updatedCollection.Description)
		// Title should be from previous update
		assert.Equal(t, "Updated Title Only", updatedCollection.Title)
		assert.Equal(t, testCollection.ID, updatedCollection.ID)
		assert.Equal(t, testCollection.CreatorID, updatedCollection.CreatorID)
	})

	t.Run("UpdateCollection_Success_BothFields", func(t *testing.T) {
		updateInput := model.UpdateQuestionCollectionInput{
			Title:       utils.Ptr("Updated Both Title"),
			Description: utils.Ptr("Updated both description"),
		}

		updatedCollection, err := question_collection.UpdateQuestionCollection(ctx, user1ID, testCollection.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedCollection)
		assert.Equal(t, *updateInput.Title, updatedCollection.Title)
		assert.Equal(t, *updateInput.Description, *updatedCollection.Description)
		assert.Equal(t, testCollection.ID, updatedCollection.ID)
		assert.Equal(t, testCollection.CreatorID, updatedCollection.CreatorID)
	})

	t.Run("UpdateCollection_Success_EmptyUpdate", func(t *testing.T) {
		updateInput := model.UpdateQuestionCollectionInput{} // No fields provided

		updatedCollection, err := question_collection.UpdateQuestionCollection(ctx, user1ID, testCollection.ID, updateInput)
		assert.NoError(t, err) // Should succeed with no changes
		assert.NotNil(t, updatedCollection)
		// Values should remain from previous update
		assert.Equal(t, "Updated Both Title", updatedCollection.Title)
		assert.Equal(t, "Updated both description", *updatedCollection.Description)
	})

	t.Run("UpdateCollection_Success_NilDescription", func(t *testing.T) {
		updateInput := model.UpdateQuestionCollectionInput{
			Title:       utils.Ptr("Title with nil description"),
			Description: nil, // Explicitly nil
		}

		updatedCollection, err := question_collection.UpdateQuestionCollection(ctx, user1ID, testCollection.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedCollection)
		assert.Equal(t, *updateInput.Title, updatedCollection.Title)
		// Description should remain unchanged when nil is provided
		assert.Equal(t, "Updated both description", *updatedCollection.Description)
	})

	t.Run("UpdateCollection_Success_EmptyDescription", func(t *testing.T) {
		updateInput := model.UpdateQuestionCollectionInput{
			Description: utils.Ptr(""), // Empty string
		}

		updatedCollection, err := question_collection.UpdateQuestionCollection(ctx, user1ID, testCollection.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedCollection)
		assert.Equal(t, "", *updatedCollection.Description)
	})

	t.Run("UpdateCollection_NotFound", func(t *testing.T) {
		nonExistentID := uuid.New()
		updateInput := model.UpdateQuestionCollectionInput{
			Title: utils.Ptr("Should not work"),
		}

		updatedCollection, err := question_collection.UpdateQuestionCollection(ctx, user1ID, nonExistentID, updateInput)
		assert.Error(t, err)
		assert.Nil(t, updatedCollection)
		assert.Contains(t, err.Error(), "not found")
	})

	t.Run("UpdateCollection_UnauthorizedUser", func(t *testing.T) {
		updateInput := model.UpdateQuestionCollectionInput{
			Title: utils.Ptr("Unauthorized update"),
		}

		updatedCollection, err := question_collection.UpdateQuestionCollection(ctx, user2ID, testCollection.ID, updateInput)
		assert.Error(t, err)
		assert.Nil(t, updatedCollection)
		assert.Contains(t, err.Error(), "unauthorized")
	})

	t.Run("UpdateCollection_InvalidUUID", func(t *testing.T) {
		updateInput := model.UpdateQuestionCollectionInput{
			Title: utils.Ptr("Invalid UUID update"),
		}

		updatedCollection, err := question_collection.UpdateQuestionCollection(ctx, user1ID, uuid.Nil, updateInput)
		assert.Error(t, err)
		assert.Nil(t, updatedCollection)
	})

	t.Run("UpdateCollection_EmptyTitle", func(t *testing.T) {
		updateInput := model.UpdateQuestionCollectionInput{
			Title: utils.Ptr(""), // Empty title
		}

		updatedCollection, err := question_collection.UpdateQuestionCollection(ctx, user1ID, testCollection.ID, updateInput)
		assert.Error(t, err) // Should fail with empty title
		assert.Nil(t, updatedCollection)
	})

	t.Run("UpdateCollection_VeryLongTitle", func(t *testing.T) {
		longTitle := utils.Faker.Lorem().Text(500) // Very long title
		updateInput := model.UpdateQuestionCollectionInput{
			Title: utils.Ptr(longTitle),
		}

		updatedCollection, err := question_collection.UpdateQuestionCollection(ctx, user1ID, testCollection.ID, updateInput)
		// This may succeed or fail depending on database constraints
		if err == nil {
			assert.NotNil(t, updatedCollection)
			assert.Equal(t, longTitle, updatedCollection.Title)
		} else {
			assert.Nil(t, updatedCollection)
		}
	})

	t.Run("UpdateCollection_SpecialCharacters", func(t *testing.T) {
		updateInput := model.UpdateQuestionCollectionInput{
			Title:       utils.Ptr("Title with 特殊字符 & émojis 🚀"),
			Description: utils.Ptr("Description with special chars & émojis 🎯"),
		}

		updatedCollection, err := question_collection.UpdateQuestionCollection(ctx, user1ID, testCollection.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updatedCollection)
		assert.Equal(t, *updateInput.Title, updatedCollection.Title)
		assert.Equal(t, *updateInput.Description, *updatedCollection.Description)
	})

	t.Run("UpdateCollection_MultipleUpdates", func(t *testing.T) {
		// Create a new collection for this test to avoid conflicts
		newCollectionInput := model.CreateQuestionCollectionInput{
			Title:       "Collection for Multiple Updates",
			Description: utils.Ptr("Initial description"),
		}
		newCollection, err := question_collection.CreateQuestionCollection(ctx, user1ID, newCollectionInput)
		require.NoError(t, err)

		// First update
		update1 := model.UpdateQuestionCollectionInput{
			Title: utils.Ptr("First Update"),
		}
		updated1, err := question_collection.UpdateQuestionCollection(ctx, user1ID, newCollection.ID, update1)
		assert.NoError(t, err)
		assert.Equal(t, "First Update", updated1.Title)

		// Second update
		update2 := model.UpdateQuestionCollectionInput{
			Description: utils.Ptr("Second Update Description"),
		}
		updated2, err := question_collection.UpdateQuestionCollection(ctx, user1ID, newCollection.ID, update2)
		assert.NoError(t, err)
		assert.Equal(t, "First Update", updated2.Title) // Should preserve title from first update
		assert.Equal(t, "Second Update Description", *updated2.Description)

		// Third update - both fields
		update3 := model.UpdateQuestionCollectionInput{
			Title:       utils.Ptr("Final Title"),
			Description: utils.Ptr("Final Description"),
		}
		updated3, err := question_collection.UpdateQuestionCollection(ctx, user1ID, newCollection.ID, update3)
		assert.NoError(t, err)
		assert.Equal(t, "Final Title", updated3.Title)
		assert.Equal(t, "Final Description", *updated3.Description)

	})

	t.Run("UpdateCollection_CrossUserValidation", func(t *testing.T) {
		// User1 creates a collection
		user1CollectionInput := model.CreateQuestionCollectionInput{
			Title: "User1's Collection for Cross Validation",
		}
		user1Collection, err := question_collection.CreateQuestionCollection(ctx, user1ID, user1CollectionInput)
		require.NoError(t, err)

		// User2 creates a collection
		user2CollectionInput := model.CreateQuestionCollectionInput{
			Title: "User2's Collection for Cross Validation",
		}
		user2Collection, err := question_collection.CreateQuestionCollection(ctx, user2ID, user2CollectionInput)
		require.NoError(t, err)

		// User1 should be able to update their own collection
		update1 := model.UpdateQuestionCollectionInput{
			Title: utils.Ptr("User1 Updated Title"),
		}
		updated1, err := question_collection.UpdateQuestionCollection(ctx, user1ID, user1Collection.ID, update1)
		assert.NoError(t, err)
		assert.NotNil(t, updated1)

		// User2 should be able to update their own collection
		update2 := model.UpdateQuestionCollectionInput{
			Title: utils.Ptr("User2 Updated Title"),
		}
		updated2, err := question_collection.UpdateQuestionCollection(ctx, user2ID, user2Collection.ID, update2)
		assert.NoError(t, err)
		assert.NotNil(t, updated2)

		// User1 should NOT be able to update User2's collection
		unauthorizedUpdate := model.UpdateQuestionCollectionInput{
			Title: utils.Ptr("Unauthorized Update by User1"),
		}
		unauthorized1, err := question_collection.UpdateQuestionCollection(ctx, user1ID, user2Collection.ID, unauthorizedUpdate)
		assert.Error(t, err)
		assert.Nil(t, unauthorized1)

		// User2 should NOT be able to update User1's collection
		unauthorized2, err := question_collection.UpdateQuestionCollection(ctx, user2ID, user1Collection.ID, unauthorizedUpdate)
		assert.Error(t, err)
		assert.Nil(t, unauthorized2)
	})
}
