package mixin

import (
	"template/internal/shared/utilities/id"
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/mixin"
	"github.com/google/uuid"
)

type BaseMixin struct {
	mixin.Schema
}

func (BaseMixin) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).Default(id.NextUUIDv7).Unique(),
		field.Time("created_at").
			Default(time.Now).
			SchemaType(map[string]string{
				dialect.Postgres: "timestamp without time zone",
			}),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now).
			SchemaType(map[string]string{
				dialect.Postgres: "timestamp without time zone",
			}),
		field.Time("deleted_at").
			Nillable().
			Optional().
			SchemaType(map[string]string{
				dialect.Postgres: "timestamp without time zone",
			}),
	}
}

func (BaseMixin) Hooks() []ent.Hook {
	return []ent.Hook{
		// UUIDv7Generator(),
	}
}

type Common interface {
	SetID(id string)
}

// func UUIDv7Generator() ent.Hook {
// 	return hook.On(func(next ent.Mutator) ent.Mutator {
// 		return ent.MutateFunc(func(ctx context.Context, m ent.Mutation) (ent.Value, error) {
// 			if s, ok := m.(Common); ok {
// 				ID := id.NextId()
// 				s.SetID(ID)
// 			}
// 			return next.Mutate(ctx, m)
// 		})
// 	}, ent.OpCreate)
// }
