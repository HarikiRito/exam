package dataloader

import (
	"context"
	"time"

	"template/internal/graph/model"

	"github.com/vikstrous/dataloadgen"
)

type ctxKey string

const loadersKey = ctxKey("dataloaders")

// Loaders wraps the dataloader instances.
type Loaders struct {
	UserLoader *dataloadgen.Loader[string, *model.User]
}

// NewLoaders instantiates and returns a new Loaders struct with a UserLoader.
func NewLoaders() *Loaders {
	return &Loaders{
		UserLoader: dataloadgen.NewLoader(getUsers, dataloadgen.WithWait(time.Millisecond)),
	}
}

// For retrieves the Loaders instance from the context.
func For(ctx context.Context) *Loaders {
	return ctx.Value(loadersKey).(*Loaders)
}

// AddToContext injects a new Loaders instance into the provided context and returns the new context.
func AddToContext(ctx context.Context) context.Context {
	return context.WithValue(ctx, loadersKey, NewLoaders())
}
