# Backend Tests

Test stack: **Jest + ts-jest + supertest + mongodb-memory-server**.

```bash
npm install          # installs new devDeps (jest, ts-jest, supertest, ...)
npm test             # run all tests
npm run test:unit    # unit only
npm run test:e2e     # HTTP e2e only (runs in band to avoid port/db collisions)
npm run test:coverage
```

## Layout

```
tests/
  setup.ts              # Starts an in-memory MongoDB and resets data between tests
  test-app.ts           # Builds an Express app without cron/port binding — for supertest
  unit/                 # Pure-function + service unit tests
  e2e/                  # HTTP-level tests against a supertest-mounted app
```

## Notes

- **No external services are touched.** The `@anthropic-ai/sdk` is only hit
  when `usageHabit` is non-empty; tests pass empty habits to stay offline.
- The cron scheduler in `src/index.ts` is not imported by `test-app.ts`,
  so tests never start a timer.
- `SLACK_WEBHOOK_URL` is unset by default — notification tests override it
  explicitly and restore the original value in `afterAll`.
