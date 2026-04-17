# Code Conventions

## Language

- TypeScript everywhere — frontend and backend. No JavaScript files.
- Never use `any`. Use `unknown` and narrow, or define a proper type.

## Naming

| Thing | Convention | Example |
|-------|-----------|---------|
| Variables / functions | camelCase | `getUserById` |
| Classes / types / interfaces | PascalCase | `UserResponse` |
| Files | kebab-case | `user-service.ts` |
| React components | PascalCase file + export | `UserCard.tsx` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_TOKENS` |

## API Response Envelope

All backend endpoints return the same shape:

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: string }
```

Never return raw objects or arrays at the top level.

## Environment Variables

- All secrets and config go in `.env` files — never hardcode.
- Frontend: prefix with `NEXT_PUBLIC_` only if the value is safe to expose to the browser.
- Backend: `ANTHROPIC_API_KEY`, `PORT`, `NODE_ENV`.

## Frontend Rules

- Never call `fetch` directly inside a component. Route all backend calls through `lib/api.ts`.
- One component per file.
- Keep components small — extract logic into hooks (`use*.ts`) and utilities (`lib/`).

## Backend Rules

- Validate all request input with `zod` at the route handler boundary.
- Services must not import from routes; routes may import from services.
- Keep route handlers thin — business logic lives in `services/`.

## Comments

Write comments only when the *why* is non-obvious. Avoid restating what the code already says.
