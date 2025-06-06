package setup

import (
	"os"
	"path/filepath"
	"template/internal/shared/environment"
	"testing"
)

func LoadEnvironment(t *testing.T) {
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
