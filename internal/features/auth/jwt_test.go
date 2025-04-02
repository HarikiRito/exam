package auth

import (
	"fmt"
	"testing"
	"time"
)

func TestJWTService(t *testing.T) {
	// Create a test configuration with short expiry times for testing
	config := Config{
		AccessTokenSecret:  "test_access_secret",
		RefreshTokenSecret: "test_refresh_secret",
		AccessTokenExpiry:  time.Second * 2, // Short expiry for testing
		RefreshTokenExpiry: time.Second * 5, // Short expiry for testing
	}

	// Create a new JWT jwtService
	jwtService := JwtService(config)

	// Test user ID
	userID := "test-user-123"

	// Test token generation
	t.Run("GenerateTokenPair", func(t *testing.T) {
		tokenPair, err := jwtService.GenerateTokenPair(userID)
		if err != nil {
			t.Fatalf("Failed to generate token pair: %v", err)
		}

		if tokenPair.AccessToken == "" {
			t.Error("Access token is empty")
		}

		if tokenPair.RefreshToken == "" {
			t.Error("Refresh token is empty")
		}
	})

	// Test token validation
	t.Run("ValidateTokens", func(t *testing.T) {
		tokenPair, err := jwtService.GenerateTokenPair(userID)
		if err != nil {
			t.Fatalf("Failed to generate token pair: %v", err)
		}

		// Validate access token
		accessClaims, err := jwtService.ValidateAccessToken(tokenPair.AccessToken)
		if err != nil {
			t.Errorf("Failed to validate access token: %v", err)
		}

		fmt.Println("accessClaims", accessClaims.UserID, accessClaims.TokenID)

		if accessClaims.UserID != userID {
			t.Errorf("Access token has wrong user ID. Expected: %s, Got: %s", userID, accessClaims.UserID)
		}

		if accessClaims.TokenType != AccessToken {
			t.Errorf("Access token has wrong token type. Expected: %s, Got: %s", AccessToken, accessClaims.TokenType)
		}

		// Validate refresh token
		refreshClaims, err := jwtService.ValidateRefreshToken(tokenPair.RefreshToken)

		fmt.Println("refreshClaims", refreshClaims.UserID)
		if err != nil {
			t.Errorf("Failed to validate refresh token: %v", err)
		}

		if refreshClaims.UserID != userID {
			t.Errorf("Refresh token has wrong user ID. Expected: %s, Got: %s", userID, refreshClaims.UserID)
		}

		if refreshClaims.TokenType != RefreshToken {
			t.Errorf("Refresh token has wrong token type. Expected: %s, Got: %s", RefreshToken, refreshClaims.TokenType)
		}

		// Both tokens should have the same token ID
		if accessClaims.TokenID != refreshClaims.TokenID {
			t.Errorf("Token IDs don't match. Access: %s, Refresh: %s", accessClaims.TokenID, refreshClaims.TokenID)
		}
	})

	// Test token refresh
	t.Run("RefreshTokens", func(t *testing.T) {
		tokenPair, err := jwtService.GenerateTokenPair(userID)
		if err != nil {
			t.Fatalf("Failed to generate token pair: %v", err)
		}

		// Refresh the tokens
		newTokenPair, err := jwtService.RefreshTokens(tokenPair.RefreshToken)
		if err != nil {
			t.Fatalf("Failed to refresh tokens: %v", err)
		}

		if newTokenPair.AccessToken == "" {
			t.Error("New access token is empty")
		}

		if newTokenPair.RefreshToken == "" {
			t.Error("New refresh token is empty")
		}

		// The new tokens should be different from the old ones
		if newTokenPair.AccessToken == tokenPair.AccessToken {
			t.Error("New access token is the same as the old one")
		}

		if newTokenPair.RefreshToken == tokenPair.RefreshToken {
			t.Error("New refresh token is the same as the old one")
		}

		// Validate the new tokens
		accessClaims, err := jwtService.ValidateAccessToken(newTokenPair.AccessToken)
		if err != nil {
			t.Errorf("Failed to validate new access token: %v", err)
		}

		if accessClaims.UserID != userID {
			t.Errorf("New access token has wrong user ID. Expected: %s, Got: %s", userID, accessClaims.UserID)
		}
	})

	// Test token expiration
	t.Run("TokenExpiration", func(t *testing.T) {
		tokenPair, err := jwtService.GenerateTokenPair(userID)
		if err != nil {
			t.Fatalf("Failed to generate token pair: %v", err)
		}

		// Wait for the access token to expire
		time.Sleep(time.Second * 3)

		// Access token should be invalid now
		_, err = jwtService.ValidateAccessToken(tokenPair.AccessToken)
		if err == nil {
			t.Error("Access token should have expired")
		}

		// Refresh token should still be valid
		_, err = jwtService.ValidateRefreshToken(tokenPair.RefreshToken)
		if err != nil {
			t.Errorf("Refresh token should still be valid: %v", err)
		}

		// Wait for the refresh token to expire
		time.Sleep(time.Second * 3)

		// Refresh token should be invalid now
		_, err = jwtService.ValidateRefreshToken(tokenPair.RefreshToken)
		if err == nil {
			t.Error("Refresh token should have expired")
		}
	})
}
