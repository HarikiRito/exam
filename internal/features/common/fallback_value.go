package common

func FallbackValue[T any](value *T, fallback T) T {
	if value == nil {
		return fallback
	}
	return *value
}
