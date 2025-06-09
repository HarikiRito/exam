package question_collection

import (
	"context"
	"template/integration_test/prepare"
	"template/integration_test/utils"
	"template/internal/features/question_collection"
	"template/internal/graph/model"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCreateQuestionCollection(t *testing.T) {
	prepare.SetupTestDb(t)

	ctx := context.Background()

	// Create test user
	userInput := model.RegisterInput{
		Email:    utils.Faker.Internet().Email(),
		Password: "testpassword123",
	}
	userEntity := prepare.CreateUser(t, userInput)
	userID := userEntity.ID

	t.Run("CreateCollection_Success_WithDescription", func(t *testing.T) {
		input := model.CreateQuestionCollectionInput{
			Title:       "Sample Question Collection",
			Description: utils.Ptr("This is a sample collection for testing purposes"),
		}

		collection, err := question_collection.CreateQuestionCollection(ctx, userID, input)
		assert.NoError(t, err)
		assert.NotNil(t, collection)
		assert.Equal(t, input.Title, collection.Title)
		assert.Equal(t, input.Description, collection.Description)
		assert.Equal(t, userID, collection.CreatorID)
		assert.NotNil(t, collection.ID)
		assert.NotZero(t, collection.CreatedAt)
		assert.NotZero(t, collection.UpdatedAt)
	})

	t.Run("CreateCollection_Success_WithoutDescription", func(t *testing.T) {
		input := model.CreateQuestionCollectionInput{
			Title: "Collection Without Description",
		}

		collection, err := question_collection.CreateQuestionCollection(ctx, userID, input)
		assert.NoError(t, err)
		assert.NotNil(t, collection)
		assert.Equal(t, input.Title, collection.Title)
		assert.Nil(t, collection.Description)
		assert.Equal(t, userID, collection.CreatorID)
		assert.NotNil(t, collection.ID)
	})

	t.Run("CreateCollection_EmptyTitle", func(t *testing.T) {
		input := model.CreateQuestionCollectionInput{
			Title:       "",
			Description: utils.Ptr("Collection with empty title"),
		}

		collection, err := question_collection.CreateQuestionCollection(ctx, userID, input)
		assert.Error(t, err)
		assert.Nil(t, collection)
	})

	t.Run("CreateCollection_VeryLongTitle", func(t *testing.T) {
		longTitle := utils.Faker.Lorem().Text(500) // Very long title
		input := model.CreateQuestionCollectionInput{
			Title:       longTitle,
			Description: utils.Ptr("Collection with very long title"),
		}

		collection, err := question_collection.CreateQuestionCollection(ctx, userID, input)
		// This may succeed or fail depending on database constraints
		// Testing the behavior regardless
		if err == nil {
			assert.NotNil(t, collection)
			assert.Equal(t, longTitle, collection.Title)
		} else {
			assert.Nil(t, collection)
		}
	})

	t.Run("CreateCollection_SpecialCharactersInTitle", func(t *testing.T) {
		input := model.CreateQuestionCollectionInput{
			Title:       "Collection with 特殊字符 & émojis 🚀",
			Description: utils.Ptr("Testing special characters & émojis 🎯"),
		}

		collection, err := question_collection.CreateQuestionCollection(ctx, userID, input)
		assert.NoError(t, err)
		assert.NotNil(t, collection)
		assert.Equal(t, input.Title, collection.Title)
		assert.Equal(t, input.Description, collection.Description)
	})

	t.Run("CreateCollection_DuplicateTitle", func(t *testing.T) {
		// Create first collection
		input1 := model.CreateQuestionCollectionInput{
			Title:       "Duplicate Title Test",
			Description: utils.Ptr("First collection"),
		}
		collection1, err := question_collection.CreateQuestionCollection(ctx, userID, input1)
		assert.NoError(t, err)
		assert.NotNil(t, collection1)

		// Try to create second collection with same title
		input2 := model.CreateQuestionCollectionInput{
			Title:       "Duplicate Title Test",
			Description: utils.Ptr("Second collection"),
		}
		collection2, err := question_collection.CreateQuestionCollection(ctx, userID, input2)
		// Should succeed as titles don't need to be unique per user
		assert.NoError(t, err)
		assert.NotNil(t, collection2)
		assert.NotEqual(t, collection1.ID, collection2.ID)
	})

	t.Run("CreateCollection_MultipleByDifferentUsers", func(t *testing.T) {
		// Create another user
		anotherUserInput := model.RegisterInput{
			Email:    utils.Faker.Internet().Email(),
			Password: "testpassword123",
		}
		anotherUserEntity := prepare.CreateUser(t, anotherUserInput)
		anotherUserID := anotherUserEntity.ID

		// Both users create collections with same title
		input := model.CreateQuestionCollectionInput{
			Title:       "Same Title Different Users",
			Description: utils.Ptr("Collection by different users"),
		}

		collection1, err := question_collection.CreateQuestionCollection(ctx, userID, input)
		assert.NoError(t, err)
		assert.NotNil(t, collection1)

		collection2, err := question_collection.CreateQuestionCollection(ctx, anotherUserID, input)
		assert.NoError(t, err)
		assert.NotNil(t, collection2)

		assert.NotEqual(t, collection1.ID, collection2.ID)
		assert.Equal(t, userID, collection1.CreatorID)
		assert.Equal(t, anotherUserID, collection2.CreatorID)
	})

	t.Run("CreateCollection_NilDescription", func(t *testing.T) {
		input := model.CreateQuestionCollectionInput{
			Title:       "Collection with nil description",
			Description: nil,
		}

		collection, err := question_collection.CreateQuestionCollection(ctx, userID, input)
		assert.NoError(t, err)
		assert.NotNil(t, collection)
		assert.Equal(t, input.Title, collection.Title)
		assert.Nil(t, collection.Description)
	})

	t.Run("CreateCollection_EmptyDescription", func(t *testing.T) {
		input := model.CreateQuestionCollectionInput{
			Title:       "Collection with empty description",
			Description: utils.Ptr(""),
		}

		collection, err := question_collection.CreateQuestionCollection(ctx, userID, input)
		assert.NoError(t, err)
		assert.NotNil(t, collection)
		assert.Equal(t, input.Title, collection.Title)
		assert.Equal(t, "", *collection.Description)
	})

	t.Run("CreateCollection_VeryLongDescription", func(t *testing.T) {
		longDescription := utils.Faker.Lorem().Text(1000) // Very long description
		input := model.CreateQuestionCollectionInput{
			Title:       "Collection with long description",
			Description: utils.Ptr(longDescription),
		}

		collection, err := question_collection.CreateQuestionCollection(ctx, userID, input)
		// This may succeed or fail depending on database constraints
		if err == nil {
			assert.NotNil(t, collection)
			assert.Equal(t, longDescription, *collection.Description)
		} else {
			assert.Nil(t, collection)
		}
	})
}
