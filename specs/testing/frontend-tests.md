# Frontend Unit & Component Tests

## Stack

| Concern | Library |
|---------|---------|
| Runner | `jest` via `next/jest` preset |
| DOM | `jest-environment-jsdom` |
| Rendering | `@testing-library/react` |
| User input | `@testing-library/user-event` |
| Matchers | `@testing-library/jest-dom` |

## Directory Layout

Tests are **co-located** next to the source file (`*.test.ts(x)`):

```
frontend/
  jest.config.js
  jest.setup.ts                   # imports @testing-library/jest-dom
  src/
    lib/
      format.ts / format.test.ts
      calculations.ts / calculations.test.ts
      chat-action.ts / chat-action.test.ts
      api.ts / api.test.ts
      utils.ts / utils.test.ts
    hooks/
      useLocalStorage.ts / useLocalStorage.test.tsx
    components/ui/
      button.tsx / button.test.tsx
```

`jest.config.js` excludes `<rootDir>/e2e/` (Playwright) and uses
`testMatch: src/**/*.test.ts(x)`.

## What Gets Unit-Tested

| Category | Example | Why |
|----------|---------|-----|
| Pure formatters | `format.ts`, `calculations.ts` | Deterministic, high-value edge cases |
| Parsers / state reducers | `chat-action.ts` | Complex branching, silent failure modes |
| API client | `api.ts` | Response envelope validation, error handling |
| Tailwind merger | `cn()` in `utils.ts` | Regression-prone |
| Hooks with storage/effects | `useLocalStorage` | SSR-unsafe if done wrong |
| Shared UI primitives | `Button` | Click, disabled, variant, `asChild` |

## What Does NOT Get Unit-Tested

- **Page components** (`app/**/page.tsx`) — covered by Playwright e2e
- **Layouts & providers** — covered by e2e where the full tree mounts
- **Recharts / framer-motion visualizations** — visual output, brittle to unit-test
- **Streaming SSE hooks (`useChat`)** — integration-level concern, e2e only

## Mocking Rules

- **`fetch`** — replaced per-test via `(global as any).fetch = jest.fn()`
- **`localStorage`** — use the real jsdom implementation, clear in `beforeEach`
- **Next.js router** — only needed if a page-level test is added; use
  `next-router-mock` or Playwright instead
- **`next-themes`, context providers** — wrap the render under test with the
  actual provider rather than mocking

## Running

```bash
npm test               # run once
npm run test:watch     # watch mode
npm run test:coverage  # coverage report
```

## Writing New Tests

- Co-locate: `foo.ts` → `foo.test.ts`, `Foo.tsx` → `Foo.test.tsx`
- Assert on user-visible output (`screen.getByRole`), not on implementation
  details like `.props` or class names (exception: Tailwind variant regressions)
- Prefer `userEvent` over `fireEvent` — it simulates real browser semantics
