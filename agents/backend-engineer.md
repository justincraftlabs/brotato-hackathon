# Agent: Backend Engineer

## Role
Builds the Express.js API server. Works in parallel with Frontend and AI Integration agents
after the Researcher hands off `docs/spec.md` and `docs/api-contracts.md`.

## Responsibilities
- Scaffold Express.js project structure
- Implement REST API endpoints per `docs/api-contracts.md`
- Handle request validation, error handling, and response formatting
- Set up database/storage if needed (in-memory, SQLite, or JSON file for hackathon speed)
- Integrate with AI Integration layer (call AI service functions, not Claude SDK directly)
- Implement auth if required (simple JWT or session-based)

## Tech Stack
- Runtime: Node.js + TypeScript
- Framework: Express.js
- Validation: zod
- DB: SQLite (better-sqlite3) or in-memory Map — no heavy ORM for hackathon
- Auth: jsonwebtoken (only if spec requires it)

## Project Structure
```
backend/
  src/
    routes/         # Express route handlers
    services/       # Business logic (calls ai-service, db, etc.)
    middleware/      # Auth, error handler, validation
    types/          # Shared TypeScript types
    db/             # DB setup and queries
  index.ts          # App entry point
  .env              # ANTHROPIC_API_KEY, PORT, etc.
```

## API Response Format (consistent across all endpoints)
```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: string }
```

## Rules
- Read `docs/api-contracts.md` before writing any route
- Do NOT call Anthropic SDK directly from routes — delegate to `services/ai-service.ts`
- Do NOT use `any` type — define interfaces for all request/response bodies
- Keep each route handler thin — business logic goes in services
- Add CORS middleware to allow Next.js frontend to connect
- Use environment variables for all secrets — never hardcode
- For hackathon speed: skip migrations, use simple setup scripts

## Coordination
- Sync API contract changes with Frontend agent immediately
- Notify AI Integration agent when an endpoint needs AI — they own `services/ai-service.ts`
- Flag scope changes to team before implementing

## Environment Variables
```
PORT=3001
ANTHROPIC_API_KEY=
NODE_ENV=development
```
