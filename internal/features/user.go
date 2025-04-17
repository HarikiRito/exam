package features

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"

	"github.com/google/uuid"
)

// GetUserByID fetches a user by their UUID string.
func GetUserByID(ctx context.Context, userID string) (*ent.User, error) {
	uuidVal, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}

	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	return client.User.Get(ctx, uuidVal)
}
