package graph

import (
	"context"
	"fmt"
	"template/internal/graph/dataloader"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/gin-gonic/gin"
)

func GraphQLHandler() gin.HandlerFunc {
	h := handler.NewDefaultServer(NewExecutableSchema(Config{Resolvers: &Resolver{}}))

	h.SetRecoverFunc(func(ctx context.Context, err interface{}) error {
		return fmt.Errorf("internal server error: %v", err)
	})

	return func(c *gin.Context) {
		ctx := context.WithValue(c.Request.Context(), RequestKey{}, c.Request)
		ctx = dataloader.AddToContext(ctx)
		c.Request = c.Request.WithContext(ctx)
		h.ServeHTTP(c.Writer, c.Request)
	}
}
