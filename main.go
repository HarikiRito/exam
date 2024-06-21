package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"template/internal"
	"template/internal/shared/utilities/snowflake"
)

func main() {
	snowflake.SetSnowflakeMachineId(1)
	router := gin.Default()

	fmt.Println("ID: ", snowflake.NextId())

	internal.RunRoute(router)
	err := router.Run(":8082")
	if err != nil {
		return
	}
}
