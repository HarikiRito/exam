package utils

func Ptr[T any](s T) *T {
	return &s
}
