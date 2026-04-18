# Frontend E2E Tests (Playwright)

## Stack

| Concern | Library |
|---------|---------|
| Runner | `@playwright/test` |
| Browsers | Chromium (desktop) + Pixel 5 (mobile) |
| App under test | Next.js dev server, auto-started by Playwright |

## Directory Layout

```
frontend/
  playwright.config.ts
  e2e/
    README.md
    landing.spec.ts
    setup-wizard.spec.ts
    dashboard.spec.ts
```

`e2e/*.spec.ts` is excluded from the Jest runner via `testPathIgnorePatterns`
so unit and e2e do not collide.

## Config Highlights

```typescript
// playwright.config.ts
baseURL: "http://localhost:3000"
webServer: { command: "npm run dev", url: baseURL, reuseExistingServer: !CI }
projects: [
  { name: "chromium", use: devices["Desktop Chrome"] },
  { name: "mobile",   use: devices["Pixel 5"] },       // mobile-first app
]
retries: CI ? 2 : 0
```

The mobile project exists because E-LUMI-NATE is mobile-first — e2e tests
must catch viewport-specific regressions (BottomNav, Sheet drawers, etc.).

## Backend Strategy

**Default: stub.** Tests use `page.route("**/api/...")` to mock backend
responses. Playwright does not require the Express backend to be running.

This keeps e2e tests:
- Fast (no Mongo, no Claude latency)
- Deterministic (no reliance on seeded state)
- Runnable in CI without standing up a DB

For future scenarios that need **real** backend integration, a dedicated
`e2e-integration/` folder can be added that boots the full stack via
`docker-compose`.

## Test Coverage (current)

| Spec | Covers |
|------|--------|
| `landing.spec.ts` | Hero render, Get Started CTA, conditional "Back to Dashboard" based on `localStorage.homeId` |
| `setup-wizard.spec.ts` | `/setup` loads, landing → setup navigation |
| `dashboard.spec.ts` | `/dashboard` renders against stubbed `/api/energy/:homeId/dashboard` |

## Running

```bash
# First-time: install browsers
npx playwright install --with-deps

# All projects
npm run test:e2e

# Interactive runner
npm run test:e2e:ui

# Single project
npx playwright test --project=mobile
```

## Writing New Tests

- Stub any backend call the page makes — otherwise tests will time out on
  real HTTP
- Seed `localStorage` via `page.addInitScript(() => window.localStorage.setItem(...))`
  BEFORE `page.goto()` — the app's `(app)/layout.tsx` reads `homeId` on mount
- Use `getByRole` over CSS selectors — resilient to class/layout changes
- Verify both **Chromium desktop** and **mobile Pixel 5** for any UI that
  changes at the `sm:` breakpoint
