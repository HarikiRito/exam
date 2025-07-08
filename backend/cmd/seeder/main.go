package main

import (
	"context"
	"log"
	"template/internal/ent/db"
	"template/internal/seeder"
	"template/internal/shared/environment"
)

func main() {
	ctx := context.Background()

	err := environment.LoadEnvironment()
	if err != nil {
		log.Fatal("Error loading environment variables: ", err)
	}

	err = db.InitDatabase()
	if err != nil {
		log.Fatal("Error initializing database: ", err)
	}

	err = seeder.RunSeeder(ctx)
	if err != nil {
		log.Fatalf("failed to run seeder: %v", err)
	}
}
