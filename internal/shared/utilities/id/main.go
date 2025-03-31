package id

import (
	"crypto/rand"
	"time"

	"github.com/oklog/ulid/v2"
)

// NextId generates a new ULID
func NextId() string {
	// Use crypto/rand for secure entropy
	entropy := ulid.Monotonic(rand.Reader, 0)

	// Generate ULID with current timestamp
	id := ulid.MustNew(ulid.Timestamp(time.Now()), entropy)

	return id.String()
}
