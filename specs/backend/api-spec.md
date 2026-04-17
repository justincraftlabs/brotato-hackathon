# Backend API Spec

> **Status: TO BE FILLED BY BACKEND ENGINEER (after research/api-contracts.md is ready)**

## Endpoint Details

<!-- Expand each contract from api-contracts.md with: zod schema, error codes, middleware needed -->

### POST /example

**Middleware:** 
**zod schema:**
```typescript
z.object({
  field: z.string().min(1),
})
```
**Success response:** `{ success: true, data: { result: string } }`
**Error codes:**
- `400` — validation failure
- `500` — internal error

---

## Database Schema

<!-- Table definitions or in-memory structure -->

## Middleware Stack

<!-- List middleware applied globally vs per-route -->
