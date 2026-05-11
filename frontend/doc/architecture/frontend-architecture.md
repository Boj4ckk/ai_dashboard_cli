# Frontend Architecture
> Read this before writing any frontend code. These rules are non-negotiable.

---

## Pattern: Feature-Driven Architecture

The codebase is organized by **feature**, not by file type. Each feature is a self-contained vertical slice with its own API layer, components, hooks, and types. Nothing leaks across layers.

```
src/
├── features/
│   └── {feature}/
│       ├── api/          ← HTTP calls only
│       ├── components/   ← UI only
│       ├── hooks/        ← business logic, calls api/
│       └── types.ts      ← types scoped to this feature
├── pages/                ← route entry points, compose features
├── styles/               ← global tokens, resets
└── main.tsx
```

---

## The 3 Layers — Never Cross Them

### Layer 1 — `api/`
**What:** Raw HTTP calls to the backend. One function per endpoint.  
**Rules:**
- Only `fetch` / axios / SDK calls here. No React, no state.
- Returns typed response objects or throws typed errors.
- Reads env vars (`import.meta.env.VITE_*`) here and nowhere else.
- Never import from `hooks/` or `components/`.

```ts
// features/dashboard/api/dashboardApi.ts
export async function submitPrompt(payload: SubmitPromptPayload): Promise<SubmitPromptResponse> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/prompt`, { ... });
  if (!res.ok) throw new ApiError(res.status);
  return res.json();
}
```

---

### Layer 2 — `hooks/`
**What:** Business logic. The only layer that calls `api/` and holds feature state.  
**Rules:**
- All `useState`, `useEffect`, `useCallback` that involve data fetching or business rules live here.
- Calls functions from `api/`. Never calls `fetch` directly.
- Returns state + handlers to components — no JSX.
- Never import from `components/`.

```ts
// features/dashboard/hooks/useDashboard.ts
import { submitPrompt } from '../api/dashboardApi';

export function useDashboard() {
  const [frames, setFrames] = useState<FrameData[]>([]);
  // ...
  async function handleSubmit(prompt: string) {
    await submitPrompt({ prompt, frameId, width, height });
  }
  return { frames, handleSubmit, ... };
}
```

---

### Layer 3 — `components/`
**What:** Pure UI. Receives props, renders JSX, emits callbacks.  
**Rules:**
- No `fetch`, no direct api/ imports — ever.
- Local UI state only (`isHovered`, `inputValue`). Never business state.
- Consumes hooks via props passed down from `pages/` or a parent component.
- Reusable across the feature but not across features (use `src/components/` for that).

```tsx
// features/dashboard/components/Frame.tsx
interface FrameProps { frame: FrameData; onSelect: () => void; ... }
export function Frame({ frame, onSelect }: FrameProps) { ... }
```

---

## Pages

`src/pages/` are route entry points only. They:
- Call hooks to get state and handlers.
- Compose feature components.
- Lift shared state that multiple components need.
- Contain no business logic and no fetch calls.

```tsx
// pages/dashboard.tsx
export default function DashboardPage() {
  const { frames, agentState, handleSubmit, ... } = useDashboard();
  return (
    <>
      <Topbar ... />
      <CanvasHost frames={frames} ... />
      <PromptBar onSubmit={handleSubmit} agentState={agentState} ... />
    </>
  );
}
```

---

## Types

`features/{feature}/types.ts` — types scoped to that feature. No business logic.  
- Shared primitive types (used by 2+ features) go in `src/types/shared.ts`.
- Never put types inside component or hook files — always import from `types.ts`.

---

## Dependency Direction (strict)

```
pages → hooks → api
pages → components
components ← props only (no direct hook imports inside components unless it's a pure UI hook like useRef)
```

Visualized as a dependency rule:

| From \ To       | api | hooks | components | pages |
|-----------------|-----|-------|------------|-------|
| **api**         | ✓   | ✗     | ✗          | ✗     |
| **hooks**       | ✓   | ✓     | ✗          | ✗     |
| **components**  | ✗   | ✗     | ✓          | ✗     |
| **pages**       | ✗   | ✓     | ✓          | —     |

---

## Cross-feature Rules

- Features do **not** import from each other directly.
- Shared UI primitives (Button, Modal, etc.) live in `src/components/ui/`.
- Shared types live in `src/types/shared.ts`.
- Shared hooks (auth, theme) live in `src/hooks/`.

---

## Violations to Avoid

| Anti-pattern | Why it's forbidden |
|---|---|
| `fetch()` inside a component | Bypasses the api layer, untestable |
| Importing `api/` directly in a component | Skips the hook layer, logic leaks into UI |
| Business logic in `pages/` | Pages are composers, not controllers |
| Shared state in a component file | Belongs in a hook or page |
| Types defined inline in component props | Breaks discoverability, use `types.ts` |
| Cross-feature imports (`features/a` → `features/b`) | Creates hidden coupling |
