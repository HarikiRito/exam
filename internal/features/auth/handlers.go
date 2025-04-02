package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// LoginRequest represents the login request body
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// RefreshRequest represents the refresh token request body
type RefreshRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

// Handler provides HTTP handlers for auth operations
type Handler struct {
	jwtService *Service
	// Add other dependencies like user service, etc.
}

// NewHandler creates a new auth handler
func NewHandler(jwtService *Service) *Handler {
	return &Handler{
		jwtService: jwtService,
	}
}

// RegisterRoutes registers the auth routes
func (h *Handler) RegisterRoutes(router *gin.Engine) {
	auth := router.Group("/auth")
	{
		auth.POST("/login", h.Login)
		auth.POST("/refresh", h.RefreshToken)

		// Protected routes
		protected := auth.Group("/")
		protected.Use(h.jwtService.AuthMiddleware())
		{
			protected.GET("/me", h.GetMe)
		}
	}
}

// Login handles user authentication and returns JWT tokens
func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Authenticate user against database
	// This is just an example, replace with actual authentication logic
	if req.Username != "test" || req.Password != "password" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	// For this example, we'll use a hardcoded user ID
	// In a real application, you would get this from your database
	userID := "user-123"

	// Generate token pair
	tokenPair, err := h.jwtService.GenerateTokenPair(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate tokens"})
		return
	}

	c.JSON(http.StatusOK, tokenPair)
}

// RefreshToken handles token refresh
func (h *Handler) RefreshToken(c *gin.Context) {
	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Refresh the tokens
	tokenPair, err := h.jwtService.RefreshTokens(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token"})
		return
	}

	c.JSON(http.StatusOK, tokenPair)
}

// GetMe returns the current user's information
func (h *Handler) GetMe(c *gin.Context) {
	// Get the user ID from the context (set by the middleware)
	userID, exists := GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// TODO: Get user details from database
	// This is just an example, replace with actual user retrieval logic
	user := gin.H{
		"id":       userID,
		"username": "test",
		"email":    "test@example.com",
	}

	c.JSON(http.StatusOK, user)
}
