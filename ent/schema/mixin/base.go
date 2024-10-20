package mixin

import (
	"context"
	"template/ent/hook"
	"template/shared/utilities/snowflake"
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/mixin"
)

type BaseMixin struct {
	mixin.Schema
}

func (BaseMixin) Fields() []ent.Field {
	return []ent.Field{
		field.Uint64("id").Positive(),
		field.Time("created_at").Default(time.Now),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
		field.Time("deleted_at").Nillable().Optional(),
	}
}

func (BaseMixin) Hooks() []ent.Hook {
	return []ent.Hook{
		SnowflakeIDHook(),
	}
}

type Common interface {
	SetID(id uint64)
}

func SnowflakeIDHook() ent.Hook {
	return hook.On(func(next ent.Mutator) ent.Mutator {
		return ent.MutateFunc(func(ctx context.Context, m ent.Mutation) (ent.Value, error) {
			if s, ok := m.(Common); ok {
				ID := snowflake.NextId()
				s.SetID(ID)
			}
			return next.Mutate(ctx, m)
		})
	}, ent.OpCreate)
}
