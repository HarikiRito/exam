package graph

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"template/internal/features/jwt"
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


func GetUserIdFromRequestContext(ctx context.Context) (string, error) {
	token, err := ExtractJwtTokenFromRequestContext(ctx)
	if err != nil {
		return "", err
	}

	return GetUserIdFromJwtToken(token)
}
