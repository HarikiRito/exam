# Frontend - Remix + React + TypeScript + GraphQL

## Architecture

- `app/routes/` - File-based routing (flat routes)
  - Use `_index` folder for parent routes with child routes (e.g., `$sessionId/_index/` allows `$sessionId/result/`)
- `app/shared/` - Reusable code (components, hooks, stores, services)
- `app/graphql/` - GraphQL operations & generated types

## Stack

React 19, Remix 2 (SPA), TypeScript, Vite, shadcn/ui, Tailwind, Valtio, Apollo Client, pnpm

## Patterns

### Functions
```typescript
// Function declarations (default)
function handleSubmit(data: FormData) {}

// Arrow functions ONLY for React hooks
useEffect(() => {}, []);

// Early returns over nested if-else
function getPageNumbers() {
  if (condition1) return result1;
  if (condition2) return result2;
  return defaultResult;
}
```

### Imports
```typescript
import { Button } from "app/shared/components/ui/button";
```

### Forms
```typescript
const schema = z.object({ email: z.string().email() });
const form = useForm({ resolver: zodResolver(schema), mode: 'onBlur' });
```

### GraphQL
```typescript
// 1. Create .query.gql → 2. pnpm run graphql:codegen → 3. Use generated hooks
import { useGetTestQuery } from 'app/graphql/operations/test/getTest.query.generated';

const { data, loading, error } = useGetTestQuery({ variables: { id } });
const [mutation, { loading }] = useCreateTestMutation({ onCompleted, onError });
```

### State
```typescript
// Valtio - use createProxyWithReset for route-level state
import { createProxyWithReset } from 'app/shared/utils/valtio';

export const formStore = createProxyWithReset(
  new (class FormState {
    count = 0;
  })()
);

// Usage - use store's useStateSnapshot() method
const snap = formStore.useStateSnapshot();
formStore.useResetHook(); // Auto-reset on unmount

// Only use proxy(new Store()) for global stores in app/shared/
```

## Rules

- **Package manager:** pnpm only
- **Imports:** Absolute with `app/` prefix
- **Styling:** TailwindCSS only, no custom classes on shared components
  - **Exception:** Third-party components with inline styles (e.g., `react-syntax-highlighter`) may use `customStyle`/`style` props when Tailwind inheritance is blocked
- **Forms:** React Hook Form + Zod + `mode: 'onBlur'`
- **GraphQL:** .gql → codegen → use generated hooks (no try-catch, no direct Apollo imports)
- **State:** `createProxyWithReset` for route-level state, `proxy(new Store())` only for global stores in `app/shared/`
- **SSR/Loaders:** FORBIDDEN (SPA mode)
- **Icons:** lucide-react only
- **Control flow:** Early returns over nested if-else
- **Magic numbers:** Extract to named constants with comments
- **Arrays:** `Array.from()` / spread over imperative loops
- **Components:** ALWAYS check `app/shared/components/ui/` for existing components before creating new ones
  - Use `AppTypography` for text elements (h1-h4, p, muted, small, large, lead, etc.) instead of plain HTML
  - All shared UI components use `App` prefix (AppCard, AppButton, AppTypography, etc.)
- **Linting:** ALWAYS run `pnpm run ci:lint` after code changes to auto-fix ESLint/Prettier issues
