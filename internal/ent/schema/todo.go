package schema

import (
	"template/internal/ent/schema/mixin"

	"entgo.io/ent"
	"entgo.io/ent/schema/field"
)

type Todo struct {
	ent.Schema
}

// Fields of the User.
func (Todo) Fields() []ent.Field {
	return []ent.Field{
		field.String("title"),
		field.String("description").Optional(),
	}
}

// Edges of the User.-
func (Todo) Edges() []ent.Edge {
	return nil
}

func (Todo) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.BaseMixin{},
	}
}
