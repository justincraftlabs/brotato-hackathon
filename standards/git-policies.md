# Git Policies

## Branch Strategy

Each agent works on its own branch to avoid conflicts during parallel development.

| Agent | Branch |
|-------|--------|
| Researcher | `feat/research` |
| Frontend Engineer | `feat/frontend` |
| Backend Engineer | `feat/backend` |
| AI Integration | `feat/ai` |

Branches diverge from `main` after the Researcher delivers `specs/research/` outputs.

## Merge Rules

- Do **not** merge to `main` until `specs/research/` files are complete and committed.
- Agents may merge to `main` independently once their domain is working and integrated.
- Resolve conflicts by pulling `main` into the feature branch first.

## Commit Format

```
type(scope): short description
```

| Type | When |
|------|------|
| `feat` | New functionality |
| `fix` | Bug fix |
| `chore` | Config, deps, scaffolding |
| `docs` | Spec or documentation only |
| `refactor` | No behavior change |

Examples:
```
feat(backend): add /api/chat endpoint with streaming
fix(frontend): handle empty AI response gracefully
docs(research): complete api-contracts.md
```

## General Rules

- Commit frequently — at least after each working unit.
- Never commit `.env` files or `node_modules/`.
- Keep commits focused; avoid mixing spec changes with code changes.
