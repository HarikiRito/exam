package jwt

import (
	"encoding/base64"
	"encoding/json"
	"strings"
	"testing"
	"time"
)

func TestJWTService(t *testing.T) {
	// Create a test configuration with short expiry times for testing
	config := JwtConfig{
		AccessTokenSecret:  "test_access_secret",
		RefreshTokenSecret: "test_refresh_secret",
		AccessTokenExpiry:  time.Second * 2, // Short expiry for testing
		RefreshTokenExpiry: time.Second * 5, // Short expiry for testing
	}

	// Create a new JWT service
	service := JwtService(config)

	// Test user ID
	userID := "test-user-123"

	// Test token generation
	t.Run("GenerateTokenPair", func(t *testing.T) {
		tokenPair, err := service.GenerateTokenPair(userID, nil)
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
		tokenPair, err := service.GenerateTokenPair(userID, nil)
		if err != nil {
			t.Fatalf("Failed to generate token pair: %v", err)
		}

		// Validate access token
		accessClaims, err := service.ValidateAccessToken(tokenPair.AccessToken)
		if err != nil {
			t.Errorf("Failed to validate access token: %v", err)
		}

		if accessClaims.UserID != userID {
			t.Errorf("Access token has wrong user ID. Expected: %s, Got: %s", userID, accessClaims.UserID)
		}

		if accessClaims.TokenType != AccessToken {
			t.Errorf("Access token has wrong token type. Expected: %s, Got: %s", AccessToken, accessClaims.TokenType)
		}

		// Validate refresh token
		refreshClaims, err := service.ValidateRefreshToken(tokenPair.RefreshToken)
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
		tokenPair, err := service.GenerateTokenPair(userID, nil)
		if err != nil {
			t.Fatalf("Failed to generate token pair: %v", err)
		}

		// Refresh the tokens
		newTokenPair, err := service.RefreshTokens(tokenPair.RefreshToken)
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
		accessClaims, err := service.ValidateAccessToken(newTokenPair.AccessToken)
		if err != nil {
			t.Errorf("Failed to validate new access token: %v", err)
		}

		if accessClaims.UserID != userID {
			t.Errorf("New access token has wrong user ID. Expected: %s, Got: %s", userID, accessClaims.UserID)
		}
	})

	// Test token expiration
	t.Run("TokenExpiration", func(t *testing.T) {
		tokenPair, err := service.GenerateTokenPair(userID, nil)
		if err != nil {
			t.Fatalf("Failed to generate token pair: %v", err)
		}

		// Wait for the access token to expire
		time.Sleep(time.Second * 3)

		// Access token should be invalid now
		_, err = service.ValidateAccessToken(tokenPair.AccessToken)
		if err == nil {
			t.Error("Access token should have expired")
		}

		// Refresh token should still be valid
		_, err = service.ValidateRefreshToken(tokenPair.RefreshToken)
		if err != nil {
			t.Errorf("Refresh token should still be valid: %v", err)
		}

		// Wait for the refresh token to expire
		time.Sleep(time.Second * 3)

		// Refresh token should be invalid now
		_, err = service.ValidateRefreshToken(tokenPair.RefreshToken)
		if err == nil {
			t.Error("Refresh token should have expired")
		}
	})

	// Test payload
	t.Run("Payload", func(t *testing.T) {
		// Create a payload
		payload := map[string]interface{}{
			"role":        "admin",
			"permissions": []interface{}{"read", "write", "delete"},
			"orgId":       "org-123",
			"metadata": map[string]interface{}{
				"created": "2023-01-01",
				"source":  "test",
			},
		}

		// Generate tokens with payload
		tokenPair, err := service.GenerateTokenPair(userID, payload)
		if err != nil {
			t.Fatalf("Failed to generate token pair with payload: %v", err)
		}

		// Validate access token and check payload
		accessClaims, err := service.ValidateAccessToken(tokenPair.AccessToken)
		if err != nil {
			t.Errorf("Failed to validate access token: %v", err)
		}

		// Verify payload values
		if accessClaims.Payload["role"] != "admin" {
			t.Errorf("Payload has wrong role. Expected: %s, Got: %v", "admin", accessClaims.Payload["role"])
		}

		// Verify nested array
		permissions, ok := accessClaims.Payload["permissions"].([]interface{})
		if !ok {
			t.Errorf("Permissions is not an array: %v", accessClaims.Payload["permissions"])
		} else {
			if len(permissions) != 3 {
				t.Errorf("Permissions array has wrong length. Expected: 3, Got: %d", len(permissions))
			}
			if permissions[0] != "read" || permissions[1] != "write" || permissions[2] != "delete" {
				t.Errorf("Permissions array has wrong values: %v", permissions)
			}
		}

		// Verify nested map
		metadata, ok := accessClaims.Payload["metadata"].(map[string]interface{})
		if !ok {
			t.Errorf("Metadata is not a map: %v", accessClaims.Payload["metadata"])
		} else {
			if metadata["created"] != "2023-01-01" || metadata["source"] != "test" {
				t.Errorf("Metadata has wrong values: %v", metadata)
			}
		}

		// Test refresh token with payload
		refreshClaims, err := service.ValidateRefreshToken(tokenPair.RefreshToken)
		if err != nil {
			t.Errorf("Failed to validate refresh token: %v", err)
		}

		// Verify that refresh token also contains the payload
		if refreshClaims.Payload["role"] != "admin" {
			t.Errorf("Refresh token's payload has wrong role. Expected: %s, Got: %v", "admin", refreshClaims.Payload["role"])
		}
	})

	// Test token refresh with payload
	t.Run("RefreshTokensWithPayload", func(t *testing.T) {
		// Create a payload
		payload := map[string]interface{}{
			"role":     "manager",
			"tenantId": "tenant-456",
		}

		// Generate tokens with payload
		tokenPair, err := service.GenerateTokenPair(userID, payload)
		if err != nil {
			t.Fatalf("Failed to generate token pair with payload: %v", err)
		}

		// Refresh the tokens
		newTokenPair, err := service.RefreshTokens(tokenPair.RefreshToken)
		if err != nil {
			t.Fatalf("Failed to refresh tokens: %v", err)
		}

		// Validate the new tokens
		accessClaims, err := service.ValidateAccessToken(newTokenPair.AccessToken)
		if err != nil {
			t.Errorf("Failed to validate new access token: %v", err)
		}

		// Verify that payload is preserved after refresh
		if accessClaims.Payload["role"] != "manager" {
			t.Errorf("Refreshed token's payload has wrong role. Expected: %s, Got: %v", "manager", accessClaims.Payload["role"])
		}
		if accessClaims.Payload["tenantId"] != "tenant-456" {
			t.Errorf("Refreshed token's payload has wrong tenantId. Expected: %s, Got: %v", "tenant-456", accessClaims.Payload["tenantId"])
		}
	})

	// Test JWT tampering detection
	t.Run("TokenTampering", func(t *testing.T) {
		// Generate a valid token pair
		tokenPair, err := service.GenerateTokenPair(userID, nil)
		if err != nil {
			t.Fatalf("Failed to generate token pair: %v", err)
		}

		// Test 1: Modify header
		t.Run("HeaderTampering", func(t *testing.T) {
			// Split the token into its components
			tamperToken := tokenPair.AccessToken
			parts := strings.Split(tamperToken, ".")
			if len(parts) != 3 {
				t.Fatalf("Invalid token format: %s", tamperToken)
			}

			// Modify the header (first part)
			modifiedHeader := base64.URLEncoding.EncodeToString([]byte("{'alg':'none'}"))
			tamperToken = modifiedHeader + "." + parts[1] + "." + parts[2]

			// Attempt to validate the tampered token
			_, err := service.ValidateAccessToken(tamperToken)
			if err == nil {
				t.Error("Token validation should fail for header tampering")
			}
		})

		// Test 2: Modify payload
		t.Run("PayloadTampering", func(t *testing.T) {
			// Create a payload
			payload := map[string]interface{}{
				"role": "user",
			}

			// Generate tokens with payload
			tokenPair, err := service.GenerateTokenPair(userID, payload)
			if err != nil {
				t.Fatalf("Failed to generate token pair with payload: %v", err)
			}

			// Split the token into its components
			tamperToken := tokenPair.AccessToken
			parts := strings.Split(tamperToken, ".")
			if len(parts) != 3 {
				t.Fatalf("Invalid token format: %s", tamperToken)
			}

			// Decode the original payload
			payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
			if err != nil {
				t.Fatalf("Failed to decode payload: %v", err)
			}

			// Modify the payload to elevate privileges
			var tokenPayload map[string]interface{}
			err = json.Unmarshal(payloadBytes, &tokenPayload)
			if err != nil {
				t.Fatalf("Failed to unmarshal payload: %v", err)
			}

			// Change role in the payload
			payloadMap := tokenPayload["payload"].(map[string]interface{})
			payloadMap["role"] = "admin"

			// Re-encode the modified payload
			modifiedPayload, err := json.Marshal(tokenPayload)
			if err != nil {
				t.Fatalf("Failed to marshal modified payload: %v", err)
			}
			modifiedPayloadEncoded := base64.RawURLEncoding.EncodeToString(modifiedPayload)

			// Reconstruct the token with modified payload
			tamperToken = parts[0] + "." + modifiedPayloadEncoded + "." + parts[2]

			// Attempt to validate the tampered token
			_, err = service.ValidateAccessToken(tamperToken)
			if err == nil {
				t.Error("Token validation should fail for payload tampering")
			}
		})

		// Test 3: Modify signature
		t.Run("SignatureTampering", func(t *testing.T) {
			// Split the token into its components
			tamperToken := tokenPair.AccessToken
			parts := strings.Split(tamperToken, ".")
			if len(parts) != 3 {
				t.Fatalf("Invalid token format: %s", tamperToken)
			}

			// Create a completely different signature
			fakeSignature := base64.URLEncoding.EncodeToString([]byte("fake-signature"))
			tamperToken = parts[0] + "." + parts[1] + "." + fakeSignature

			// Attempt to validate the tampered token
			_, err := service.ValidateAccessToken(tamperToken)
			if err == nil {
				t.Error("Token validation should fail for signature tampering")
			}
		})
	})
}
