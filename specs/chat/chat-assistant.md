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

## Success Criteria

- AI assistant gives at least 3 personalized, actionable tips
