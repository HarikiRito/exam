package graph

import (
	"context"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/gin-gonic/gin"
)

func GraphQLHandler() gin.HandlerFunc {
	h := handler.NewDefaultServer(NewExecutableSchema(Config{Resolvers: &Resolver{}}))
	return func(c *gin.Context) {
		ctx := context.WithValue(c.Request.Context(), RequestKey{}, c.Request)
		c.Request = c.Request.WithContext(ctx)
		h.ServeHTTP(c.Writer, c.Request.WithContext(ctx))
	}
}
