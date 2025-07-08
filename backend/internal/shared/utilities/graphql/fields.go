package graphqlFields

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
	graphqlBase "github.com/99designs/gqlgen/graphql"
)

// CollectAllFields returns a slice of strings containing all requested field names
// regardless of fragments or type conditions.
func CollectAllFields(ctx context.Context) []string {
	return graphqlBase.CollectAllFields(ctx)
}

// CollectFieldsCtx returns the set of fields selected for the given type.
// The satisfies parameter should contain the list of types that the resolved object will satisfy.
func CollectFieldsCtx(ctx context.Context, satisfies []string) []graphqlBase.CollectedField {
	return graphqlBase.CollectFieldsCtx(ctx, satisfies)
}

// GetPreloads returns a string slice of all fields requested in the query,
// including nested fields with dot notation (e.g., "user.profile.name").
func GetPreloads(ctx context.Context) []string {
	return GetNestedPreloads(
		graphqlBase.GetOperationContext(ctx),
		graphqlBase.CollectFieldsCtx(ctx, nil),
		"",
	)
}

// GetPreloadsAsMap returns a map of all fields requested in the query,
// including nested fields with dot notation (e.g., "user.profile.name").
func GetPreloadsAsMap(ctx context.Context) map[string]bool {
	preloads := GetPreloads(ctx)
	preloadsMap := make(map[string]bool)
	for _, preload := range preloads {
		preloadsMap[preload] = true
	}
	return preloadsMap
}

// GetNestedPreloads recursively traverses the GraphQL fields to extract all nested field paths.
func GetNestedPreloads(ctx *graphqlBase.OperationContext, fields []graphqlBase.CollectedField, prefix string) (preloads []string) {
	for _, column := range fields {
		prefixColumn := GetPreloadString(prefix, column.Name)
		preloads = append(preloads, prefixColumn)
		preloads = append(preloads, GetNestedPreloads(ctx, graphql.CollectFields(ctx, column.Selections, nil), prefixColumn)...)
	}
	return
}

// GetPreloadString formats the field name with its prefix.
func GetPreloadString(prefix, name string) string {
	if len(prefix) > 0 {
		return prefix + "." + name
	}
	return name
}

func IsOperationContextExist(ctx context.Context) bool {
	backgroundCtx := context.Background()
	if val, ok := backgroundCtx.Value(ctx).(*graphqlBase.OperationContext); ok && val != nil {
		return true
	}
	return false
}
