package todo

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/graph/model"
)

func CreateTodo(ctx context.Context, input model.NewTodo) (*ent.Todo, error) {

	client, err := db.OpenClient()
	if err != nil {
		return nil, err
	}
	defer client.Close()
	todo, err := client.Todo.Create().SetTitle(input.Text).Save(ctx)
	if err != nil {
		return nil, err
	}

	return todo, nil
}
