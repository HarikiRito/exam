# Frontend - Remix + React + TypeScript + GraphQL

## Architecture

**Remix SPA Mode (SSR Disabled)**
- `app/routes/` - File-based routing (flat routes)
- `app/shared/` - Reusable code (components, hooks, stores, services)
- `app/graphql/` - GraphQL operations & generated types

## Core Technologies

- React 19, Remix 2 (SPA), TypeScript (strict), Vite
- **UI:** shadcn/ui, Radix UI, Tailwind CSS, lucide-react
- **State:** Valtio (primary), Jotai, Zustand
- **Forms:** React Hook Form + Zod
- **GraphQL:** Apollo Client + GraphQL Code Generator
- **Package Manager:** pnpm (MANDATORY)

## Coding Guidelines

### Functions

```typescript
// ✅ Function declarations (default)
function handleSubmit(data: FormData) {
  // logic
}

// ✅ Arrow functions ONLY for React hooks
useEffect(() => {}, []);
const value = useMemo(() => compute(), []);
```

### Imports

```typescript
// Always use absolute imports with app/ prefix
import { Button } from "app/shared/components/ui/button";
import { userStore } from "app/shared/stores/user.store";
```

### Components

```typescript
function UserProfile() {
  const snap = useSnapshot(userStore); // Valtio

  return (
    <div className="flex gap-4"> {/* TailwindCSS only */}
      <AppButton onClick={handleClick}>Submit</AppButton>
    </div>
  );
}
```

### Forms

```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur', // REQUIRED
  });

  function onSubmit(data: FormData) {
    // Handle submission
  }

  return (
    <AppForm.Root {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <AppForm.Field
          control={form.control}
          name="email"
          render={({ field }) => (
            <AppForm.Item>
              <AppForm.Label>Email</AppForm.Label>
              <AppForm.Control>
                <AppInput {...field} />
              </AppForm.Control>
              <AppForm.Message />
            </AppForm.Item>
          )}
        />
        <AppButton type="submit">Submit</AppButton>
      </form>
    </AppForm.Root>
  );
}
```

### GraphQL

```typescript
// 1. Create .query.gql or .mutation.gql
// 2. Run: pnpm run graphql:codegen
// 3. Use generated hooks

const [login, { loading }] = useLoginMutation({
  onCompleted: (data) => {
    // Success
  },
  onError: (error) => {
    // Error - NO try-catch needed
  },
});
```

### State Management

```typescript
// Valtio store
import { proxy } from 'valtio';

class UserStore {
  user: User | null = null;
}

export const userStore = proxy(new UserStore());

// Usage
import { useSnapshot } from 'valtio';

const snap = useSnapshot(userStore);
return <div>{snap.user?.name}</div>;
```

### Routing

```typescript
// app/shared/constants/routes.ts
export const APP_ROUTES = {
  dashboard: '/dashboard',
  courseDetail: (id: string) => `/courses/${id}`,
};

// Usage
navigate(APP_ROUTES.courseDetail('123'));
```

## Key Rules

- **Package manager:** ONLY pnpm - never npm/yarn
- **Imports:** Always absolute with `app/` prefix
- **Styling:** TailwindCSS only, no custom classes on shared components
- **Forms:** React Hook Form + Zod + `mode: 'onBlur'`
- **GraphQL:** .gql files → codegen → use generated hooks
- **Error handling:** Apollo handles errors - no try-catch
- **SSR/Loaders:** FORBIDDEN - SPA mode only
- **Icons:** lucide-react only - never inline SVG
- **Lint:** Fix all issues before proceeding
- **Components:** Check existing before creating new
