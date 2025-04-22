package dataloader

import (
	"context"
	"template/internal/ent"
	"template/internal/features/user"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

func getUsers(ctx context.Context, userIDs []uuid.UUID) ([]*model.User, []error) {
	lu := NewLoaderByIds[ent.User, model.User](userIDs)

	lu.LoadItems(ctx, user.GetUsersByIDs, func(entUser *ent.User) string {
		return entUser.ID.String()
	}, func(entUser *ent.User) (*model.User, error) {
		return &model.User{
			ID:    entUser.ID,
			Email: entUser.Email,
		}, nil
	})

	return lu.Items, lu.Errors
}

// GetUser returns a single user by ID using the dataloader.
func GetUser(ctx context.Context, userID uuid.UUID) (*model.User, error) {
	loaders := For(ctx)
	return loaders.UserLoader.Load(ctx, userID)
}
