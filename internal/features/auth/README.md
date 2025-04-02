# JWT Authentication

This package provides JWT (JSON Web Token) authentication functionality for the application.

## Features

- Access and refresh token generation
- Token validation and verification
- Token refresh mechanism
- Middleware for protecting routes
- Helper functions for extracting user information

## Configuration

JWT configuration is loaded from environment variables:

- `JWT_ACCESS_SECRET`: Secret key for signing access tokens
- `JWT_REFRESH_SECRET`: Secret key for signing refresh tokens

Default token expiry times:
- Access tokens: 15 minutes
- Refresh tokens: 7 days

## Usage

### Initialize the JWT Service

```go
// Use default configuration (from environment variables)
jwtService := auth.NewDefaultService()

// Or with custom configuration
config := auth.Config{
    AccessTokenSecret:  "your_access_secret",
    RefreshTokenSecret: "your_refresh_secret",
    AccessTokenExpiry:  time.Minute * 30,  // 30 minutes
    RefreshTokenExpiry: time.Hour * 24 * 14, // 14 days
}
jwtService := auth.NewService(config)
```

### Generate Token Pair

```go
tokenPair, err := jwtService.GenerateTokenPair(userID)
if err != nil {
    // Handle error
}

// Use tokenPair.AccessToken and tokenPair.RefreshToken
```

### Validate Tokens

```go
// Validate access token
claims, err := jwtService.ValidateAccessToken(accessToken)
if err != nil {
    // Token is invalid or expired
}

// Get user ID from claims
userID := claims.UserID

// Validate refresh token
refreshClaims, err := jwtService.ValidateRefreshToken(refreshToken)
if err != nil {
    // Refresh token is invalid or expired
}
```

### Refresh Tokens

```go
// Generate new token pair using refresh token
newTokenPair, err := jwtService.RefreshTokens(refreshToken)
if err != nil {
    // Refresh token is invalid or expired
}

// Use newTokenPair.AccessToken and newTokenPair.RefreshToken
```

### Protect Routes with Middleware

```go
// Create a new Gin router
router := gin.Default()

// Create auth handler
authHandler := auth.NewHandler(jwtService)

// Register auth routes
authHandler.RegisterRoutes(router)

// Or manually protect routes
protected := router.Group("/api")
protected.Use(jwtService.AuthMiddleware())
{
    protected.GET("/profile", profileHandler)
    // Other protected routes
}
```

### Extract User ID in Protected Routes

```go
func profileHandler(c *gin.Context) {
    userID, exists := auth.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }
    
    // Use userID to fetch user data
    // ...
}
```

## Security Considerations

- Always use strong, unique secrets for access and refresh tokens
- Store secrets securely (environment variables, secret management service)
- Use HTTPS to prevent token interception
- Implement token revocation if needed (requires additional storage)
- Consider using shorter expiry times for sensitive operations 