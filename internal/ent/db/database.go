package db

import (
	"context"
	"log"
	"template/internal/ent"

	_ "github.com/lib/pq"
)

var DbClient *ent.Client

func InitDatabase() error {
	client, err := OpenClientWithoutDebug()

	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
		return err
	}
	defer client.Close()
	if err := client.Schema.Create(context.Background()); err != nil {
		log.Fatalf("failed creating schema resources: %v", err)
		return err
	}
	return nil
}
