package main

import (
	"log"
	"template/internal/ent/db"
	"template/internal/graph"
	"template/internal/route"
	"template/internal/shared/environment"

	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
)

func main() {
	err := environment.LoadEnvironment()
	if err != nil {
		log.Fatal("Error loading environment variables: ", err)
	}

	db.InitDatabase()
	router := gin.Default()

	// Setup other routes
	route.GenerateRoute(router)

	router.GET("/graphql", playgroundHandler())

	router.POST("/graphql", graph.GraphQLHandler())

	err = router.Run(":" + environment.PORT)
	if err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}

func playgroundHandler() gin.HandlerFunc {
	h := playground.ApolloSandboxHandler("GraphQL", "/graphql")
	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}
