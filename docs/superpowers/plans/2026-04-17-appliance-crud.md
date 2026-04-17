# Appliance CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persistent appliance CRUD (add/edit/delete via API) integrated into the Setup page's edit mode, triggered when a homeId already exists.

**Architecture:** One new backend endpoint (DELETE appliance) + one new frontend API function. The Setup page detects existing homeId and renders an `EditModeView` component that loads rooms from DB, displays them as cards, and when a room is selected, reuses the existing `ApplianceFormStep` component with API-wired callbacks. Each add/edit/delete calls the API immediately and re-fetches home data.

**Tech Stack:** Express + Zod + Mongoose (backend); Next.js App Router + React + Tailwind + shadcn/ui (frontend).

---

## File Map

**Create:**
- `frontend/src/components/setup/EditModeView.tsx` — edit mode: load home, room list, room detail with API-wired callbacks

**Modify:**
- `backend/src/services/home-service.ts` — add `deleteAppliance()`
- `backend/src/routes/home.ts` — add `DELETE /:homeId/appliances/:applianceId`
- `frontend/src/lib/api.ts` — add `deleteAppliance()`
- `frontend/src/lib/translations.ts` — add edit mode translation keys
- `frontend/src/app/(app)/setup/page.tsx` — detect homeId → render EditModeView

---

## Task 1: Backend deleteAppliance service

**Files:**
- Modify: `backend/src/services/home-service.ts`

- [ ] **Step 1: Add deleteAppliance function after updateAppliance**

```typescript
export async function deleteAppliance(
  homeId: string,
  applianceId: string
): Promise<void> {
  const existing = await ApplianceModel.findOne({ applianceId, homeId }).lean();
  if (!existing) {
    throw new ApplianceNotFoundError(applianceId);
  }

  await ApplianceModel.deleteOne({ applianceId, homeId });

  const remainingAppliances = await ApplianceModel.find({ homeId }).lean();

  const totalKwh = remainingAppliances.reduce(
    (sum, a) => sum + a.monthlyKwh,
    ZERO_KWH
  );

  if (totalKwh <= ZERO_KWH) {
    return;
  }

  const totalCost = calculateMonthlyCost(totalKwh);

  for (const appliance of remainingAppliances) {
    const newCost = Math.round(
      (appliance.monthlyKwh / totalKwh) * totalCost
    );
    await ApplianceModel.updateOne(
      { applianceId: appliance.applianceId },
      { monthlyCost: newCost }
    );
  }
}
```

Note: `ZERO_KWH`, `calculateMonthlyCost`, `ApplianceModel`, `ApplianceNotFoundError` are all already imported/defined in the file. `calculateMonthlyCost` is imported from `'./evn-pricing-service'`.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "c:/Users/hoang.nguyenxuan/Documents/Side Projects/brotato-hackathon/backend" && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/services/home-service.ts
git commit -m "feat(crud): add deleteAppliance service with cost recalculation"
```

---

## Task 2: Backend DELETE route

**Files:**
- Modify: `backend/src/routes/home.ts`

- [ ] **Step 1: Add deleteAppliance to the service import**

Update the import from `'../services/home-service'` to include `deleteAppliance`:

```typescript
import {
  createHome,
  addAppliances,
  getHome,
  updateAppliance,
  deleteAppliance,
  HomeNotFoundError,
  RoomNotFoundError,
  ApplianceNotFoundError,
} from '../services/home-service';
```

- [ ] **Step 2: Add DELETE route before `export default router`**

```typescript
router.delete(
  '/:homeId/appliances/:applianceId',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const homeId = req.params.homeId as string;
      const applianceId = req.params.applianceId as string;

      await deleteAppliance(homeId, applianceId);

      const response: ApiSuccessResponse<null> = {
        success: true,
        data: null,
      };

      res.status(HTTP_OK).json(response);
    } catch (err) {
      if (err instanceof ApplianceNotFoundError) {
        const response: ApiErrorResponse = {
          success: false,
          error: err.message,
        };
        res.status(HTTP_NOT_FOUND).json(response);
        return;
      }

      next(err);
    }
  }
);
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "c:/Users/hoang.nguyenxuan/Documents/Side Projects/brotato-hackathon/backend" && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/home.ts
git commit -m "feat(crud): add DELETE /:homeId/appliances/:applianceId route"
```

---

## Task 3: Frontend deleteAppliance API

**Files:**
- Modify: `frontend/src/lib/api.ts`

- [ ] **Step 1: Add deleteAppliance function after updateAppliance**

```typescript
export async function deleteAppliance(
  homeId: string,
  applianceId: string
): Promise<ApiResponse<null>> {
  return request<null>(`/api/home/${homeId}/appliances/${applianceId}`, {
    method: "DELETE",
  });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "c:/Users/hoang.nguyenxuan/Documents/Side Projects/brotato-hackathon/frontend" && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/api.ts
git commit -m "feat(crud): add deleteAppliance frontend API function"
```

---

## Task 4: Frontend translations

**Files:**
- Modify: `frontend/src/lib/translations.ts`

- [ ] **Step 1: Add edit mode translation keys after the existing Setup/Navigation section**

Find the `// Suggestions page` comment and add before it:

```typescript
  // Setup edit mode
  SETUP_EDIT_TITLE: { vi: "Quản lý thiết bị", en: "Manage Appliances" },
  SETUP_SELECT_ROOM: { vi: "Chọn phòng", en: "Select room" },
  SETUP_BACK_TO_ROOMS: {
    vi: "Quay lại danh sách phòng",
    en: "Back to rooms",
  },
  SETUP_DELETE_CONFIRM: {
    vi: "Xóa thiết bị này?",
    en: "Delete this appliance?",
  },
  SETUP_DELETING: { vi: "Đang xóa...", en: "Deleting..." },
  SETUP_APPLIANCE_COUNT: { vi: "thiết bị", en: "appliances" },
  SETUP_LOADING: { vi: "Đang tải...", en: "Loading..." },
  SETUP_ERROR: {
    vi: "Không thể tải dữ liệu",
    en: "Failed to load data",
  },
  SETUP_RETRY: { vi: "Thử lại", en: "Retry" },
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "c:/Users/hoang.nguyenxuan/Documents/Side Projects/brotato-hackathon/frontend" && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/translations.ts
git commit -m "feat(crud): add edit mode translation keys"
```

---

## Task 5: EditModeView component

**Files:**
- Create: `frontend/src/components/setup/EditModeView.tsx`

- [ ] **Step 1: Create the EditModeView component**

This component handles the entire edit mode flow: loading → room list → room detail (reusing ApplianceFormStep).

```tsx
"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/hooks/use-t";
import {
  addAppliances,
  deleteAppliance,
  getHome,
  updateAppliance,
} from "@/lib/api";
import type { Appliance, Home, RoomWithAppliances } from "@/lib/types";
import type { Translations } from "@/lib/translations";

import { ApplianceCard } from "./ApplianceCard";
import { ApplianceFormStep } from "./ApplianceForm";

type EditState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "room-list"; home: Home }
  | { status: "room-detail"; home: Home; roomId: string };

interface EditModeViewProps {
  homeId: string;
}

interface RoomCardProps {
  room: RoomWithAppliances;
  onSelect: (roomId: string) => void;
  t: Translations;
}

function RoomCard({ room, onSelect, t }: RoomCardProps) {
  return (
    <Card
      className="cursor-pointer transition-colors hover:border-primary"
      onClick={() => onSelect(room.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") {
          return;
        }
        e.preventDefault();
        onSelect(room.id);
      }}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="font-semibold">{room.name}</p>
          <p className="text-xs text-muted-foreground">
            {t.ROOM_TYPE_LABELS[room.type]}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {room.appliances.length} {t.SETUP_APPLIANCE_COUNT}
        </p>
      </CardContent>
    </Card>
  );
}

export function EditModeView({ homeId }: EditModeViewProps) {
  const t = useT();
  const [editState, setEditState] = useState<EditState>({ status: "loading" });

  const loadHome = useCallback(async () => {
    setEditState({ status: "loading" });

    const result = await getHome(homeId);

    if (!result.success) {
      setEditState({ status: "error", message: result.error });
      return;
    }

    setEditState({ status: "room-list", home: result.data });
  }, [homeId]);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  const selectRoom = useCallback(
    (roomId: string) => {
      if (editState.status !== "room-list" && editState.status !== "room-detail") {
        return;
      }
      setEditState({ status: "room-detail", home: editState.home, roomId });
    },
    [editState]
  );

  const backToRooms = useCallback(() => {
    if (editState.status !== "room-detail") {
      return;
    }
    setEditState({ status: "room-list", home: editState.home });
  }, [editState]);

  const reloadAndStayInRoom = useCallback(
    async (roomId: string) => {
      const result = await getHome(homeId);
      if (!result.success) {
        return;
      }
      setEditState({ status: "room-detail", home: result.data, roomId });
    },
    [homeId]
  );

  const handleAddAppliance = useCallback(
    async (
      roomId: string,
      appliance: Omit<Appliance, "id" | "roomId" | "monthlyKwh" | "monthlyCost">
    ) => {
      await addAppliances(homeId, roomId, [
        {
          name: appliance.name,
          type: appliance.type,
          wattage: appliance.wattage,
          dailyUsageHours: appliance.dailyUsageHours,
          standbyWattage: appliance.standbyWattage,
          usageHabit: appliance.usageHabit,
        },
      ]);
      await reloadAndStayInRoom(roomId);
    },
    [homeId, reloadAndStayInRoom]
  );

  const handleEditAppliance = useCallback(
    async (
      roomId: string,
      applianceId: string,
      updates: Omit<Appliance, "id" | "roomId" | "monthlyKwh" | "monthlyCost">
    ) => {
      await updateAppliance(homeId, applianceId, {
        name: updates.name,
        type: updates.type,
        wattage: updates.wattage,
        dailyUsageHours: updates.dailyUsageHours,
        standbyWattage: updates.standbyWattage,
        usageHabit: updates.usageHabit,
      });
      await reloadAndStayInRoom(roomId);
    },
    [homeId, reloadAndStayInRoom]
  );

  const handleDeleteAppliance = useCallback(
    async (roomId: string, applianceId: string) => {
      await deleteAppliance(homeId, applianceId);
      await reloadAndStayInRoom(roomId);
    },
    [homeId, reloadAndStayInRoom]
  );

  if (editState.status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t.SETUP_LOADING}</p>
      </div>
    );
  }

  if (editState.status === "error") {
    return (
      <Card className="border-destructive">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm font-semibold text-destructive">
            {t.SETUP_ERROR}
          </p>
          <p className="text-xs text-muted-foreground">{editState.message}</p>
          <Button variant="outline" size="sm" onClick={loadHome}>
            {t.SETUP_RETRY}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (editState.status === "room-list") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-center text-xl font-bold">{t.SETUP_EDIT_TITLE}</h1>
        <p className="text-center text-sm text-muted-foreground">
          {t.SETUP_SELECT_ROOM}
        </p>
        {editState.home.rooms.map((room) => (
          <RoomCard key={room.id} room={room} onSelect={selectRoom} t={t} />
        ))}
      </div>
    );
  }

  const selectedRoom = editState.home.rooms.find(
    (r) => r.id === editState.roomId
  );

  if (!selectedRoom) {
    return null;
  }

  const singleRoomArray = [selectedRoom];
  const singleAppliancesByRoom: Record<string, Appliance[]> = {
    [selectedRoom.id]: selectedRoom.appliances,
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={backToRooms}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">{selectedRoom.name}</h1>
      </div>

      <ApplianceFormStep
        rooms={singleRoomArray}
        appliancesByRoom={singleAppliancesByRoom}
        onAddAppliance={handleAddAppliance}
        onEditAppliance={handleEditAppliance}
        onDeleteAppliance={handleDeleteAppliance}
        onNext={backToRooms}
        onBack={backToRooms}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "c:/Users/hoang.nguyenxuan/Documents/Side Projects/brotato-hackathon/frontend" && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/setup/EditModeView.tsx
git commit -m "feat(crud): add EditModeView component with API-wired appliance CRUD"
```

---

## Task 6: Setup page edit mode integration

**Files:**
- Modify: `frontend/src/app/(app)/setup/page.tsx`

- [ ] **Step 1: Add import for EditModeView at the top**

Add after the existing component imports:

```typescript
import { EditModeView } from "@/components/setup/EditModeView";
```

- [ ] **Step 2: Add edit mode detection at the start of the component**

Inside `SetupPage()`, the existing code has:

```typescript
const [, setHomeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);
```

Change to:

```typescript
const [homeId, setHomeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);
```

Then add the edit mode guard right after the `useLocalStorage` call, before any other state declarations:

```typescript
if (homeId) {
  return <EditModeView homeId={homeId} />;
}
```

Note: This guard must come BEFORE the existing `useState` calls. Since hooks can't be called conditionally in React, but `useLocalStorage` and `useT` are already called before this guard, and the remaining hooks (useState, useCallback) are only used in the wizard, this early return is safe IF we move the `useT` and `useLocalStorage` calls to remain above it. Actually, `useRouter` and `useT` are already before the guard. The key issue is that `useState` hooks below the guard would be skipped in edit mode — which violates React's rules of hooks.

The correct approach: extract the fresh wizard into its own component `FreshWizard`, keeping the setup page as a thin dispatcher:

```tsx
export default function SetupPage() {
  const [homeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);

  if (homeId) {
    return <EditModeView homeId={homeId} />;
  }

  return <FreshWizard />;
}
```

Move the ENTIRE existing `SetupPage` body (all state, handlers, JSX) into a new `FreshWizard` component in the same file:

```tsx
function FreshWizard() {
  const router = useRouter();
  const t = useT();
  const [, setHomeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);

  const [currentStep, setCurrentStep] = useState<WizardStep>(ROOM_STEP_INDEX);
  const [rooms, setRooms] = useState<Room[]>([]);
  // ... rest of the existing SetupPage body unchanged
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "c:/Users/hoang.nguyenxuan/Documents/Side Projects/brotato-hackathon/frontend" && npx tsc --noEmit
```

- [ ] **Step 4: Manual end-to-end test**

1. Start MongoDB, backend, frontend
2. If no homeId: Setup page shows 3-step wizard (unchanged)
3. Complete setup → navigated to dashboard
4. Navigate back to Setup (via BottomNav)
5. Verify: edit mode shows — loading → room list with cards
6. Click a room → see appliances for that room
7. Click "+" → add dialog with AI estimation, presets, camera
8. Save → appliance appears in list (API called, data refreshed from DB)
9. Click edit (pencil icon) → edit dialog with prefilled data
10. Save → appliance updated (API called)
11. Click delete (X icon) → appliance removed (API called)
12. Click back arrow → return to room list
13. Verify appliance counts updated

- [ ] **Step 5: Commit**

```bash
git add "frontend/src/app/(app)/setup/page.tsx"
git commit -m "feat(crud): integrate edit mode into Setup page with FreshWizard extraction"
```
