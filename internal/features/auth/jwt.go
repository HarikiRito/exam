package auth

import (
	"errors"
	"fmt"
	"template/internal/shared/environment"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// TokenType defines the type of token
type TokenType string

const (
	// AccessToken is used for API access
	AccessToken TokenType = "access"
	// RefreshToken is used to get a new access token
	RefreshToken TokenType = "refresh"
)

// TokenPair contains both access and refresh tokens
type TokenPair struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

// Claims defines the structure for JWT claims
type Claims struct {
	UserID    string    `json:"userId"`
	TokenID   string    `json:"tokenId"`
	TokenType TokenType `json:"tokenType"`
	jwt.RegisteredClaims
}

// Config holds JWT configuration
type Config struct {
	AccessTokenSecret  string
	RefreshTokenSecret string
	AccessTokenExpiry  time.Duration
	RefreshTokenExpiry time.Duration
}

// DefaultConfig returns a default JWT configuration
func DefaultConfig() Config {
	return Config{
		AccessTokenSecret:  environment.JWT_SECRET,
		RefreshTokenSecret: environment.JWT_REFRESH_SECRET,
		AccessTokenExpiry:  time.Minute * 15,   // 15 minutes
		RefreshTokenExpiry: time.Hour * 24 * 7, // 7 days
	}
}

// Service provides JWT token operations
type Service struct {
	config Config
}

// JwtService creates a new JWT service with the provided configuration
func JwtService(config Config) *Service {
	return &Service{
		config: config,
	}
}

// JwtDefaultService creates a new JWT service with default configuration
func JwtDefaultService() *Service {
	return JwtService(DefaultConfig())
}

// GenerateTokenPair creates a new pair of access and refresh tokens
func (s *Service) GenerateTokenPair(userID string) (*TokenPair, error) {
	// Generate a unique token ID
	tokenID := uuid.New().String()

	// Generate access token
	accessToken, err := s.generateToken(userID, tokenID, AccessToken, s.config.AccessTokenSecret, s.config.AccessTokenExpiry)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	// Generate refresh token
	refreshToken, err := s.generateToken(userID, tokenID, RefreshToken, s.config.RefreshTokenSecret, s.config.RefreshTokenExpiry)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

// generateToken creates a new JWT token
func (s *Service) generateToken(userID, tokenID string, tokenType TokenType, secret string, expiry time.Duration) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID:    userID,
		TokenID:   tokenID,
		TokenType: tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(expiry)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ID:        tokenID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateAccessToken validates an access token and returns the claims
func (s *Service) ValidateAccessToken(tokenString string) (*Claims, error) {
	return s.validateToken(tokenString, s.config.AccessTokenSecret, AccessToken)
}

// ValidateRefreshToken validates a refresh token and returns the claims
func (s *Service) ValidateRefreshToken(tokenString string) (*Claims, error) {
	return s.validateToken(tokenString, s.config.RefreshTokenSecret, RefreshToken)
}

// validateToken validates a token and returns the claims
func (s *Service) validateToken(tokenString, secret string, tokenType TokenType) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	// Verify token type
	if claims.TokenType != tokenType {
		return nil, fmt.Errorf("invalid token type: expected %s, got %s", tokenType, claims.TokenType)
	}

	return claims, nil
}

// RefreshTokens generates a new token pair using a valid refresh token
func (s *Service) RefreshTokens(refreshToken string) (*TokenPair, error) {
	// Validate the refresh token
	claims, err := s.ValidateRefreshToken(refreshToken)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token: %w", err)
	}

	// Generate a new token pair
	return s.GenerateTokenPair(claims.UserID)
}

// GetUserIDFromToken extracts the user ID from a token
func (s *Service) GetUserIDFromToken(tokenString string) (string, error) {
	claims, err := s.ValidateAccessToken(tokenString)
	if err != nil {
		return "", err
	}
	return claims.UserID, nil
}
