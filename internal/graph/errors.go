package graph

import (
	"context"
	"errors"
	"net/http"

	"github.com/99designs/gqlgen/graphql"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

// ErrorCode represents different types of errors
type ErrorCode string

const (
	ErrorCodeUnauthorized  ErrorCode = "UNAUTHORIZED"
	ErrorCodeForbidden     ErrorCode = "FORBIDDEN"
	ErrorCodeNotFound      ErrorCode = "NOT_FOUND"
	ErrorCodeBadRequest    ErrorCode = "BAD_REQUEST"
	ErrorCodeInternalError ErrorCode = "INTERNAL_ERROR"
)

// CustomError represents a custom error with HTTP status code and extensions
type CustomError struct {
	Message    string
	Code       ErrorCode
	StatusCode int
	Extensions map[string]interface{}
}

func (e *CustomError) Error() string {
	return e.Message
}

// NewUnauthorizedError creates a new unauthorized error
func NewUnauthorizedError(message string) *CustomError {
	if message == "" {
		message = "Unauthorized"
	}
	return &CustomError{
		Message:    message,
		Code:       ErrorCodeUnauthorized,
		StatusCode: http.StatusUnauthorized,
		Extensions: map[string]interface{}{
			"code":       string(ErrorCodeUnauthorized),
			"statusCode": http.StatusUnauthorized,
		},
	}
}

// NewForbiddenError creates a new forbidden error
func NewForbiddenError(message string) *CustomError {
	if message == "" {
		message = "Forbidden"
	}
	return &CustomError{
		Message:    message,
		Code:       ErrorCodeForbidden,
		StatusCode: http.StatusForbidden,
		Extensions: map[string]interface{}{
			"code":       string(ErrorCodeForbidden),
			"statusCode": http.StatusForbidden,
		},
	}
}

// NewNotFoundError creates a new not found error
func NewNotFoundError(message string) *CustomError {
	if message == "" {
		message = "Not Found"
	}
	return &CustomError{
		Message:    message,
		Code:       ErrorCodeNotFound,
		StatusCode: http.StatusNotFound,
		Extensions: map[string]interface{}{
			"code":       string(ErrorCodeNotFound),
			"statusCode": http.StatusNotFound,
		},
	}
}

// NewBadRequestError creates a new bad request error
func NewBadRequestError(message string) *CustomError {
	if message == "" {
		message = "Bad Request"
	}
	return &CustomError{
		Message:    message,
		Code:       ErrorCodeBadRequest,
		StatusCode: http.StatusBadRequest,
		Extensions: map[string]interface{}{
			"code":       string(ErrorCodeBadRequest),
			"statusCode": http.StatusBadRequest,
		},
	}
}

// CustomErrorPresenter handles custom errors and sets appropriate extensions
func CustomErrorPresenter(ctx context.Context, e error) *gqlerror.Error {
	// Start with the default error presenter
	err := graphql.DefaultErrorPresenter(ctx, e)

	// Check if it's our custom error
	var customErr *CustomError
	if errors.As(e, &customErr) {
		err.Message = customErr.Message
		err.Extensions = customErr.Extensions

		// Ensure extensions are set with status code and error code
		if err.Extensions == nil {
			err.Extensions = make(map[string]interface{})
		}
		err.Extensions["statusCode"] = customErr.StatusCode
		err.Extensions["code"] = string(customErr.Code)
	}

	return err
}
