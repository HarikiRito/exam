# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is an exam/quiz platform monorepo with Go backend and React/Remix frontend:

- **Backend**: GraphQL API using Go, Ent ORM, PostgreSQL database
- **Frontend**: React/Remix with TypeScript, Apollo Client, Tailwind CSS
- **Database**: PostgreSQL with comprehensive entities for courses, questions, tests, and user sessions

### Core Entities
- **Users**: Role-based authentication system (admin, teacher, student)
- **Courses**: Video-based learning with course sections
- **Questions**: Multiple choice with collections, difficulty points
- **Tests**: Configurable exams with question requirements and session tracking
- **Test Sessions**: Live exam instances with answers and scoring

## Development Commands

### Frontend (React/Remix)
Located in `frontend/` directory, uses **pnpm** package manager:

```bash
# Development
pnpm dev                 # Start dev server (port 5190)
pnpm build              # Production build
pnpm start              # Serve production build

# Code Quality  
pnpm typecheck          # TypeScript type checking
pnpm lint               # ESLint
pnpm lint:fix           # Auto-fix ESLint issues
pnpm ci:lint            # CI: typecheck + lint

# GraphQL
pnpm graphql:codegen    # Generate GraphQL types from schema
make clean-generated    # Clean generated GraphQL files

# Testing
pnpm test               # Run tests with Vitest
pnpm test:run           # Run tests once
pnpm test:coverage      # Test coverage report
```

### Backend (Go)
Located in `backend/` directory:

```bash
# Code Generation
make generate           # Generate Ent ORM + GraphQL code
make ent_generate       # Generate Ent ORM code only
make graphql_generate   # Generate GraphQL code only

# Testing & Data
make test               # Run integration tests
make test_fail          # Show only failed tests
make seed               # Seed database with test data

# Development
go run ./cmd/app/main.go        # Start server
go run ./cmd/seeder/main.go     # Run seeder manually
```

### Docker Development
```bash
docker-compose up       # Start full stack (backend, frontend, db)
```

## GraphQL Development Workflow

**Critical**: Always follow this sequence for GraphQL changes:

1. **Backend**: Modify GraphQL schema in `backend/internal/graph/schema/`
2. **Backend**: Run `make graphql_generate` to update Go resolvers
3. **Frontend**: Run `pnpm graphql:codegen` to update TypeScript types
4. **Frontend**: Implement queries/mutations using generated types
5. **Verify**: Run `pnpm typecheck` to ensure no TypeScript errors

## Code Architecture

### Backend Structure
- `internal/ent/` - Ent ORM generated code and schemas
- `internal/graph/` - GraphQL resolvers and schema definitions
- `internal/features/` - Business logic organized by domain
- `integration_test/` - Comprehensive test suite with database setup

### Frontend Structure  
- `app/routes/` - Remix file-based routing with nested layouts
- `app/shared/components/` - Reusable UI components (custom + shadcn/ui)
- `app/graphql/operations/` - GraphQL queries/mutations by domain
- `app/shared/stores/` - Valtio state management

### Key Patterns
- **Authentication**: JWT-based with role permissions via GraphQL context
- **Data Loading**: Apollo Client with automatic caching and optimistic updates  
- **Database**: Ent ORM with schema-first approach and migrations
- **Testing**: Integration tests with real database transactions
- **State Management**: Valtio for client state, Apollo for server state

## Development Rules

### Frontend
- **Component Reuse**: Search existing components before creating new ones
- **GraphQL**: Always run codegen before editing GraphQL-related code
- **TypeScript**: Code must be error-free, run `pnpm typecheck`
- **Package Manager**: Use `pnpm` exclusively

### Backend  
- **Code Generation**: Run `make generate` after schema changes
- **Database**: Use Ent schema files, not direct SQL
- **GraphQL**: Follow established resolver patterns in `internal/graph/`
- **Testing**: Add integration tests for new features

### Code Style
- Prefer early returns over nested conditionals
- Use guard clauses to reduce nesting
- Follow existing patterns within each domain