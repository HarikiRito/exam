package graph

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"template/internal/features/jwt"
	"template/internal/features/user"
	"template/internal/graph/model"
	"template/internal/shared/utilities/id"

	"github.com/google/uuid"
)

func ExtractJwtTokenFromRequestContext(ctx context.Context) (string, error) {
	httpRequest, ok := ctx.Value(RequestKey).(*http.Request)
	if !ok {
		return "", errors.New("could not extract HTTP request from context")
	}

	authHeader := httpRequest.Header.Get("Authorization")
	if authHeader == "" {
		return "", errors.New("no authorization header found")
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	return token, nil
}

func GetUserIdFromJwtToken(token string) (string, error) {
	claims, err := jwt.ValidateAccessToken(token)
	if err != nil {
		return "", errors.New("Unauthorized")
	}

	return claims.UserID, nil
}

func GetUserIdFromRequestContext(ctx context.Context) (uuid.UUID, error) {
	token, err := ExtractJwtTokenFromRequestContext(ctx)
	if err != nil {
		return uuid.Nil, err
	}

	userID, err := GetUserIdFromJwtToken(token)
	if err != nil {
		return uuid.Nil, err
	}

	uuidValue, err := id.StringToUUID(userID)
	if err != nil {
		return uuid.Nil, errors.New("invalid user ID format")
	}

	return uuidValue, nil
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
		ID:    user.ID.String(),
		Email: user.Email,
	}, nil
}
