package setup

import (
	"database/sql"
	"fmt"
	"os"
	"template/internal/ent/db"
	"testing"
)

func PrepareDbClient(t *testing.T, schema string) *sql.DB {
	os.Setenv("DB_SCHEMA", schema)
	LoadEnvironment(t)
	dbClient, err := db.OpenDB()
	if err != nil {
		t.Fatalf("Failed to open database client: %v", err)
	}
	return dbClient
}

func CreateTestSchema(t *testing.T, schema string) {
	dbClient := PrepareDbClient(t, schema)

	_, err := dbClient.Exec(fmt.Sprintf("CREATE SCHEMA IF NOT EXISTS %s;", schema))
	if err != nil {
		t.Fatalf("Failed to create schema: %v", err)
	}
}

func ResetTestSchema(t *testing.T, schema string) {
	DeleteTestSchema(t, schema)
	initDatabase(t, schema)
}

func DeleteTestSchema(t *testing.T, schema string) {
	dbClient := PrepareDbClient(t, schema)

	_, err := dbClient.Exec(fmt.Sprintf("DROP SCHEMA IF EXISTS %s CASCADE;", schema))
	if err != nil {
		t.Fatalf("Failed to drop schema: %v", err)
	}
}

func initDatabase(t *testing.T, schema string) {
	CreateTestSchema(t, schema)
	PrepareDbClient(t, schema)
	err := db.InitDatabase()
	if err != nil {
		t.Fatalf("Failed to initialize database: %v", err)
	}
}
