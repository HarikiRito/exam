package slice

func Map[T any, R any](slice []T, fn func(T) R) []R {
	result := make([]R, len(slice))
	for i, v := range slice {
		result[i] = fn(v)
	}
	return result
}

func Filter[T any](slice []T, fn func(T) bool) []T {
	result := make([]T, 0)
	for _, v := range slice {
		if fn(v) {
			result = append(result, v)
		}
	}
	return result
}

func Every[T any](slice []T, fn func(T) bool) bool {
	for _, v := range slice {
		if !fn(v) {
			return false
		}
	}
	return true
}

func Some[T any](slice []T, fn func(T) bool) bool {
	for _, v := range slice {
		if fn(v) {
			return true
		}
	}
	return false
}

func Find[T any](slice []T, fn func(T) bool) *T {
	for _, v := range slice {
		if fn(v) {
			return &v
		}
	}
	return nil
}

func Unique[T comparable](slice []T) []T {
	seen := make(map[T]bool)
	result := make([]T, 0)
	for _, v := range slice {
		if !seen[v] {
			seen[v] = true
			result = append(result, v)
		}
	}
	return result
}

func HasDuplicates[T comparable](slice []T) bool {
	seen := make(map[T]bool)
	for _, v := range slice {
		if seen[v] {
			return true
		}
		seen[v] = true
	}
	return false
}

// Convert a slice to a map with a function that returns the key and the value
func ToMap[T any, Key comparable, Value any](slice []T, fn func(T) (Key, Value)) map[Key]Value {
	result := make(map[Key]Value)
	for _, v := range slice {
		key, value := fn(v)
		result[key] = value
	}
	return result
}

func FlatMap[T any, R any](slice []T, fn func(T) []R) []R {
	result := make([]R, 0)
	for _, v := range slice {
		result = append(result, fn(v)...)
	}
	return result
}

func Reduce[T any, R any](slice []T, fn func(R, T) R, initialValue R) R {
	result := initialValue
	for _, v := range slice {
		result = fn(result, v)
	}
	return result
}
