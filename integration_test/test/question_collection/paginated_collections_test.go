package question_collection

import (
	"context"
	"template/integration_test/prepare"
	"template/integration_test/utils"
	"template/internal/features/question_collection"
	"template/internal/graph/model"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPaginatedQuestionCollections(t *testing.T) {
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

	// Create multiple collections for user1
	collectionTitles := []string{
		"Mathematics Collection",
		"Physics Collection",
		"Chemistry Collection",
		"Biology Collection",
		"Computer Science Collection",
		"History Collection",
		"Literature Collection",
		"Geography Collection",
		"Art Collection",
		"Music Collection",
		"Philosophy Collection",
		"Psychology Collection",
	}

	var user1Collections []string
	for _, title := range collectionTitles {
		collectionInput := model.CreateQuestionCollectionInput{
			Title:       title,
			Description: utils.Ptr("Description for " + title),
		}
		collection, err := question_collection.CreateQuestionCollection(ctx, user1ID, collectionInput)
		require.NoError(t, err)
		user1Collections = append(user1Collections, collection.ID.String())
	}

	// Create a few collections for user2
	user2CollectionTitles := []string{
		"User2 Collection 1",
		"User2 Collection 2",
		"User2 Collection 3",
	}

	for _, title := range user2CollectionTitles {
		collectionInput := model.CreateQuestionCollectionInput{
			Title:       title,
			Description: utils.Ptr("Description for " + title),
		}
		_, err := question_collection.CreateQuestionCollection(ctx, user2ID, collectionInput)
		require.NoError(t, err)
	}

	t.Run("PaginatedCollections_DefaultPagination", func(t *testing.T) {
		result, err := question_collection.PaginatedQuestionCollections(ctx, user1ID, nil)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, 1, result.CurrentPage)
		assert.Equal(t, len(collectionTitles), result.TotalItems)
		assert.True(t, result.TotalPages > 0)
		assert.Len(t, result.Items, min(10, len(collectionTitles))) // Default limit is 10

		// Should not have next page if total items <= 10
		if len(collectionTitles) <= 10 {
			assert.False(t, result.HasNextPage)
		} else {
			assert.True(t, result.HasNextPage)
		}
		assert.False(t, result.HasPrevPage)
	})

	t.Run("PaginatedCollections_CustomLimit", func(t *testing.T) {
		paginationInput := &model.PaginationInput{
			Page:  utils.Ptr(1),
			Limit: utils.Ptr(5),
		}

		result, err := question_collection.PaginatedQuestionCollections(ctx, user1ID, paginationInput)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, 1, result.CurrentPage)
		assert.Equal(t, len(collectionTitles), result.TotalItems)
		assert.Len(t, result.Items, 5)
		assert.True(t, result.HasNextPage) // Should have next page since we have 12 items with limit 5
		assert.False(t, result.HasPrevPage)
	})

	t.Run("PaginatedCollections_SecondPage", func(t *testing.T) {
		paginationInput := &model.PaginationInput{
			Page:  utils.Ptr(2),
			Limit: utils.Ptr(5),
		}

		result, err := question_collection.PaginatedQuestionCollections(ctx, user1ID, paginationInput)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, 2, result.CurrentPage)
		assert.Equal(t, len(collectionTitles), result.TotalItems)
		assert.Len(t, result.Items, 5)
		assert.True(t, result.HasNextPage) // Still should have next page
		assert.True(t, result.HasPrevPage)
	})

	t.Run("PaginatedCollections_LastPage", func(t *testing.T) {
		paginationInput := &model.PaginationInput{
			Page:  utils.Ptr(3),
			Limit: utils.Ptr(5),
		}

		result, err := question_collection.PaginatedQuestionCollections(ctx, user1ID, paginationInput)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, 3, result.CurrentPage)
		assert.Equal(t, len(collectionTitles), result.TotalItems)
		assert.Len(t, result.Items, 2) // Remaining items on last page
		assert.False(t, result.HasNextPage)
		assert.True(t, result.HasPrevPage)
	})

	t.Run("PaginatedCollections_PageBeyondTotal", func(t *testing.T) {
		paginationInput := &model.PaginationInput{
			Page:  utils.Ptr(10),
			Limit: utils.Ptr(5),
		}

		result, err := question_collection.PaginatedQuestionCollections(ctx, user1ID, paginationInput)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, 10, result.CurrentPage)
		assert.Equal(t, len(collectionTitles), result.TotalItems)
		assert.Len(t, result.Items, 0) // No items on page beyond total
		assert.False(t, result.HasNextPage)
		assert.True(t, result.HasPrevPage)
	})

	t.Run("PaginatedCollections_LargeLimit", func(t *testing.T) {
		paginationInput := &model.PaginationInput{
			Page:  utils.Ptr(1),
			Limit: utils.Ptr(100),
		}

		result, err := question_collection.PaginatedQuestionCollections(ctx, user1ID, paginationInput)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, 1, result.CurrentPage)
		assert.Equal(t, len(collectionTitles), result.TotalItems)
		assert.Len(t, result.Items, len(collectionTitles)) // All items should fit
		assert.False(t, result.HasNextPage)
		assert.False(t, result.HasPrevPage)
	})

	t.Run("PaginatedCollections_ZeroLimit", func(t *testing.T) {
		paginationInput := &model.PaginationInput{
			Page:  utils.Ptr(1),
			Limit: utils.Ptr(0),
		}

		result, err := question_collection.PaginatedQuestionCollections(ctx, user1ID, paginationInput)
		// This may succeed or fail depending on implementation
		// If it succeeds, it should handle gracefully
		if err == nil {
			assert.NotNil(t, result)
		}
	})

	t.Run("PaginatedCollections_NegativeValues", func(t *testing.T) {
		paginationInput := &model.PaginationInput{
			Page:  utils.Ptr(-1),
			Limit: utils.Ptr(-5),
		}

		result, err := question_collection.PaginatedQuestionCollections(ctx, user1ID, paginationInput)
		// Should handle negative values gracefully
		assert.NoError(t, err)
		assert.NotNil(t, result)
	})

	t.Run("PaginatedCollections_UserIsolation", func(t *testing.T) {
		// User1 should only see their own collections
		result1, err := question_collection.PaginatedQuestionCollections(ctx, user1ID, nil)
		assert.NoError(t, err)
		assert.NotNil(t, result1)
		assert.Equal(t, len(collectionTitles), result1.TotalItems)

		// User2 should only see their own collections
		result2, err := question_collection.PaginatedQuestionCollections(ctx, user2ID, nil)
		assert.NoError(t, err)
		assert.NotNil(t, result2)
		assert.Equal(t, len(user2CollectionTitles), result2.TotalItems)

		// Verify no overlap
		for _, item1 := range result1.Items {
			for _, item2 := range result2.Items {
				assert.NotEqual(t, item1.ID, item2.ID, "Collections should not overlap between users")
			}
		}
	})

	t.Run("PaginatedCollections_EmptyResult", func(t *testing.T) {
		// Create a new user with no collections
		emptyUserInput := model.RegisterInput{
			Email:    utils.Faker.Internet().Email(),
			Password: "testpassword123",
		}
		emptyUserEntity := prepare.CreateUser(t, emptyUserInput)
		emptyUserID := emptyUserEntity.ID

		result, err := question_collection.PaginatedQuestionCollections(ctx, emptyUserID, nil)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, 0, result.TotalItems)
		assert.Equal(t, 1, result.TotalPages)
		assert.Equal(t, 1, result.CurrentPage)
		assert.Len(t, result.Items, 0)
		assert.False(t, result.HasNextPage)
		assert.False(t, result.HasPrevPage)
	})

	t.Run("PaginatedCollections_AfterDeletion", func(t *testing.T) {
		// Get initial count
		initialResult, err := question_collection.PaginatedQuestionCollections(ctx, user1ID, nil)
		assert.NoError(t, err)
		initialCount := initialResult.TotalItems

		// Create and then delete a collection
		tempCollectionInput := model.CreateQuestionCollectionInput{
			Title: "Temporary Collection for Deletion Test",
		}
		tempCollection, err := question_collection.CreateQuestionCollection(ctx, user1ID, tempCollectionInput)
		require.NoError(t, err)

		// Verify count increased
		afterCreateResult, err := question_collection.PaginatedQuestionCollections(ctx, user1ID, nil)
		assert.NoError(t, err)
		assert.Equal(t, initialCount+1, afterCreateResult.TotalItems)

		// Delete the collection
		success, err := question_collection.DeleteQuestionCollection(ctx, user1ID, tempCollection.ID)
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify count is back to initial
		afterDeleteResult, err := question_collection.PaginatedQuestionCollections(ctx, user1ID, nil)
		assert.NoError(t, err)
		assert.Equal(t, initialCount, afterDeleteResult.TotalItems)
	})

	t.Run("PaginatedCollections_ConsistentOrdering", func(t *testing.T) {
		// Get first page multiple times to verify consistent ordering
		paginationInput := &model.PaginationInput{
			Page:  utils.Ptr(1),
			Limit: utils.Ptr(5),
		}

		result1, err := question_collection.PaginatedQuestionCollections(ctx, user1ID, paginationInput)
		assert.NoError(t, err)

		result2, err := question_collection.PaginatedQuestionCollections(ctx, user1ID, paginationInput)
		assert.NoError(t, err)

		// Results should be identical
		assert.Equal(t, len(result1.Items), len(result2.Items))
		for i := range result1.Items {
			assert.Equal(t, result1.Items[i].ID, result2.Items[i].ID)
			assert.Equal(t, result1.Items[i].Title, result2.Items[i].Title)
		}
	})

	t.Run("PaginatedCollections_PaginationCalculations", func(t *testing.T) {
		limit := 5
		paginationInput := &model.PaginationInput{
			Page:  utils.Ptr(1),
			Limit: utils.Ptr(limit),
		}

		result, err := question_collection.PaginatedQuestionCollections(ctx, user1ID, paginationInput)
		assert.NoError(t, err)
		assert.NotNil(t, result)

		// Verify pagination calculations
		expectedTotalPages := (len(collectionTitles) + limit - 1) / limit // Ceiling division
		assert.Equal(t, expectedTotalPages, result.TotalPages)

		// Verify has next/prev page logic
		if result.CurrentPage < result.TotalPages {
			assert.True(t, result.HasNextPage)
		} else {
			assert.False(t, result.HasNextPage)
		}

		if result.CurrentPage > 1 {
			assert.True(t, result.HasPrevPage)
		} else {
			assert.False(t, result.HasPrevPage)
		}
	})
}

// Helper function for min calculation
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
