# AI Chat — Trợ Lý Khoai Tây (F3)

## User Story

> As a homeowner, I want personalized savings tips from an AI assistant so I can act immediately.

## Persona

**"Trợ Lý Khoai Tây"** (Brotato Assistant) — witty, eco-friendly energy expert speaking Vietnamese.

- Friendly, humorous, casual Vietnamese language
- Passionate about saving energy and the environment
- Uses analogies Vietnamese people relate to (cà phê, xe máy, tiền điện)
- Occasionally makes potato-related jokes
- Enthusiastic but concise

## API Contract

### POST /api/ai/chat (SSE)

```typescript
// Request
{
  homeId: string;
  message: string;
  sessionId?: string;
}

// Response: SSE stream
//   data: <text chunk>     — text delta
//   data: [DONE]           — stream complete
//   data: [ERROR] <message> — error
//
// Header: X-Session-Id: <sessionId>
```

## Conversation Pattern

- **Multi-turn** — maintains conversation history per session
- Home data injected in system context (not visible to user)
- History truncated to last 20 messages
- Session stored in MongoDB (`chat-session.model.ts`)

## System Prompt (`prompts/chat-assistant.ts`)

Key rules:
1. Always respond in Vietnamese unless user writes in English
2. Keep responses under 200 words
3. Always include specific numbers when giving savings advice (kWh or VND)
4. Gently redirect if asked about non-energy topics
5. Only reference appliances that exist in the user's home
6. Use CO2 emission factor: 0.913 kg CO2/kWh
7. When suggesting upgrades, include reference price and payback period

EVN pricing tiers included in prompt for accurate cost calculations.

## AI Service Interface

```typescript
export async function streamChat(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  homeContext: string,
  onChunk: (chunk: string) => void
): Promise<void>
```

- Model: `claude-sonnet-4-6`
- max_tokens: 64,000
- Streaming via `client.messages.stream()`

## SSE Route Logic

1. Set SSE headers (`Content-Type: text/event-stream`, `Cache-Control: no-cache`)
2. Get/create chat session in MongoDB
3. Build home context string from stored home data
4. Append user message to session history
5. Stream AI response, pipe chunks to response
6. Save assistant response to session history
7. Truncate history if >20 messages
8. End with `[DONE]`

## Frontend Layout

- Full-screen chat interface (messaging app style)
- Chat bubbles: user (right, accent color) + AI (left, green)
- Input bar at bottom: text input + mic button + send button
- On first visit: AI sends welcome message + pre-loaded recommendation cards
- Streaming text renders character-by-character with typing indicator

## Edge Cases

| Scenario | Handling |
|----------|----------|
| AI goes off-topic | System prompt includes redirect instruction |
| Very long history | Truncate to last 20 messages |
| Empty home data | Return generic starter tips + prompt to set up home |
| Streaming error | Error message in bubble + retry option |

## Requirements

RFC 2119 keywords: **MUST** · **SHOULD** · **MAY**.

| ID | Requirement |
|----|-------------|
| REQ-CHAT-001 | Assistant **MUST** respond in Vietnamese unless the user writes in English. |
| REQ-CHAT-002 | Each response **SHOULD** stay under 200 words. |
| REQ-CHAT-003 | Savings advice **MUST** include specific numbers (kWh or VND). |
| REQ-CHAT-004 | Assistant **MUST** only reference appliances present in the user's home. |
| REQ-CHAT-005 | Session history **MUST** be truncated to the most recent 20 messages before calling Claude. |
| REQ-CHAT-006 | SSE response headers **MUST** set `Content-Type: text/event-stream` and `Cache-Control: no-cache`. |
| REQ-CHAT-007 | The SSE stream **MUST** terminate with a `[DONE]` sentinel. |
| REQ-CHAT-008 | On streaming failure, the stream **MUST** emit `[ERROR] <message>` before closing. |
| REQ-CHAT-009 | Chat sessions **MUST** be persisted in MongoDB via `chat-session.model.ts`. |
| REQ-CHAT-010 | Frontend **MUST NOT** call Claude directly — all traffic goes through `POST /api/ai/chat`. |

## Acceptance Criteria

| ID | Criterion | Verifies |
|----|-----------|----------|
| AC-CHAT-001 | Given a Vietnamese prompt and a valid `homeId`, when `POST /api/ai/chat`, then the first streamed chunk arrives within 3s and is Vietnamese. | REQ-CHAT-001 |
| AC-CHAT-002 | Given a session with 25 prior messages, when a new message arrives, then the stored history sent to Claude contains only the latest 20. | REQ-CHAT-005 |
| AC-CHAT-003 | Given an empty home (no appliances), when chat is invoked, then the assistant returns a generic starter tip and prompts setup. | REQ-CHAT-004 |
| AC-CHAT-004 | Given a streaming error, when it occurs mid-stream, then the client receives `[ERROR] ...` and the connection closes. | REQ-CHAT-008 |
| AC-CHAT-005 | Given the SSE response, when inspected, then it has headers `Content-Type: text/event-stream` and `Cache-Control: no-cache`. | REQ-CHAT-006 |
| AC-CHAT-006 | Given a completed stream, when the final event fires, then the last data chunk is `[DONE]`. | REQ-CHAT-007 |

## Boundaries

**In scope**
- Multi-turn conversation per `sessionId` with truncated history
- Vietnamese-first persona "Trợ Lý Khoai Tây"
- Pre-loaded recommendation cards on first visit to `/chat`

**Out of scope**
- Cross-session memory (each `sessionId` is isolated)
- Uploading images or PDFs in chat (use the separate `/recognize-appliance` endpoint)
- Tool use / function calling from the chat endpoint
- Auth / user accounts

**Ambiguity policy**
- If `sessionId` is omitted, create a new one and return it via `X-Session-Id` header.
- If Claude returns an off-topic response, **do not** post-process client-side; rely on the system prompt instead.

## Examples

**Valid request**
```json
{
  "homeId": "65f0a1b2...",
  "message": "Tủ lạnh nhà tôi tốn điện không?",
  "sessionId": "c4d1..."
}
```

**Valid stream (abbreviated)**
```
data: Chào bạn! Tủ lạnh nhà bạn đang tiêu ~45 kWh/tháng...
data: ...tương đương khoảng 90.000đ.
data: [DONE]
```

**Invalid — non-existent homeId**
```
POST /api/ai/chat { "homeId": "000000000000000000000000", ... }
→ stream emits [ERROR] Home not found, then closes
```

## Success Criteria

- AI assistant gives at least 3 personalized, actionable tips.
