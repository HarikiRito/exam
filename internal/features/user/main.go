package user

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"

	"github.com/google/uuid"
)

// GetUserByID fetches a user by their UUID string.
func GetUserByID(ctx context.Context, userID uuid.UUID) (*ent.User, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()

	return client.User.Get(ctx, userID)
}
