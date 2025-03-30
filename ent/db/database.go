package db

import (
	"context"
	"log"
	"template/ent"

	_ "github.com/lib/pq"
)

var DbClient *ent.Client

func InitDatabase() {
	client, err := OpenClient()
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	defer client.Close()
	// Run the auto migration tool.
	if err := client.Schema.Create(context.Background()); err != nil {
		log.Fatalf("failed creating schema resources: %v", err)
	}

}
