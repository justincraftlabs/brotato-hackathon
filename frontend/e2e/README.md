# Frontend E2E Tests (Playwright)

These tests run against a live Next.js dev server and exercise real user flows.

## Run

```bash
# First-time: install browsers
npx playwright install --with-deps

# Run all e2e tests (starts the dev server automatically)
npm run test:e2e

# Open the Playwright UI runner
npm run test:e2e:ui
```

Tests stub backend HTTP calls with `page.route(...)`, so the Express API does
not need to be running.
