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

## Success Criteria

- User can set up a house with 3+ rooms and 5+ appliances in under 2 minutes
