# Frontend Domain

**Owner:** Frontend Engineer agent

## Scope

UI, routing, component library, and state management. The frontend communicates with the backend exclusively through `lib/api.ts`.

## Owned Files

- `ui-spec.md` — Page-by-page UI requirements, component breakdown
- `frontend-plan.md` — (optional) Task breakdown for the frontend engineer

## File Ownership in Repo

```
frontend/
  app/
  components/
  lib/api.ts
  lib/types.ts
  public/
```

## Dependencies

- `specs/research/spec.md` — feature list and user stories
- `specs/research/api-contracts.md` — backend endpoints to call
- `standards/code-conventions.md` — naming and fetch rules
- `standards/architecture.md` — port and SSE streaming pattern
