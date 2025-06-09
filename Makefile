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
	@go test ./integration_test/... -v
test_fail:
	@echo "Running tests and showing only failed tests..."
	@go test ./integration_test/... -v | grep "FAIL"
	@echo "Done"