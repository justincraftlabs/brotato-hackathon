# Testing Domain

**Cross-cutting concern** — applies to all features.

## Scope

Automated test strategy for the monorepo. Defines the test stack, directory
layout, and scope boundaries for **unit** and **e2e** tests on both the
Express backend and the Next.js frontend.

Out of scope: performance/load testing, visual regression, accessibility audits.

## Specs

- [backend-tests.md](backend-tests.md) — Jest + supertest + mongodb-memory-server
- [frontend-tests.md](frontend-tests.md) — Jest + React Testing Library
- [e2e-tests.md](e2e-tests.md) — Playwright against the Next.js app

## Dependencies

- All feature specs — tests verify the contracts they define
- `standards/code-conventions.md` — response envelope shape asserted in tests
- `standards/architecture.md` — ports, SSE, service boundaries

## Principles

1. **Hermetic** — no network, no external Mongo, no Claude API calls during tests
2. **Fast feedback** — unit tests run in < 10s; e2e tests only on CI and local opt-in
3. **Real infrastructure where it matters** — e2e tests use `mongodb-memory-server`
   (not mocks) to catch real Mongoose query bugs
4. **Test behavior, not implementation** — assert on HTTP envelopes and
   user-visible output, not on internal function call counts

## Commands

```bash
# Backend
cd backend
npm test                  # all tests
npm run test:unit         # unit only
npm run test:e2e          # HTTP e2e (runs in band)
npm run test:coverage

# Frontend
cd frontend
npm test                  # Jest unit + component tests
npm run test:e2e          # Playwright (auto-starts dev server)
npm run test:e2e:ui       # Playwright UI runner
```

## File Ownership

```
backend/jest.config.js
backend/tests/**
frontend/jest.config.js
frontend/jest.setup.ts
frontend/playwright.config.ts
frontend/e2e/**
frontend/src/**/*.test.ts(x)   # co-located unit tests
```
