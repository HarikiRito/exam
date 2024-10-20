package db

import (
	"context"
	"fmt"
	"log"
	"template/ent"
	"template/shared/environment"

	_ "github.com/lib/pq"
)

func InitDatabase() {
	client, err := ent.Open("postgres", connectionString())
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	defer client.Close()
	// Run the auto migration tool.
	if err := client.Schema.Create(context.Background()); err != nil {
		log.Fatalf("failed creating schema resources: %v", err)
	}
}

func connectionString() string {
	return fmt.Sprintf("host=%s port=%s user=%s dbname=%s password=%s sslmode=disable", environment.DB_HOST, environment.DB_PORT, environment.DB_USER, environment.DB_NAME, environment.DB_PASSWORD)
}
