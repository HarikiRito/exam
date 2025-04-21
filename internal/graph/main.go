package graph

import (
	"context"
	"template/internal/graph/dataloader"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/gin-gonic/gin"
)

func GraphQLHandler() gin.HandlerFunc {
	h := handler.NewDefaultServer(NewExecutableSchema(Config{Resolvers: &Resolver{}}))
	return func(c *gin.Context) {
		ctx := context.WithValue(c.Request.Context(), RequestKey{}, c.Request)
		ctx = dataloader.AddToContext(ctx)
		c.Request = c.Request.WithContext(ctx)
		h.ServeHTTP(c.Writer, c.Request)
	}
}
