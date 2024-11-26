package main

import (
	"log"
	"template/ent/db"
	"template/graph"
	"template/route"
	"template/shared/environment"
	"template/shared/utilities/snowflake"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
)

func main() {
	err := environment.LoadEnvironment()
	if err != nil {
		log.Fatal("Error loading environment variables: ", err)
	}

	snowflake.SetSnowflakeMachineId(1)
	db.InitDatabase()
	router := gin.Default()

	// Setup other routes
	route.GenerateRoute(router)

	router.GET("/graphql", playgroundHandler())

	router.POST("/graphql", graphQLHandler())

	err = router.Run(":" + environment.PORT)
	if err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}

func graphQLHandler() gin.HandlerFunc {
	h := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}}))

	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}

func playgroundHandler() gin.HandlerFunc {
	h := playground.Handler("GraphQL", "/query")

	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}
