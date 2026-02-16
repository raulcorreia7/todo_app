# AI Agent Instructions

Instructions for AI tools working on this codebase.

## Architecture

This is a SolidJS application using fine-grained reactivity. The architecture follows:

- **Stores** - Reactive state management using Solid signals and stores
- **Services** - Business logic for AI, audio, storage
- **Components** - UI components organized by feature

## Key Patterns

### Stores

Located in `src/stores/`. Each store exports:

- A reactive store/state signal
- Actions for modifying state

```typescript
export const taskStore = /* reactive store */;
export const taskActions = {
  addTask,
  removeTask,
  toggleTask,
};
```

### Components

Components use SolidJS reactivity:

- Use `createSignal` for local state
- Use `createEffect` for side effects
- Access store values directly in JSX for reactivity

### Services

Located in `src/services/`. Pure functions and async operations:

- `ai.ts` - AI/LLM integration
- `audio.ts` - Sound effects
- `music.ts` - Background music
- `storage.ts` - LocalStorage persistence

## Import Conventions

Use the `@/` alias for src imports:

```typescript
import { taskStore } from "@/stores/taskStore";
import { Button } from "@/components/base";
```

## Testing

- Unit tests in `tests/unit/` using Vitest and @solidjs/testing-library
- E2E tests using Playwright
- Run before committing: `pnpm run test`

## Before Committing

Always run:

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
```

Fix any errors before creating a commit.
