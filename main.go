package main

import (
	"fmt"
	"log"
	"template/ent/db"
	"template/route"
	"template/shared/environment"
	"template/shared/utilities/snowflake"

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

	fmt.Println("ID: ", snowflake.NextId())

	route.GenerateRoute(router)
	err = router.Run(":" + environment.PORT)
	if err != nil {
		return
	}
}
