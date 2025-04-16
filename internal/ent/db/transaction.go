package db

import (
	"context"
	"fmt"
	"template/internal/ent"
)

func OpenTransaction(ctx context.Context) (*ent.Tx, error) {
	client, err := OpenClient()
	if err != nil {
		return nil, err
	}

	return client.Tx(ctx)
}

func CloseTransaction(tx *ent.Tx) error {
	return tx.Client().Close()
}

// rollback calls to tx.Rollback and wraps the given error
// with the rollback error if occurred.
func Rollback(tx *ent.Tx, customError error) error {
	if err := tx.Rollback(); err != nil {
		return fmt.Errorf("%w: %v", customError, err)
	}
	return customError
}
