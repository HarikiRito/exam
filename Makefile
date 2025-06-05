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

# Test targets
test:
	@echo "Running all tests..."
	@go test ./... -v

test_features:
	@echo "Running feature tests..."
	@go test ./internal/features/... -v

test_multi_collection:
	@echo "Running AddMultiCollection tests..."
	@go test ./internal/features/test -v -run TestAddMultiCollectionOriginal

test_coverage:
	@echo "Running tests with coverage..."
	@go test ./... -v -cover

test_env:
	@echo "Running tests with .env.test file..."
	@if [ -f .env.test ]; then \
		export $$(cat .env.test | xargs) && go test ./internal/features/test -v; \
	else \
		echo "Warning: .env.test file not found. Using default environment."; \
		go test ./internal/features/test -v; \
	fi
