package environment

import (
	"os"

	"github.com/joho/godotenv"
)

var DB_NAME string
var DB_USER string
var DB_PASSWORD string
var DB_HOST string
var DB_PORT string
var PORT string

func LoadEnvironment() error {
	err := godotenv.Load()

	if err != nil {
		return err
	}

	DB_NAME = os.Getenv("DB_NAME")
	DB_USER = os.Getenv("DB_USER")
	DB_PASSWORD = os.Getenv("DB_PASSWORD")
	DB_HOST = os.Getenv("DB_HOST")
	DB_PORT = os.Getenv("DB_PORT")
	PORT = os.Getenv("PORT")

	return nil
}
