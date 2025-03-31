package route

import (
	"github.com/gin-gonic/gin"
)

func GenerateRoute(router *gin.Engine) {
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	// g := router.Group("/api")
	// {
	// 	g.GET("/status", func(c *gin.Context) {
	// 		c.JSON(200, gin.H{"message": "bad23"})
	// 	})
	// }

}
