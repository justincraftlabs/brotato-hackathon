# Home Setup Wizard (F1)

## User Story

> As a homeowner, I want to set up my house layout (rooms + appliances) so the app knows what I have.

## Steps

1. **Add Rooms** — Select room types + sizes from a grid
2. **Add Appliances** — Per room, add appliances (name, wattage, hours)
3. **Review & Confirm** — Summary of all rooms/appliances, then save

## Step 1: Room Selection

- Grid of room type cards (icon + label): Bedroom, Living Room, Kitchen, Bathroom, Office, Other
- Tap to add room, tap again to increment count (e.g., 2 Bedrooms)
- Each room gets size selector: Small / Medium / Large
- Size hints: Small (<15m²), Medium (15-25m²), Large (>25m²)
- "Next" button enabled when at least 1 room added

## Step 2: Appliance Input

- Tab per room (horizontal scrollable tabs on mobile)
- Each room shows: "Add Appliance" button + list of added appliances as cards
- Appliance form fields:
  - Name (text input + voice button + camera button)
  - Type (auto-detected from AI, or manual dropdown)
  - Wattage (number input, pre-filled from AI estimation)
  - Daily hours (slider: 0-24h)
  - Usage habit (optional text)
- Quick-add presets: Điều hòa, Tủ lạnh, Máy giặt, Quạt, Đèn, Tivi, Nồi cơm, Máy nước nóng

## Step 3: Review & Confirm

- Summary list: each room with appliance count + estimated monthly kWh/cost
- Total household estimate displayed prominently
- "Confirm" → POST `/api/home/setup` + POST `/api/home/:id/appliances` → save homeId to localStorage → redirect to `/dashboard`

## API Contracts

### POST /api/home/setup

```typescript
// Request
{
  rooms: Array<{
    id: string;
    name: string;
    type: "bedroom" | "living_room" | "kitchen" | "bathroom" | "office" | "other";
    size: "small" | "medium" | "large";
  }>
}

// Response
{ success: true, data: { homeId: string, rooms: Room[] } }
```

### POST /api/home/:homeId/appliances

```typescript
// Request
{
  roomId: string;
  appliances: Array<{
    name: string;
    type: string;
    wattage: number;
    dailyUsageHours: number;
    standbyWattage?: number;
    usageHabit?: string;
  }>
}

// Response
{ success: true, data: { roomId: string, appliances: Appliance[] } }
```

### GET /api/home/:homeId

```typescript
// Response
{
  success: true,
  data: {
    homeId: string,
    rooms: Array<Room & { appliances: Appliance[] }>,
    totalWattage: number,
    estimatedMonthlyKwh: number,
    estimatedMonthlyCost: number
  }
}
```

## Zod Validation Schemas

```typescript
const setupSchema = z.object({
  rooms: z.array(z.object({
    id: z.string(),
    name: z.string().min(1),
    type: z.enum(['bedroom', 'living_room', 'kitchen', 'bathroom', 'office', 'other']),
    size: z.enum(['small', 'medium', 'large']),
  })).min(1),
});

const appliancesSchema = z.object({
  roomId: z.string(),
  appliances: z.array(z.object({
    name: z.string().min(1),
    type: z.string(),
    wattage: z.number().positive(),
    dailyUsageHours: z.number().min(0).max(24),
    standbyWattage: z.number().min(0).optional().default(0),
    usageHabit: z.string().optional().default(''),
  })).min(1),
});
```

## Shared Types

```typescript
type RoomType = "bedroom" | "living_room" | "kitchen" | "bathroom" | "office" | "other";
type RoomSize = "small" | "medium" | "large";

interface Room {
  id: string;
  name: string;
  type: RoomType;
  size: RoomSize;
}

interface Appliance {
  id: string;
  roomId: string;
  name: string;
  type: string;
  wattage: number;
  dailyUsageHours: number;
  standbyWattage: number;
  usageHabit: string;
  monthlyKwh: number;
  monthlyCost: number;
}
```

## Mobile UX

- Full-width cards, large tap targets (min 44px)
- Swipeable steps or stepper indicator at top
- Floating "Next" button fixed at bottom

## Requirements

RFC 2119 keywords: **MUST** (hard constraint) · **SHOULD** (strong default) · **MAY** (optional).

| ID | Requirement |
|----|-------------|
| REQ-SETUP-001 | System **MUST** require at least one room per home setup (`z.array(...).min(1)`). |
| REQ-SETUP-002 | System **MUST** validate room type ∈ `{bedroom, living_room, kitchen, bathroom, office, other}`. |
| REQ-SETUP-003 | System **MUST** validate room size ∈ `{small, medium, large}`. |
| REQ-SETUP-004 | System **MUST** validate appliance wattage is positive (`z.number().positive()`). |
| REQ-SETUP-005 | System **MUST** validate daily usage hours ∈ `[0, 24]`. |
| REQ-SETUP-006 | System **MUST** auto-compute `monthlyKwh = (wattage/1000) * dailyHours * 30` when creating/updating an appliance. |
| REQ-SETUP-007 | API **MUST** return the `{success, data}` / `{success, error}` envelope on every response. |
| REQ-SETUP-008 | `GET /api/home/:homeId` **MUST** return `404` when the home does not exist. |
| REQ-SETUP-009 | User **SHOULD** be able to review the home before saving (Step 3). |
| REQ-SETUP-010 | Mobile tap targets **SHOULD** be ≥44px. |

## Acceptance Criteria

| ID | Criterion | Verifies |
|----|-----------|----------|
| AC-SETUP-001 | Given an empty `rooms` array, when `POST /api/home/setup`, then response is `400` with validation error. | REQ-SETUP-001 |
| AC-SETUP-002 | Given an invalid room `type`, when `POST /api/home/setup`, then response is `400`. | REQ-SETUP-002 |
| AC-SETUP-003 | Given non-positive `wattage`, when `POST /api/home/:homeId/appliances`, then response is `400`. | REQ-SETUP-004 |
| AC-SETUP-004 | Given an unknown `homeId`, when `GET /api/home/:homeId`, then response is `404`. | REQ-SETUP-008 |
| AC-SETUP-005 | Given a valid home with rooms + appliances, when `GET /api/home/:homeId`, then response `data` includes `rooms[].appliances[]` and non-zero `monthlyKwh`. | REQ-SETUP-006, REQ-SETUP-007 |
| AC-SETUP-006 | Given a wattage update to an existing appliance, when persisted, then `monthlyKwh` is recomputed. | REQ-SETUP-006 |

## Boundaries

**In scope**
- Creating a home with rooms and appliances through the 3-step wizard
- Per-appliance CRUD and per-room CRUD under an existing home
- Client-side zod validation mirrored on the server

**Out of scope**
- Authentication / multi-user homes (single-tenant MVP)
- Historical snapshots of home state (only current state is persisted)
- Room floor-plan geometry or appliance positioning

**Ambiguity policy**
- If a field is not listed in the `setupSchema` or `appliancesSchema`, it **MUST NOT** be accepted — strip via `z.object(...).strict()` semantics rather than silently ignoring.
- If the user deletes the last room of a home, the home itself stays; dashboard calculations return zero totals instead of 404.

## Examples

**Valid setup request**
```json
{
  "rooms": [
    { "id": "r1", "name": "Phòng ngủ chính", "type": "bedroom", "size": "medium" }
  ]
}
```

**Invalid — empty rooms**
```json
{ "rooms": [] }
```
→ `400 { success: false, error: "rooms must contain at least 1 element" }`

**Invalid — bad room type**
```json
{ "rooms": [{ "id": "r1", "name": "x", "type": "garage", "size": "small" }] }
```
→ `400` (enum violation)

## Success Criteria

- User can set up a house with 3+ rooms and 5+ appliances in under 2 minutes.
