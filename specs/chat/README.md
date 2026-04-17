# Chat Domain

**Features:** F3 (AI Chat with Trợ Lý Khoai Tây)

## Scope

AI-powered chat assistant and energy recommendations. Includes the "Trợ Lý Khoai Tây" persona, streaming SSE responses, structured recommendation generation, and conversation history management.

## Specs

- [chat-assistant.md](chat-assistant.md) — Streaming AI chat with Khoai Tây persona
- [recommendations.md](recommendations.md) — Structured per-appliance energy saving tips

## Dependencies

- `specs/home-setup/` — needs home context for personalized advice
- `specs/energy/` — references EVN pricing and CO2 calculations
- `standards/architecture.md` — SSE streaming pattern
- `standards/tech-stack.md` — Claude model selection

## API Endpoints (this domain)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/ai/chat` | SSE streaming chat with Khoai Tây |
| POST | `/api/ai/recommendations` | Structured recommendation generation |

## File Ownership

```
backend/src/routes/ai.ts
backend/src/services/ai-service.ts
backend/src/prompts/chat-assistant.ts
backend/src/prompts/recommendation.ts
backend/src/models/chat-session.model.ts
backend/src/types/ai.ts
frontend/src/app/chat/page.tsx
frontend/src/components/chat/*
frontend/src/hooks/useChat.ts
```
