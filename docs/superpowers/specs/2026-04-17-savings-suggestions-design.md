# Design: Gợi ý tiết kiệm (Savings Suggestions)

**Date:** 2026-04-17
**Status:** Approved

---

## Overview

A new independent page (`/savings-suggestions`) that displays AI-generated energy-saving suggestions organized by room and device. Triggered automatically on first visit; cached in MongoDB and refreshed on demand.

---

## Data Flow

```
User visits /savings-suggestions
  → POST /api/ai/savings-suggestions { homeId, forceRefresh: false }
      → Backend fetches Home from MongoDB
      → If home.savingsSuggestions exists and !forceRefresh: return cached
      → Else: call Claude → parse JSON → save to home.savingsSuggestions → return
  → Frontend renders accordion UI

User clicks "Phân tích lại"
  → POST /api/ai/savings-suggestions { homeId, forceRefresh: true }
      → Always calls Claude, overwrites cache
```

---

## Types

Both `backend/src/types/ai.ts` and `frontend/src/lib/types.ts` get these interfaces:

```typescript
interface DeviceSuggestion {
  applianceName: string;
  tip: string;            // AI-written action in Vietnamese
  savingsKwh: number;
  savingsVnd: number;
  priority: 'high' | 'medium' | 'low';
}

interface RoomSuggestion {
  roomName: string;
  roomType: string;
  summary: string;        // AI-written room-level overview in Vietnamese
  totalSavingsKwh: number;
  totalSavingsVnd: number;
  devices: DeviceSuggestion[];
}

interface SavingsSuggestionsResult {
  rooms: RoomSuggestion[];
  grandTotalSavingsKwh: number;
  grandTotalSavingsVnd: number;
  analyzedAt: string;     // ISO timestamp
}
```

---

## Backend Changes

### `backend/src/types/ai.ts`
Add `DeviceSuggestion`, `RoomSuggestion`, `SavingsSuggestionsResult`.

### `backend/src/prompts/savings-suggestions.ts`
New file. Export `SAVINGS_SUGGESTIONS_SYSTEM_PROMPT` — instructs Claude to:
- Act as "Trợ Lý Khoai Tây", friendly and Vietnamese
- Analyze all rooms and appliances from the provided home JSON
- Return strict JSON matching `SavingsSuggestionsResult` (no markdown wrapper)
- Include EVN pricing tiers for accurate VND estimates
- Skip devices with insufficient data (no tip, 0 savings)
- Write `summary` as a concise room-level insight (1-2 sentences)
- Write `tip` as a concrete actionable step per device

Also export `SAVINGS_SUGGESTIONS_RETRY_PROMPT` for JSON parse recovery.

### `backend/src/services/ai-service.ts`
Add `generateSavingsSuggestions(home: Home): Promise<SavingsSuggestionsResult>`:
- Follows same pattern as `generateRecommendations`
- Uses `SAVINGS_SUGGESTIONS_SYSTEM_PROMPT`
- Sends full home JSON as user message
- Strips markdown wrapper, parses JSON
- Retries once with `SAVINGS_SUGGESTIONS_RETRY_PROMPT` on parse failure

### `backend/src/models/home.model.ts`
Add optional field to Home schema:
```typescript
savingsSuggestions: { type: Schema.Types.Mixed, required: false }
```

### `backend/src/routes/ai.ts`
Add `POST /api/ai/savings-suggestions`:
- Validate `{ homeId: string, forceRefresh?: boolean }` with Zod
- Fetch home via `getHome(homeId)` — 404 if not found
- If `home.savingsSuggestions` exists and `!forceRefresh`: return cached result immediately
- Else: call `generateSavingsSuggestions(home)`, save to `home.savingsSuggestions` + `home.save()`, return result
- Return `{ success: true, data: SavingsSuggestionsResult }`

---

## Frontend Changes

### `frontend/src/lib/types.ts`
Mirror `DeviceSuggestion`, `RoomSuggestion`, `SavingsSuggestionsResult`.

### `frontend/src/lib/api.ts`
```typescript
getSavingsSuggestions(homeId: string, forceRefresh?: boolean): Promise<ApiResponse<SavingsSuggestionsResult>>
// POST /api/ai/savings-suggestions { homeId, forceRefresh }
// forceRefresh=false (default): returns cached result if available
// forceRefresh=true: always calls Claude and overwrites cache
```

### `frontend/src/lib/translations.ts`
Add keys (VI / EN):
- `NAV_SAVINGS_SUGGESTIONS` — "Gợi ý" / "Suggestions"
- `SAVINGS_SUGGESTIONS_TITLE` — "Gợi ý tiết kiệm" / "Savings Suggestions"
- `SAVINGS_SUGGESTIONS_ANALYZING` — "Đang phân tích..." / "Analyzing..."
- `SAVINGS_SUGGESTIONS_REANALYZE` — "Phân tích lại" / "Re-analyze"
- `SAVINGS_SUGGESTIONS_RETRY` — "Thử lại" / "Retry"
- `SAVINGS_SUGGESTIONS_NO_HOME` — "Vui lòng thiết lập nhà trước" / "Please set up your home first"
- `SAVINGS_SUGGESTIONS_GRAND_TOTAL` — "Tổng tiết kiệm ước tính" / "Estimated total savings"
- `SAVINGS_SUGGESTIONS_PER_MONTH` — "/tháng" / "/month"

### `frontend/src/lib/constants.ts`
Add to `NAV_ROUTES`:
```typescript
SAVINGS_SUGGESTIONS: '/savings-suggestions'
```

### `frontend/src/components/layout/BottomNav.tsx`
Add 5th tab: route `NAV_ROUTES.SAVINGS_SUGGESTIONS`, label `NAV_SAVINGS_SUGGESTIONS`, icon `Lightbulb` from lucide-react.

### `frontend/src/app/(app)/savings-suggestions/page.tsx`
Page states:
1. **no-home** — "Vui lòng thiết lập nhà trước" + link to /setup
2. **loading** — spinner + "Đang phân tích..."
3. **error** — error message + "Thử lại" button
4. **success** — grand total banner + accordion + "Phân tích lại" button

On mount:
- Read `homeId` from localStorage
- Call `getSavingsSuggestions(homeId, false)` — backend returns cache if available, calls Claude if not
- State: loading → success/error

"Phân tích lại" calls `getSavingsSuggestions(homeId, true)` to force fresh analysis.

### `frontend/src/components/savings/RoomAccordionItem.tsx`
Props: `room: RoomSuggestion`, `defaultOpen?: boolean`

Renders:
- Header row (always visible): room name, room type icon, `totalSavingsVnd` badge, expand chevron
- Expanded body: `room.summary` text + list of `DeviceSuggestionCard`

### `frontend/src/components/savings/DeviceSuggestionCard.tsx`
Props: `device: DeviceSuggestion`

Renders:
- Appliance name + priority badge (color-coded: high=amber, medium=green, low=muted)
- `tip` text
- Savings row: `savingsKwh` kWh + `savingsVnd` VNĐ/tháng

---

## UI Layout (Accordion, dark-mode)

```
┌─────────────────────────────────────────┐
│  Gợi ý tiết kiệm         [Phân tích lại]│
│  Tổng tiết kiệm ước tính: 120,000đ/tháng│
├─────────────────────────────────────────┤
│  🛋️ Phòng khách    ~45,000đ/tháng  ▼  │
│  ┌─────────────────────────────────┐   │
│  │ Summary text from AI...         │   │
│  │ ─────────────────────────────── │   │
│  │ ❄️ Điều hòa          [HIGH]     │   │
│  │ Tăng nhiệt độ lên 26°C...       │   │
│  │ 12 kWh  ·  12,000đ/tháng        │   │
│  │ ─────────────────────────────── │   │
│  │ 📺 TV                [LOW]      │   │
│  │ Tắt standby mode...             │   │
│  │ 3 kWh  ·  3,000đ/tháng          │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  🍳 Bếp            ~22,000đ/tháng  ▶  │
├─────────────────────────────────────────┤
│  🛏️ Phòng ngủ      ~53,000đ/tháng  ▶  │
└─────────────────────────────────────────┘
```

---

## Error Handling

- JSON parse failure from Claude → retry once with `SAVINGS_SUGGESTIONS_RETRY_PROMPT`
- Home not found → 404 with `{ success: false, error: "Home not found: <id>" }`
- Claude API failure → propagate error to frontend error state
- Device with missing data → Claude instructed to skip (0 savings, empty tip) or omit entirely
