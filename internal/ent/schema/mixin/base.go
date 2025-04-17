package mixin

import (
	"template/internal/shared/utilities/id"
	"time"

	_ "template/internal/ent/runtime"

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

func (BaseMixin) Mixin() []ent.Mixin {
	return []ent.Mixin{
		// intercept.SoftDeleteMixin{},
	}
}

type Common interface {
	SetID(id string)
}
