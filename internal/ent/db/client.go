package db

import (
	"database/sql"
	"fmt"
	"template/internal/ent"
	_ "template/internal/ent/runtime"
	"template/internal/shared/environment"

	"entgo.io/ent/dialect"
	entsql "entgo.io/ent/dialect/sql"
	_ "github.com/jackc/pgx/v5/stdlib"
)

func OpenClient() (*ent.Client, error) {
	db, err := OpenDB()
	if err != nil {
		return nil, err
	}
	// Create an ent.Driver from `db`.
	drv := entsql.OpenDB(dialect.Postgres, db)

	var client *ent.Client
	if environment.IsDebug() {
		client = ent.NewClient(ent.Driver(drv), ent.Debug())
	} else {
		client = ent.NewClient(ent.Driver(drv))
	}

	return client, nil
}

func OpenClientWithoutDebug() (*ent.Client, error) {
	db, err := OpenDB()
	if err != nil {
		return nil, err
	}
	// Create an ent.Driver from `db`.
	drv := entsql.OpenDB(dialect.Postgres, db)
	return ent.NewClient(ent.Driver(drv)), nil
}

func DatabaseURL() string {
	return fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?search_path=%s", environment.DB_USER, environment.DB_PASSWORD, environment.DB_HOST, environment.DB_PORT, environment.DB_NAME, environment.DB_SCHEMA)
}

func OpenDB() (*sql.DB, error) {
	db, err := sql.Open("pgx", DatabaseURL())
	if err != nil {
		return nil, err
	}

	return db, nil

}
