# Backend - Go + Ent + GraphQL

## Architecture

**Clean Architecture with Feature-Based Organization**
- `cmd/` - Entry points (app, seeder)
- `internal/ent/` - Data layer (Ent ORM)
- `internal/features/` - Business logic (feature modules)
- `internal/graph/` - API layer (GraphQL resolvers)
- `internal/shared/` - Cross-cutting concerns

**Data Flow:** GraphQL Resolver → Feature Package → Ent Client

## Core Technologies

- Go 1.24, Gin, gqlgen, Ent ORM, PostgreSQL, JWT
- Code generation: `make generate`, `make ent_generate`, `make graphql_generate`

## Coding Guidelines

### Database Access

```go
// Single operation
client, err := db.OpenClient()

// Transaction
tx, err := db.OpenTransaction(ctx)
if err := operation(); err != nil {
    return db.Rollback(tx, err)
}
return tx.Commit()
```

### Error Handling

```go
// Early returns
if err := validate(); err != nil {
    return err
}

// GraphQL errors
return nil, NewUnauthorizedError("message")
return nil, NewForbiddenError("message")
```

### Ent Patterns

```go
// Prefer SetNillable
query.SetNillableName(input.Name).SetNillableTime(input.Time)

// Avoid edges - use dataloaders
func (r *entityResolver) User(ctx context.Context, obj *model.Entity) (*model.User, error) {
    return dataloader.GetUserByID(ctx, obj.UserID)
}
```

### Slice Operations

```go
import "template/internal/shared/utilities/slice"

items := slice.Map(entities, model.ConvertToModel)
filtered := slice.Filter(items, predicate)
unique := slice.Unique(ids)
```

### Pagination

```go
result, err := common.EntQueryPaginated(ctx, query, page, limit)
items := slice.Map(result.Items, model.ConvertToModel)
```

### Resolvers

```go
func (r *mutationResolver) CreateEntity(ctx context.Context, input model.Input) (*model.Entity, error) {
    // 1. Check permissions
    _, err := CheckUserPermissions(ctx, []permission.Permission{permission.EntityCreate})

    // 2. Delegate to feature
    entity, err := feature.CreateEntity(ctx, input)

    // 3. Convert to GraphQL model
    return model.ConvertToModel(entity), nil
}
```

## Key Rules

- **Thin resolvers** - business logic in features
- **Model conversion** - always use dedicated functions
- **No edge loading** - use dataloaders instead
- **SetNillable methods** - avoid manual nil checks
- **Transaction handling** - `db.OpenTransaction` + `db.Rollback`
- **Context propagation** - always pass context
- **UUIDv7** for IDs via `mixin.DefaultMixins()`
