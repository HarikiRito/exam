package db

import (
	"os"
	"path/filepath"
	"template/internal/ent/db"
	"template/internal/shared/environment"
	"testing"
)

func TestConnectionString(t *testing.T) {

	wd, err := os.Getwd()
	if err != nil {
		t.Fatalf("Failed to get working directory: %v", err)
	}

	joinPath := filepath.Join(wd, "../..", ".env.test")

	err = environment.LoadEnvironment(joinPath)
	if err != nil {
		t.Fatalf("Failed to load environment: %v", err)
	}
}

func TestInitDatabase(t *testing.T) {
	TestConnectionString(t)
	err := db.InitDatabase()
	if err != nil {
		t.Fatalf("Failed to initialize database: %v", err)
	}
}
