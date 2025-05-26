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
var JWT_SECRET string
var JWT_REFRESH_SECRET string
var DEBUG string

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
	JWT_SECRET = os.Getenv("JWT_SECRET")
	JWT_REFRESH_SECRET = os.Getenv("JWT_REFRESH_SECRET")
	DEBUG = os.Getenv("DEBUG")
	return nil
}

func IsDebug() bool {
	return DEBUG == "true"
}
