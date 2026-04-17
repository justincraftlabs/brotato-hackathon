# Architecture

## System Overview

```
Browser (Next.js 14 App Router)
        │  HTTP / SSE
        ▼
Express.js API Server
        │  @anthropic-ai/sdk
        ▼
Claude API (claude-sonnet-4-6)
        │
        ▼
MongoDB (mongoose)
```

## Ports

| Service | Port |
|---------|------|
| Frontend (Next.js) | 3000 |
| Backend (Express) | 3001 |

## Component Boundaries

- **Frontend** owns all UI, routing, and state. It never calls Claude directly.
- **Backend** owns all business logic, data persistence, and AI calls.
- **AI Integration** is a service layer inside the backend (`services/ai-service.ts`). Routes call it; it owns all prompt design.

## Data Persistence

Use **MongoDB** (`mongoose`) for all persistent data: homes, rooms, appliances, chat sessions. Flexible schema fits the hackathon pace. Connection string via `MONGODB_URI` env var.

## Streaming (SSE)

AI responses stream via Server-Sent Events:

1. Frontend opens `EventSource` to a backend route (e.g., `POST /api/ai/stream` with a `ReadableStream` body, or `GET /api/ai/stream?...`).
2. Backend sets headers:
   ```
   Content-Type: text/event-stream
   Cache-Control: no-cache
   Connection: keep-alive
   ```
3. Backend pipes Claude's stream to the response as `data: <chunk>\n\n` events.
4. Frontend accumulates chunks into displayed text.

## Auth Boundary

If authentication is required, JWT tokens are issued by the backend and validated in Express middleware. The frontend stores the token in memory (not `localStorage`) for the hackathon demo.

## Model Selection

| Use case | Model |
|----------|-------|
| Chat, Q&A, generation | `claude-sonnet-4-6` |
| Complex multi-step reasoning | `claude-opus-4-6` |
| Classification, tagging | `claude-haiku-4-5` |
