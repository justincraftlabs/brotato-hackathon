# Backend Domain

**Owner:** Backend Engineer agent

## Scope

REST API server, data persistence, validation, and integration with the AI service layer.

## Owned Files

- `api-spec.md` — Detailed endpoint definitions, zod schemas, error codes
- `backend-plan.md` — (optional) Task breakdown for the backend engineer

## File Ownership in Repo

```
backend/
  src/
    routes/
    services/        (except ai-service.ts — owned by AI Integration)
    middleware/
    types/
    db/
  index.ts
  .env
```

## Dependencies

- `specs/research/api-contracts.md` — endpoints to implement
- `specs/research/tech-stack.md` — DB and auth decisions
- `standards/code-conventions.md` — response envelope, validation rules
- `standards/architecture.md` — port, service boundaries
