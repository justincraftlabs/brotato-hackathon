# Research Domain

**Owner:** Researcher agent (Hours 0–2)

## Scope

This domain defines what the team builds. All other domains depend on it before writing code. The Researcher runs first and delivers all files in this directory before parallel development begins.

## Owned Files

- `spec.md` — Product spec: feature list, user stories, scope cuts
- `api-contracts.md` — FE↔BE API contracts (endpoints, request/response shapes)
- `ai-design.md` — Claude AI use case: system prompts, I/O, model selection rationale
- `tech-stack.md` — Confirmed tech decisions with brief rationale

## Dependencies

None — this domain has no upstream dependencies. All other domains depend on it.

## Handoff Signal

When all four files above are committed to `feat/research` and merged to `main`, parallel development can begin.
