package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"hariki/internal"
	"hariki/internal/shared/utilities/snowflake"
)

func main() {
	snowflake.SetSnowflakeMachineId(1)
	router := gin.Default()

	fmt.Println("ID 1: ", snowflake.NextId())

	internal.RunRoute(router)
	err := router.Run(":8082")
	if err != nil {
		return
	}
}
