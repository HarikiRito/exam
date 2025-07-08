.ONESHELL:


generate: ent_generate graphql_generate

ent_generate:
	@echo "Generating ent files..."
	@go generate ./internal/ent
	@echo "Done"

graphql_generate:
	@echo "Generating gqlgen files..."
	@go generate ./...
	@echo "Done"


test:
	@echo "Running tests..."
	@/usr/bin/time go test ./integration_test/... -v
	@echo "Done"

test_fail:
	@echo "Running tests and showing only failed tests..."
	@/usr/bin/time go test ./integration_test/... -v 2> /dev/stderr | grep -E "FAIL|NAME" || true
	@echo "Done"

seed:
	@echo "Running seeder..."
	@go run ./cmd/seeder/main.go
	@echo "Done"