package id

import (
	"github.com/google/uuid"
)

func NextUUIDv7() uuid.UUID {
	return uuid.Must(uuid.NewV7())
}
