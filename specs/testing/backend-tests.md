# Backend Tests

## Stack

| Concern | Library |
|---------|---------|
| Runner | `jest` + `ts-jest` |
| HTTP | `supertest` |
| Database | `mongodb-memory-server` (in-memory Mongo) |
| Types | `@types/jest`, `@types/supertest` |

## Directory Layout

```
backend/
  jest.config.js          # preset: ts-jest, testEnvironment: node
  tests/
    setup.ts              # Boots in-memory Mongo, resets collections between tests
    test-app.ts           # Express app factory (no cron, no port binding)
    unit/
      evn-pricing-service.test.ts
      simulator-service.test.ts
      home-service.test.ts
      validate-middleware.test.ts
      error-handler.test.ts
      notification-service.test.ts
    e2e/
      home.e2e.test.ts
      energy.e2e.test.ts
      simulator.e2e.test.ts
```

## Test Lifecycle

`tests/setup.ts` is registered via `setupFilesAfterEnv`:

```typescript
beforeAll → MongoMemoryServer.create() → mongoose.connect(uri)
afterEach → deleteMany({}) on every collection
afterAll  → mongoose.disconnect() + memoryServer.stop()
```

This gives each test a clean database without paying the startup cost per test.

## Scope Split

| Layer | Scope | Rule |
|-------|-------|------|
| **unit** | Pure functions, single-service calls with real in-memory Mongo | No HTTP, no Express router |
| **e2e** | Full request → router → validate → service → DB → response | Always goes through `supertest(app)` |

Services that touch Mongo are tested as **units** with the real in-memory DB
rather than with mocks. This matches the project rule: "integration tests
must hit a real database, not mocks."

## External Services

- **Claude API** — never called. `parseUsageHabits` short-circuits when
  every `usageHabit` is empty; tests always pass `usageHabit: ''`.
- **Slack webhook** — `SLACK_WEBHOOK_URL` is unset by default.
  `notification-service.test.ts` overrides it and mocks `global.fetch`,
  restoring the original env in `afterAll`.
- **node-cron** — the cron scheduler lives in `src/index.ts` which is NOT
  imported by `test-app.ts`, so timers never start.

## Coverage Targets (aspirational)

```
src/services/**      ≥ 80%
src/middleware/**    ≥ 90%
src/routes/**        ≥ 70% (e2e covers routes)
```

Run: `npm run test:coverage`.

## Writing New Tests

- **Unit test** a new service function in `tests/unit/<service-name>.test.ts`
- **E2E test** a new route in `tests/e2e/<domain>.e2e.test.ts` using
  `supertest(createTestApp())`
- If the new route is in a new router, mount it in
  `tests/test-app.ts` as well
- Use the existing seed helpers (`createHomeViaApi`, `seedHome`) as a template
  for data fixtures — prefer API-driven setup over direct model writes to
  exercise the validation layer
