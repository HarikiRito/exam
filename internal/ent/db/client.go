package db

import (
	"fmt"
	"template/internal/ent"
	_ "template/internal/ent/runtime"
	"template/internal/shared/environment"
)

func OpenClient() (*ent.Client, error) {
	options := []ent.Option{}
	if environment.IsDebug() {
		options = append(options, ent.Debug())
	}
	return ent.Open("postgres", ConnectionString(), options...)
}

func OpenClientWithoutDebug() (*ent.Client, error) {
	return ent.Open("postgres", ConnectionString())
}

func ConnectionString() string {
	return fmt.Sprintf("host=%s port=%s user=%s dbname=%s password=%s sslmode=disable", environment.DB_HOST, environment.DB_PORT, environment.DB_USER, environment.DB_NAME, environment.DB_PASSWORD)
}
