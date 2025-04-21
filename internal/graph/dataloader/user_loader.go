package dataloader

import (
	"context"
	"fmt"
	"template/internal/ent"
	"template/internal/features/user"
	"template/internal/graph/model"
)

func getUsers(ctx context.Context, userIDs []string) ([]*model.User, []error) {
	lu := NewLoaderByIds[model.User](userIDs)

	err := lu.parseUUIDs(userIDs)
	if err != nil {
		return lu.Items, lu.Errors
	}

	entUsers, err := user.GetUsersByIDs(ctx, lu.UUIDs)
	if err != nil {
		for _, i := range lu.IdMap {
			if lu.Errors[i] == nil {
				lu.Errors[i] = err
			}
		}
		return lu.Items, lu.Errors
	}

	userMap := make(map[string]*ent.User)
	for _, entUser := range entUsers {
		userMap[entUser.ID.String()] = entUser
	}

	for uid, i := range lu.IdMap {
		if entUser, ok := userMap[uid]; ok {
			lu.Items[i] = &model.User{
				ID:    entUser.ID.String(),
				Email: entUser.Email,
			}
			lu.Errors[i] = nil
		} else {
			lu.Items[i] = nil
			lu.Errors[i] = fmt.Errorf("user not found for id %s", uid)
		}
	}

	return lu.Items, lu.Errors
}

// GetUser returns a single user by ID using the dataloader.
func GetUser(ctx context.Context, userID string) (*model.User, error) {
	loaders := For(ctx)
	return loaders.UserLoader.Load(ctx, userID)
}
