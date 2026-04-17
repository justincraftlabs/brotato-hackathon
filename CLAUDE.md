# CLAUDE.md — Brotato Hackathon

## Project Overview

16-hour hackathon. Stack: Next.js 14 frontend, Express.js backend, Claude Sonnet AI. Four concurrent agent roles build in parallel after the Researcher delivers specs.

## Cross-Cutting Standards

Load these once. They apply to every domain.

- [Code Conventions](standards/code-conventions.md) — TypeScript rules, naming, API envelope, fetch discipline
- [Architecture](standards/architecture.md) — System topology, ports, SSE streaming, model selection
- [Git Policies](standards/git-policies.md) — Branch strategy, commit format, merge rules

## Domain Specs

Organized by agent ownership, not implementation order.

| Domain | Spec Folder | Owner |
|--------|-------------|-------|
| Research (runs first) | [specs/research/](specs/research/README.md) | Researcher agent |
| Frontend | [specs/frontend/](specs/frontend/README.md) | Frontend Engineer agent |
| Backend | [specs/backend/](specs/backend/README.md) | Backend Engineer agent |
| AI Integration | [specs/ai/](specs/ai/README.md) | AI Integration agent |

## Agent Role Definitions

Full role instructions live in `agents/`:

- [agents/researcher.md](agents/researcher.md)
- [agents/frontend-engineer.md](agents/frontend-engineer.md)
- [agents/backend-engineer.md](agents/backend-engineer.md)
- [agents/ai-integration.md](agents/ai-integration.md)

## Execution Order

1. **Researcher** completes `specs/research/` (Hours 0–2)
2. **Frontend**, **Backend**, and **AI Integration** run in parallel (Hours 2–14)
3. Integration and demo polish (Hours 14–16)
