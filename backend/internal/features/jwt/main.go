package jwt

import (
	"template/internal/shared/environment"
	jwtPkg "template/pkg/jwt"
	"time"
)

type TokenPair = jwtPkg.TokenPair

// JwtService interface defines the contract for JWT-related operations
type JwtService interface {
	GenerateTokenPair(userID string, payload map[string]interface{}) (*TokenPair, error)
	ValidateAccessToken(token string) (*jwtPkg.Claims, error)
	ValidateRefreshToken(token string) (*jwtPkg.Claims, error)
	RefreshTokenPair(refreshToken string) (*jwtPkg.TokenPair, error)
}

var jwtService = jwtPkg.Create(jwtPkg.JwtConfig{
	AccessTokenSecret:  environment.JWT_SECRET,
	RefreshTokenSecret: environment.JWT_REFRESH_SECRET,
	AccessTokenExpiry:  time.Hour * 24 * 30, //TODO Make sure this is short lived
	RefreshTokenExpiry: time.Hour * 24 * 180,
})

// GenerateTokenPair creates a new pair of access and refresh tokens
func GenerateTokenPair(userID string, payload map[string]interface{}) (*jwtPkg.TokenPair, error) {
	return jwtService.GenerateTokenPair(userID, payload)
}

// ValidateAccessToken checks the validity of an access token
func ValidateAccessToken(token string) (*jwtPkg.Claims, error) {
	return jwtService.ValidateAccessToken(token)
}

// ValidateRefreshToken checks the validity of a refresh token
func ValidateRefreshToken(token string) (*jwtPkg.Claims, error) {
	return jwtService.ValidateRefreshToken(token)
}

// RefreshTokenPair generates a new token pair using a valid refresh token
func RefreshTokenPair(refreshToken string) (*TokenPair, error) {
	// Validate the refresh token first
	claims, err := jwtService.ValidateRefreshToken(refreshToken)
	if err != nil {
		return nil, err
	}

	// Generate a new token pair using the user ID from the refresh token claims
	return GenerateTokenPair(claims.UserID, claims.Payload)
}
