package db

import (
	"database/sql"
	"fmt"
	"sync"
	"template/internal/ent"
	_ "template/internal/ent/runtime"
	"template/internal/shared/environment"

	"entgo.io/ent/dialect"
	entsql "entgo.io/ent/dialect/sql"
	_ "github.com/jackc/pgx/v5/stdlib"
)

var pgxDb *sql.DB
var databaseURL string

// Client caching variables
var (
	cachedClient *ent.Client
	clientMutex  sync.Mutex
)

// getOrCreateClient returns a cached client or creates a new one with debounce mechanism
func getOrCreateClient() (*ent.Client, error) {
	clientMutex.Lock()
	defer clientMutex.Unlock()

	// If we have a cached client and it matches the debug mode, reset timer and return it
	if cachedClient != nil {
		if environment.IsDebug() {
			return cachedClient.Debug(), nil
		}
		return cachedClient, nil
	}

	// Create new client
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

	// Cache the client and set up timer
	cachedClient = client

	return cachedClient, nil
}

func OpenClient() (*ent.Client, error) {
	return getOrCreateClient()
}

func OpenClientWithoutDebug() (*ent.Client, error) {
	return getOrCreateClient()
}

func DatabaseURL() string {
	return fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?search_path=%s", environment.DB_USER, environment.DB_PASSWORD, environment.DB_HOST, environment.DB_PORT, environment.DB_NAME, environment.DB_SCHEMA)
}

func OpenDB() (*sql.DB, error) {
	// Only open a new db connection if the database URL has changed. Otherwise, use the cached connection.
	// This is to avoid opening too many concurrent connections to the database, which cause the max open connections error.
	if pgxDb != nil && pgxDb.Ping() == nil && databaseURL == DatabaseURL() {
		return pgxDb, nil
	}

	databaseURL = DatabaseURL()
	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return nil, err
	}

	pgxDb = db

	return pgxDb, nil
}

func RemoveCachedClient() {
	cachedClient = nil
}

func RemoveCachedDB() {
	pgxDb = nil
}

func ClearCache() {
	RemoveCachedClient()
	RemoveCachedDB()
}
