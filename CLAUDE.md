# Project Instructions

This project is a monorepo with the following structure:

## Frontend (React/Remix)
- Written in React using the Remix framework
- Located in the `frontend/` directory

### Frontend Development Rules:
- **GraphQL Features**: When creating new features related to GraphQL:
  1. Always run codegen first to update the schema to match the server
  2. Then proceed to edit code with queries and mutations
  3. Always verify code works using the type check command
  4. Code must not contain any TypeScript errors
- **Component Reuse**: Search existing components in the folder structure first before implementing something new
- **Package Management**: Remember to using pnpm
- Always use the mcp sequence thinking
- **Code Style**: Prefer using early return for error handling instead of wrapping conditions in if-else statements when possible. Use guard clauses and early returns to reduce nesting and improve code readability.

## Backend (Go)
- Written in Go
- Uses GraphQL server for API resource interaction
- Located in the `backend/` directory

### Backend Development Rules:
- Follow the current project structure
- Maintain GraphQL server patterns for API interactions

## Development Workflow:
1. For frontend GraphQL changes: Run codegen � Edit code � Type check
2. Always search for existing components/patterns before creating new ones
3. Ensure no TypeScript errors in frontend code
4. Follow established project structure in both frontend and backend