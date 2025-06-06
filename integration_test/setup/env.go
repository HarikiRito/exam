package setup

import (
	"os"
	"path/filepath"
	"template/internal/shared/environment"
	"testing"
)

func LoadEnvironment(t *testing.T) {
	envPath := GetEnvPathFromRoot(t, ".env.test")
	err := environment.LoadEnvironment(envPath)
	if err != nil {
		t.Fatalf("Failed to load environment: %v", err)
	}
}

func GetEnvPathFromRoot(t *testing.T, envFileName string) string {
	// Go up directories to find project root with .env file
	currentDir, _ := os.Getwd()
	absPath := ""
	for {
		envPath := filepath.Join(currentDir, envFileName)
		if _, err := os.Stat(envPath); err == nil {
			absPath = findAbsEnvPath(t, envPath)
			return absPath
		}
		parent := filepath.Dir(currentDir)
		if parent == currentDir {
			t.Fatal("Could not find .env file in project hierarchy")
		}
		currentDir = parent
	}
}

func findAbsEnvPath(t *testing.T, envFilePath string) string {
	// Find the .env file relative to the project root
	absPath, err := filepath.Abs(envFilePath)
	if err != nil {
		t.Fatalf("Failed to get absolute path for .env file: %v", err)
	}

	return absPath
}
