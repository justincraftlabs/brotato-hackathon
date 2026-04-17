# AI Integration Domain

**Owner:** AI Integration agent

## Scope

All Claude-related backend functionality: the AI service, system prompts, streaming endpoints, and conversation history management.

## Owned Files

- `ai-spec.md` — Prompt designs, model selection, I/O contracts, streaming protocol
- `ai-plan.md` — (optional) Task breakdown for the AI integration engineer

## File Ownership in Repo

```
backend/src/services/ai-service.ts    # Main AI service
backend/src/routes/ai.ts              # AI-specific routes (SSE streaming)
backend/src/prompts/                  # System prompts as .ts constants
```

## Dependencies

- `specs/research/ai-design.md` — use case, prompts, model choices
- `specs/research/api-contracts.md` — AI endpoint contracts
- `standards/code-conventions.md` — TypeScript, no `any`, env var rules
- `standards/architecture.md` — SSE streaming pattern, model selection guide
