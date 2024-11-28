.ONESHELL:


generate: graphql_generate ent_generate

ent_generate:
	@echo "Generating ent files..."
	@go generate ./ent
	@echo "Done"

graphql_generate:
	@echo "Generating gqlgen files..."
	@go generate ./...
	@echo "Done"
