# AI Integration Spec

> **Status: TO BE FILLED BY AI INTEGRATION AGENT (after research/ai-design.md is ready)**

## Service Interface

<!-- Define the TypeScript interface for ai-service.ts -->

```typescript
// backend/src/services/ai-service.ts
export async function chat(params: {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}): Promise<string>

export async function streamChat(params: {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  onChunk: (chunk: string) => void;
}): Promise<void>
```

## Prompt Registry

<!-- One entry per system prompt. Reference research/ai-design.md for content. -->

| Constant name | File | Use case |
|---------------|------|----------|
| `SYSTEM_PROMPT` | `prompts/main.ts` | TBD |

## SSE Route Contract

**Endpoint:** `POST /api/ai/stream`
**Request:** `{ message: string, sessionId?: string }`
**SSE events:**
- `data: <chunk>` — text delta
- `data: [DONE]` — stream complete
- `data: [ERROR] <message>` — error

## Token Limits

| Endpoint | max_tokens |
|----------|-----------|
| Standard | 16000 |
| Streaming | 64000 |
