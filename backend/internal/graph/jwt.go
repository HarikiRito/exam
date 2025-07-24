package graph

import (
	"context"
	"net/http"
	"strings"
	"template/internal/features/jwt"
	"template/internal/features/jwt_token"
	"template/internal/features/permission"
	"template/internal/features/role"
	"template/internal/features/user"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

func ExtractJwtTokenFromRequestContext(ctx context.Context) (string, error) {
	httpRequest, ok := ctx.Value(RequestKey{}).(*http.Request)
	if !ok {
		return "", NewUnauthorizedError("could not extract HTTP request from context")
	}

	authHeader := httpRequest.Header.Get("Authorization")
	if authHeader == "" {
		return "", NewUnauthorizedError("no authorization header found")
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	return token, nil
}

func GetUserIdFromJwtToken(token string) (string, error) {
	claims, err := jwt.ValidateAccessToken(token)
	if err != nil {
		return "", NewUnauthorizedError("invalid or expired token")
	}

	return claims.UserID, nil
}

func GetUserIdFromRequestContext(ctx context.Context) (uuid.UUID, error) {
	token, err := ExtractJwtTokenFromRequestContext(ctx)
	if err != nil {
		return uuid.Nil, err
	}

	_, err = jwt.ValidateAccessToken(token)
	if err != nil {
		return uuid.Nil, NewUnauthorizedError("invalid or expired token")
	}

	// Validate the token against the database
	tokenRecord, err := jwt_token.ValidateToken(ctx, token)
	if err != nil {
		return uuid.Nil, NewUnauthorizedError("invalid or expired token")
	}

	return tokenRecord.UserID, nil
}

func GetUserFromRequestContext(ctx context.Context) (*model.User, error) {
	userID, err := GetUserIdFromRequestContext(ctx)
	if err != nil {
		return nil, err
	}

	user, err := user.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	return &model.User{
		ID:    user.ID,
		Email: user.Email,
	}, nil
}

func CheckUserPermissions(ctx context.Context, permissions []permission.Permission) (uuid.UUID, error) {
	userId, err := GetUserIdFromRequestContext(ctx)
	if err != nil {
		return uuid.Nil, err
	}
	err = role.CheckUserPermissions(ctx, userId, permissions)
	if err != nil {
		return uuid.Nil, NewUnauthorizedError("insufficient permissions")
	}
	return userId, nil
}
