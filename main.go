package main

import (
	"fmt"
	"template/src"
	"template/src/shared/utilities/snowflake"

	"github.com/gin-gonic/gin"
)

func main() {
	snowflake.SetSnowflakeMachineId(1)
	router := gin.Default()

	fmt.Println("ID: ", snowflake.NextId())

	src.RunRoute(router)
	err := router.Run(":8082")
	if err != nil {
		return
	}
}
