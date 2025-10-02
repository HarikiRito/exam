# Frontend - Remix + React + TypeScript + GraphQL

## Architecture

- `app/routes/` - File-based routing (flat routes)
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
// 1. Create .query.gql → 2. pnpm run graphql:codegen → 3. Use hooks
const [mutation, { loading }] = useMutation({ onCompleted, onError });
```

### State
```typescript
// Valtio - use createProxyWithReset for route-level state
import { createProxyWithReset } from 'app/shared/utils/valtio';

class FormState { count = 0; }
export const formState = createProxyWithReset(new FormState());

// Usage
const snap = formState.useStateSnapshot();
formState.useResetHook(); // Auto-reset on unmount

// Only use proxy(new Store()) for global stores in app/shared/
```

## Rules

- **Package manager:** pnpm only
- **Imports:** Absolute with `app/` prefix
- **Styling:** TailwindCSS only, no custom classes on shared components
- **Forms:** React Hook Form + Zod + `mode: 'onBlur'`
- **GraphQL:** .gql → codegen → hooks (no try-catch, Apollo handles errors)
- **State:** `createProxyWithReset` for route-level state, `proxy(new Store())` only for global stores in `app/shared/`
- **SSR/Loaders:** FORBIDDEN (SPA mode)
- **Icons:** lucide-react only
- **Control flow:** Early returns over nested if-else
- **Magic numbers:** Extract to named constants with comments
- **Arrays:** `Array.from()` / spread over imperative loops
- **Components:** Check existing before creating
