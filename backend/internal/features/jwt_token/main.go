package jwt_token

import (
	"context"
	"fmt"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/ent/jwttoken"
	"template/internal/features/jwt"
	"time"

	"github.com/google/uuid"
)

// SaveTokenPair stores a JWT token pair in the database
func SaveTokenPair(ctx context.Context, userID uuid.UUID, tokenPair *jwt.TokenPair) (*ent.JwtToken, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return nil, err
	}

	// Parse JWT to get expiration time
	claims, err := jwt.ValidateAccessToken(tokenPair.AccessToken)
	if err != nil {
		return nil, db.Rollback(tx, fmt.Errorf("failed to parse access token: %w", err))
	}

	expiresAt := claims.ExpiresAt.Time

	// Create new JWT token record
	jwtTokenRecord, err := tx.JwtToken.Create().
		SetUserID(userID).
		SetAccessToken(tokenPair.AccessToken).
		SetRefreshToken(tokenPair.RefreshToken).
		SetExpiresAt(expiresAt).
		Save(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return jwtTokenRecord, nil
}

// ValidateToken checks if the token exists in database and is not revoked
func ValidateToken(ctx context.Context, accessToken string) (*ent.JwtToken, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	// First validate the JWT token itself
	_, err = jwt.ValidateAccessToken(accessToken)
	if err != nil {
		return nil, fmt.Errorf("invalid JWT token: %w", err)
	}

	// Check if token exists in database and is not revoked
	jwtTokenRecord, err := client.JwtToken.Query().
		Where(
			jwttoken.AccessTokenEQ(accessToken),
			jwttoken.DeletedAtIsNil(),        // Not revoked
			jwttoken.ExpiresAtGT(time.Now()), // Not expired
		).
		Only(ctx)
	if err != nil {
		return nil, fmt.Errorf("token not found or revoked: %w", err)
	}

	return jwtTokenRecord, nil
}

// RevokeToken marks a token as revoked by setting deleted_at timestamp
func RevokeToken(ctx context.Context, accessToken string) error {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return err
	}

	// Find the token record
	jwtTokenRecord, err := tx.JwtToken.Query().
		Where(
			jwttoken.AccessTokenEQ(accessToken),
			jwttoken.DeletedAtIsNil(),
		).
		Only(ctx)
	if err != nil {
		return db.Rollback(tx, fmt.Errorf("token not found: %w", err))
	}

	err = tx.JwtToken.DeleteOneID(jwtTokenRecord.ID).Exec(ctx)
	if err != nil {
		return db.Rollback(tx, err)
	}

	return tx.Commit()
}

// RevokeTokenByRefreshToken marks a token as revoked using refresh token
func RevokeTokenByRefreshToken(ctx context.Context, refreshToken string) error {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return err
	}

	// Find the token record by refresh token
	jwtTokenRecord, err := tx.JwtToken.Query().
		Where(
			jwttoken.RefreshTokenEQ(refreshToken),
			jwttoken.DeletedAtIsNil(),
		).
		Only(ctx)
	if err != nil {
		return db.Rollback(tx, fmt.Errorf("token not found: %w", err))
	}

	err = tx.JwtToken.DeleteOneID(jwtTokenRecord.ID).Exec(ctx)
	if err != nil {
		return db.Rollback(tx, err)
	}

	return tx.Commit()
}

// RevokeAllUserTokens revokes all active tokens for a specific user
func RevokeAllUserTokens(ctx context.Context, userID uuid.UUID) error {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return err
	}

	// Update all active tokens for the user
	_, err = tx.JwtToken.Delete().
		Where(
			jwttoken.UserIDEQ(userID),
			jwttoken.DeletedAtIsNil(),
		).
		Exec(ctx)
	if err != nil {
		return db.Rollback(tx, err)
	}

	return tx.Commit()
}

// CleanupExpiredTokens removes expired tokens from the database (for maintenance)
func CleanupExpiredTokens(ctx context.Context) error {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return err
	}

	// Mark expired tokens as deleted
	_, err = tx.JwtToken.Delete().
		Where(
			jwttoken.ExpiresAtLT(time.Now()),
		).
		Exec(ctx)
	if err != nil {
		return db.Rollback(tx, err)
	}

	return tx.Commit()
}

// GetActiveTokensByUser retrieves all active tokens for a user
func GetActiveTokensByUser(ctx context.Context, userID uuid.UUID) ([]*ent.JwtToken, error) {
	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}

	tokens, err := client.JwtToken.Query().
		Where(
			jwttoken.UserIDEQ(userID),
			jwttoken.DeletedAtIsNil(),
			jwttoken.ExpiresAtGT(time.Now()),
		).
		All(ctx)
	if err != nil {
		return nil, err
	}

	return tokens, nil
}
