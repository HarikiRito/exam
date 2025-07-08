package slice

type SliceBuilder[T comparable] struct {
	slice []T
}

func NewSliceBuilder[T comparable]() *SliceBuilder[T] {
	return &SliceBuilder[T]{}
}

func (builder *SliceBuilder[T]) Map(fn func(T) T) *SliceBuilder[T] {
	builder.slice = Map(builder.slice, fn)
	return builder
}

func (builder *SliceBuilder[T]) Filter(fn func(T) bool) *SliceBuilder[T] {
	builder.slice = Filter(builder.slice, fn)
	return builder
}

func (builder *SliceBuilder[T]) FlatMap(fn func(T) []T) *SliceBuilder[T] {
	builder.slice = FlatMap(builder.slice, fn)
	return builder
}

func (builder *SliceBuilder[T]) Find(fn func(T) bool) *T {
	return Find(builder.slice, fn)
}

func (builder *SliceBuilder[T]) Every(fn func(T) bool) bool {
	return Every(builder.slice, fn)
}

func (builder *SliceBuilder[T]) Some(fn func(T) bool) bool {
	return Some(builder.slice, fn)
}

func (builder *SliceBuilder[T]) Contains(value T) bool {
	return Contains(builder.slice, value)
}

func (builder *SliceBuilder[T]) Unique() *SliceBuilder[T] {
	builder.slice = Unique(builder.slice)
	return builder
}

func (builder *SliceBuilder[T]) HasDuplicates() bool {
	return HasDuplicates(builder.slice)
}

func (builder *SliceBuilder[T]) ToMap(fn func(T) (string, T)) map[string]T {
	return ToMap(builder.slice, fn)
}

func (builder *SliceBuilder[T]) Result() []T {
	return builder.slice
}
