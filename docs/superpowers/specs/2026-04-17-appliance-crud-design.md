# Design: CRUD thiết bị trong room (tích hợp Setup page)

**Date:** 2026-04-17
**Status:** Approved

---

## Overview

Add persistent appliance CRUD (create/read/update/delete) integrated into the existing Setup page. When a user returns to Setup with an existing homeId, they see their rooms, select one, and manage appliances in that room with realtime API calls. No room deletion — only appliance-level operations.

---

## Flow

```
Setup page detects homeId in localStorage
  → GET /api/home/:homeId → load rooms + appliances
  → Display room list (cards)
  → User selects a room
  → Display appliances for that room
  → User can: add / edit / delete appliance (each action calls API immediately)
  → "Back" button to return to room list

If no homeId → original 3-step wizard (unchanged)
```

---

## Backend Changes

### `backend/src/services/home-service.ts`

Add `deleteAppliance(homeId: string, applianceId: string): Promise<void>`:
- Find appliance by `{ applianceId, homeId }` — throw `ApplianceNotFoundError` if not found
- Delete the document from ApplianceModel
- Recalculate `monthlyCost` for remaining appliances in the household (same pattern as `updateAppliance` — get total kWh, calculate total cost, distribute proportionally)
- Save updated costs to remaining appliances

### `backend/src/routes/home.ts`

Add `DELETE /:homeId/appliances/:applianceId`:
- Validate params with Zod
- Call `deleteAppliance(homeId, applianceId)`
- Return `{ success: true, data: null }`
- On `ApplianceNotFoundError` → 404

No other backend changes needed — `addAppliances` and `updateAppliance` already exist.

---

## Frontend Changes

### `frontend/src/lib/api.ts`

Add:
```typescript
deleteAppliance(homeId: string, applianceId: string): Promise<ApiResponse<null>>
// DELETE /api/home/:homeId/appliances/:applianceId
```

### `frontend/src/app/(app)/setup/page.tsx`

Rewrite to support two modes:

**Fresh mode** (no homeId): original 3-step wizard, unchanged behavior.

**Edit mode** (homeId exists in localStorage):
- On mount: call `getHome(homeId)` to load rooms + appliances
- State machine: `loading | error | room-list | room-detail`
- `room-list` state: display all rooms as cards with appliance count, user clicks to select
- `room-detail` state: display selected room's appliances + add/edit/delete UI
- Each edit/delete calls API immediately, then refreshes local state

### `frontend/src/components/setup/RoomSelector.tsx`

New component (or inline in page if simple enough).

Props: `rooms: RoomWithAppliances[]`, `onSelectRoom: (roomId: string) => void`

Renders room cards showing: room name, type, appliance count.

### Appliance management in edit mode

Reuse or adapt existing `ApplianceForm.tsx` patterns:
- **Add**: existing flow — form → call `addAppliances(homeId, roomId, [appliance])`
- **Edit**: existing flow — dialog → call `updateAppliance(homeId, applianceId, updates)`
- **Delete**: new — confirmation → call `deleteAppliance(homeId, applianceId)` → remove from local state

### Translations

Add keys for edit mode:
- `SETUP_EDIT_TITLE` — "Quản lý thiết bị" / "Manage appliances"
- `SETUP_SELECT_ROOM` — "Chọn phòng" / "Select room"
- `SETUP_BACK_TO_ROOMS` — "Quay lại danh sách phòng" / "Back to rooms"
- `SETUP_DELETE_CONFIRM` — "Xóa thiết bị này?" / "Delete this appliance?"
- `SETUP_DELETING` — "Đang xóa..." / "Deleting..."
- `SETUP_APPLIANCE_COUNT` — "{count} thiết bị" / "{count} appliances"

---

## Error Handling

- Delete API failure → show error toast/message, keep appliance in UI
- Add/Update API failure → show error, don't clear form
- getHome failure on mount → show error state with retry button
- ApplianceNotFoundError (409/404 race) → refresh room data from API

---

## What's NOT changing

- Room creation (stays in fresh setup wizard)
- Room deletion (not supported)
- Room editing (not supported)
- The 3-step wizard for first-time setup
- Existing updateAppliance and addAppliances backend logic
