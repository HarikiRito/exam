.ONESHELL:

ent_generate:
	@echo "Generating ent files..."
	@go generate ./ent
	@echo "Done"