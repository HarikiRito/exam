package db

import (
	"fmt"
	"template/internal/ent"
	_ "template/internal/ent/runtime"
	"template/internal/shared/environment"
)

func OpenClient() (*ent.Client, error) {
	return ent.Open("postgres", connectionString())
}

func connectionString() string {
	return fmt.Sprintf("host=%s port=%s user=%s dbname=%s password=%s sslmode=disable", environment.DB_HOST, environment.DB_PORT, environment.DB_USER, environment.DB_NAME, environment.DB_PASSWORD)
}
