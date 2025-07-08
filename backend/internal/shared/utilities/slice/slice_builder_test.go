package slice

import (
	"strconv"
	"testing"
)

func TestNewSliceBuilder(t *testing.T) {
	builder := NewSliceBuilder[int]()
	if builder == nil {
		t.Fatal("NewSliceBuilder should return a non-nil SliceBuilder")
	}
	if len(builder.slice) != 0 {
		t.Errorf("Expected empty slice, got length %d", len(builder.slice))
	}
}

func TestSliceBuilder_Map(t *testing.T) {
	tests := []struct {
		name     string
		input    []int
		mapFn    func(int) int
		expected []int
	}{
		{
			name:     "empty slice",
			input:    []int{},
			mapFn:    func(x int) int { return x * 2 },
			expected: []int{},
		},
		{
			name:     "multiply by 2",
			input:    []int{1, 2, 3, 4},
			mapFn:    func(x int) int { return x * 2 },
			expected: []int{2, 4, 6, 8},
		},
		{
			name:     "add 10",
			input:    []int{1, 2, 3},
			mapFn:    func(x int) int { return x + 10 },
			expected: []int{11, 12, 13},
		},
		{
			name:     "identity function",
			input:    []int{5, 10, 15},
			mapFn:    func(x int) int { return x },
			expected: []int{5, 10, 15},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			builder := &SliceBuilder[int]{slice: tt.input}
			result := builder.Map(tt.mapFn)

			// Check that it returns the builder for chaining
			if result != builder {
				t.Error("Map should return the same builder instance for chaining")
			}

			// Check the result
			if !slicesEqual(builder.slice, tt.expected) {
				t.Errorf("Expected %v, got %v", tt.expected, builder.slice)
			}
		})
	}
}

func TestSliceBuilder_Filter(t *testing.T) {
	tests := []struct {
		name     string
		input    []int
		filterFn func(int) bool
		expected []int
	}{
		{
			name:     "empty slice",
			input:    []int{},
			filterFn: func(x int) bool { return x > 0 },
			expected: []int{},
		},
		{
			name:     "filter even numbers",
			input:    []int{1, 2, 3, 4, 5, 6},
			filterFn: func(x int) bool { return x%2 == 0 },
			expected: []int{2, 4, 6},
		},
		{
			name:     "filter greater than 3",
			input:    []int{1, 2, 3, 4, 5},
			filterFn: func(x int) bool { return x > 3 },
			expected: []int{4, 5},
		},
		{
			name:     "filter none",
			input:    []int{1, 2, 3},
			filterFn: func(x int) bool { return x > 10 },
			expected: []int{},
		},
		{
			name:     "filter all",
			input:    []int{1, 2, 3},
			filterFn: func(x int) bool { return true },
			expected: []int{1, 2, 3},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			builder := &SliceBuilder[int]{slice: tt.input}
			result := builder.Filter(tt.filterFn)

			// Check that it returns the builder for chaining
			if result != builder {
				t.Error("Filter should return the same builder instance for chaining")
			}

			// Check the result
			if !slicesEqual(builder.slice, tt.expected) {
				t.Errorf("Expected %v, got %v", tt.expected, builder.slice)
			}
		})
	}
}

func TestSliceBuilder_FlatMap(t *testing.T) {
	tests := []struct {
		name      string
		input     []int
		flatMapFn func(int) []int
		expected  []int
	}{
		{
			name:      "empty slice",
			input:     []int{},
			flatMapFn: func(x int) []int { return []int{x, x * 2} },
			expected:  []int{},
		},
		{
			name:      "duplicate each element",
			input:     []int{1, 2, 3},
			flatMapFn: func(x int) []int { return []int{x, x} },
			expected:  []int{1, 1, 2, 2, 3, 3},
		},
		{
			name:  "range from 0 to n",
			input: []int{2, 3},
			flatMapFn: func(x int) []int {
				result := make([]int, x)
				for i := 0; i < x; i++ {
					result[i] = i
				}
				return result
			},
			expected: []int{0, 1, 0, 1, 2},
		},
		{
			name:      "empty result",
			input:     []int{1, 2, 3},
			flatMapFn: func(x int) []int { return []int{} },
			expected:  []int{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			builder := &SliceBuilder[int]{slice: tt.input}
			result := builder.FlatMap(tt.flatMapFn)

			// Check that it returns the builder for chaining
			if result != builder {
				t.Error("FlatMap should return the same builder instance for chaining")
			}

			// Check the result
			if !slicesEqual(builder.slice, tt.expected) {
				t.Errorf("Expected %v, got %v", tt.expected, builder.slice)
			}
		})
	}
}

func TestSliceBuilder_Find(t *testing.T) {
	tests := []struct {
		name     string
		input    []int
		findFn   func(int) bool
		expected *int
	}{
		{
			name:     "empty slice",
			input:    []int{},
			findFn:   func(x int) bool { return x > 0 },
			expected: nil,
		},
		{
			name:     "find first even number",
			input:    []int{1, 3, 4, 6, 7},
			findFn:   func(x int) bool { return x%2 == 0 },
			expected: intPtr(4),
		},
		{
			name:     "find element greater than 5",
			input:    []int{1, 2, 3, 6, 7},
			findFn:   func(x int) bool { return x > 5 },
			expected: intPtr(6),
		},
		{
			name:     "element not found",
			input:    []int{1, 2, 3},
			findFn:   func(x int) bool { return x > 10 },
			expected: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			builder := &SliceBuilder[int]{slice: tt.input}
			result := builder.Find(tt.findFn)

			if tt.expected == nil {
				if result != nil {
					t.Errorf("Expected nil, got %v", *result)
				}
			} else {
				if result == nil {
					t.Errorf("Expected %v, got nil", *tt.expected)
				} else if *result != *tt.expected {
					t.Errorf("Expected %v, got %v", *tt.expected, *result)
				}
			}
		})
	}
}

func TestSliceBuilder_Every(t *testing.T) {
	tests := []struct {
		name     string
		input    []int
		everyFn  func(int) bool
		expected bool
	}{
		{
			name:     "empty slice",
			input:    []int{},
			everyFn:  func(x int) bool { return x > 0 },
			expected: true,
		},
		{
			name:     "all positive",
			input:    []int{1, 2, 3, 4},
			everyFn:  func(x int) bool { return x > 0 },
			expected: true,
		},
		{
			name:     "not all even",
			input:    []int{2, 4, 5, 6},
			everyFn:  func(x int) bool { return x%2 == 0 },
			expected: false,
		},
		{
			name:     "all greater than 10",
			input:    []int{11, 12, 13},
			everyFn:  func(x int) bool { return x > 10 },
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			builder := &SliceBuilder[int]{slice: tt.input}
			result := builder.Every(tt.everyFn)

			if result != tt.expected {
				t.Errorf("Expected %v, got %v", tt.expected, result)
			}
		})
	}
}

func TestSliceBuilder_Some(t *testing.T) {
	tests := []struct {
		name     string
		input    []int
		someFn   func(int) bool
		expected bool
	}{
		{
			name:     "empty slice",
			input:    []int{},
			someFn:   func(x int) bool { return x > 0 },
			expected: false,
		},
		{
			name:     "some positive",
			input:    []int{-1, -2, 3, -4},
			someFn:   func(x int) bool { return x > 0 },
			expected: true,
		},
		{
			name:     "some even",
			input:    []int{1, 3, 4, 7},
			someFn:   func(x int) bool { return x%2 == 0 },
			expected: true,
		},
		{
			name:     "none greater than 10",
			input:    []int{1, 2, 3},
			someFn:   func(x int) bool { return x > 10 },
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			builder := &SliceBuilder[int]{slice: tt.input}
			result := builder.Some(tt.someFn)

			if result != tt.expected {
				t.Errorf("Expected %v, got %v", tt.expected, result)
			}
		})
	}
}

func TestSliceBuilder_Contains(t *testing.T) {
	tests := []struct {
		name     string
		input    []int
		value    int
		expected bool
	}{
		{
			name:     "empty slice",
			input:    []int{},
			value:    1,
			expected: false,
		},
		{
			name:     "contains value",
			input:    []int{1, 2, 3, 4},
			value:    3,
			expected: true,
		},
		{
			name:     "does not contain value",
			input:    []int{1, 2, 3, 4},
			value:    5,
			expected: false,
		},
		{
			name:     "contains first element",
			input:    []int{10, 20, 30},
			value:    10,
			expected: true,
		},
		{
			name:     "contains last element",
			input:    []int{10, 20, 30},
			value:    30,
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			builder := &SliceBuilder[int]{slice: tt.input}
			result := builder.Contains(tt.value)

			if result != tt.expected {
				t.Errorf("Expected %v, got %v", tt.expected, result)
			}
		})
	}
}

func TestSliceBuilder_Unique(t *testing.T) {
	tests := []struct {
		name     string
		input    []int
		expected []int
	}{
		{
			name:     "empty slice",
			input:    []int{},
			expected: []int{},
		},
		{
			name:     "no duplicates",
			input:    []int{1, 2, 3, 4},
			expected: []int{1, 2, 3, 4},
		},
		{
			name:     "with duplicates",
			input:    []int{1, 2, 2, 3, 3, 3, 4},
			expected: []int{1, 2, 3, 4},
		},
		{
			name:     "all same elements",
			input:    []int{5, 5, 5, 5},
			expected: []int{5},
		},
		{
			name:     "single element",
			input:    []int{42},
			expected: []int{42},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			builder := &SliceBuilder[int]{slice: tt.input}
			result := builder.Unique()

			// Check that it returns the builder for chaining
			if result != builder {
				t.Error("Unique should return the same builder instance for chaining")
			}

			// Check the result
			if !slicesEqual(builder.slice, tt.expected) {
				t.Errorf("Expected %v, got %v", tt.expected, builder.slice)
			}
		})
	}
}

func TestSliceBuilder_HasDuplicates(t *testing.T) {
	tests := []struct {
		name     string
		input    []int
		expected bool
	}{
		{
			name:     "empty slice",
			input:    []int{},
			expected: false,
		},
		{
			name:     "no duplicates",
			input:    []int{1, 2, 3, 4},
			expected: false,
		},
		{
			name:     "has duplicates",
			input:    []int{1, 2, 2, 3},
			expected: true,
		},
		{
			name:     "all same elements",
			input:    []int{5, 5, 5},
			expected: true,
		},
		{
			name:     "single element",
			input:    []int{42},
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			builder := &SliceBuilder[int]{slice: tt.input}
			result := builder.HasDuplicates()

			if result != tt.expected {
				t.Errorf("Expected %v, got %v", tt.expected, result)
			}
		})
	}
}

func TestSliceBuilder_ToMap(t *testing.T) {
	tests := []struct {
		name     string
		input    []int
		mapFn    func(int) (string, int)
		expected map[string]int
	}{
		{
			name:     "empty slice",
			input:    []int{},
			mapFn:    func(x int) (string, int) { return strconv.Itoa(x), x * 2 },
			expected: map[string]int{},
		},
		{
			name:  "string key with doubled value",
			input: []int{1, 2, 3},
			mapFn: func(x int) (string, int) { return strconv.Itoa(x), x * 2 },
			expected: map[string]int{
				"1": 2,
				"2": 4,
				"3": 6,
			},
		},
		{
			name:  "prefixed key with original value",
			input: []int{10, 20, 30},
			mapFn: func(x int) (string, int) { return "key_" + strconv.Itoa(x), x },
			expected: map[string]int{
				"key_10": 10,
				"key_20": 20,
				"key_30": 30,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			builder := &SliceBuilder[int]{slice: tt.input}
			result := builder.ToMap(tt.mapFn)

			if !mapsEqual(result, tt.expected) {
				t.Errorf("Expected %v, got %v", tt.expected, result)
			}
		})
	}
}

func TestSliceBuilder_Result(t *testing.T) {
	tests := []struct {
		name     string
		input    []int
		expected []int
	}{
		{
			name:     "empty slice",
			input:    []int{},
			expected: []int{},
		},
		{
			name:     "with elements",
			input:    []int{1, 2, 3, 4},
			expected: []int{1, 2, 3, 4},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			builder := &SliceBuilder[int]{slice: tt.input}
			result := builder.Result()

			if !slicesEqual(result, tt.expected) {
				t.Errorf("Expected %v, got %v", tt.expected, result)
			}
		})
	}
}

func TestSliceBuilder_Chaining(t *testing.T) {
	t.Run("complex chaining operations", func(t *testing.T) {
		result := NewSliceBuilder[int]().
			Map(func(x int) int { return x + 1 }).     // This will operate on empty slice
			Filter(func(x int) bool { return x > 0 }). // This will operate on empty slice
			Unique().
			Result()

		expected := []int{}
		if !slicesEqual(result, expected) {
			t.Errorf("Expected %v, got %v", expected, result)
		}
	})

	t.Run("chain with initial data", func(t *testing.T) {
		builder := &SliceBuilder[int]{slice: []int{1, 2, 2, 3, 4, 4, 5}}
		result := builder.
			Map(func(x int) int { return x * 2 }).     // [2, 4, 4, 6, 8, 8, 10]
			Filter(func(x int) bool { return x > 4 }). // [6, 8, 8, 10]
			Unique().                                  // [6, 8, 10]
			Result()

		expected := []int{6, 8, 10}
		if !slicesEqual(result, expected) {
			t.Errorf("Expected %v, got %v", expected, result)
		}
	})

	t.Run("chaining with find operation", func(t *testing.T) {
		builder := &SliceBuilder[int]{slice: []int{1, 2, 3, 4, 5}}
		builder.Filter(func(x int) bool { return x > 2 }) // [3, 4, 5]
		found := builder.Find(func(x int) bool { return x%2 == 0 })

		if found == nil || *found != 4 {
			t.Errorf("Expected to find 4, got %v", found)
		}
	})
}

func TestSliceBuilder_WithStrings(t *testing.T) {
	t.Run("string slice operations", func(t *testing.T) {
		builder := &SliceBuilder[string]{slice: []string{"hello", "world", "hello", "go"}}
		result := builder.
			Map(func(s string) string { return s + "!" }).
			Filter(func(s string) bool { return len(s) > 3 }).
			Unique().
			Result()

		expected := []string{"hello!", "world!"}
		if !slicesEqual(result, expected) {
			t.Errorf("Expected %v, got %v", expected, result)
		}
	})
}

// Helper functions
func intPtr(x int) *int {
	return &x
}

func slicesEqual[T comparable](a, b []T) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func mapsEqual[K, V comparable](a, b map[K]V) bool {
	if len(a) != len(b) {
		return false
	}
	for k, v := range a {
		if bv, exists := b[k]; !exists || bv != v {
			return false
		}
	}
	return true
}
