# Savings Suggestions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated `/suggestions` page backed by a new AI endpoint that returns nested room→device saving tips, with MongoDB caching.

**Architecture:** A new `POST /api/ai/savings-suggestions` endpoint checks the HomeModel for a cached `SavingsSuggestionsResult`; on cache miss (or `forceRefresh: true`) it calls Claude with a new prompt and saves the result back to the HomeModel. The frontend page (`/suggestions`, already routed) is rewritten to call this endpoint and render an accordion of rooms with device cards inside.

**Tech Stack:** Express + Zod + Mongoose + @anthropic-ai/sdk (backend); Next.js App Router + React + Tailwind + shadcn/ui (frontend).

---

## File Map

**Create:**
- `backend/src/prompts/savings-suggestions.ts` — system prompt + retry prompt
- `frontend/src/components/savings/DeviceSuggestionCard.tsx` — single device tip card
- `frontend/src/components/savings/RoomAccordionItem.tsx` — collapsible room section

**Modify:**
- `backend/src/types/ai.ts` — add DeviceSuggestion, RoomSuggestion, SavingsSuggestionsResult
- `backend/src/services/ai-service.ts` — add generateSavingsSuggestions()
- `backend/src/models/home.model.ts` — add savingsSuggestions cache field
- `backend/src/routes/ai.ts` — add POST /savings-suggestions endpoint
- `frontend/src/lib/types.ts` — mirror new interfaces
- `frontend/src/lib/api.ts` — add getSavingsSuggestions()
- `frontend/src/app/(app)/suggestions/page.tsx` — rewrite to use new data + accordion

**No changes needed (already done):**
- `frontend/src/components/layout/BottomNav.tsx` — already has Lightbulb tab
- `frontend/src/lib/constants.ts` — NAV_ROUTES.SUGGESTIONS already exists
- `frontend/src/lib/translations.ts` — all SUGGESTIONS_* keys already exist

---

## Task 1: Backend types

**Files:**
- Modify: `backend/src/types/ai.ts`

- [ ] **Step 1: Add the three new interfaces to the bottom of the file**

Open `backend/src/types/ai.ts` and append after the `ChatMessage` interface:

```typescript
export type SuggestionPriority = 'high' | 'medium' | 'low';

export interface DeviceSuggestion {
  applianceName: string;
  tip: string;
  savingsKwh: number;
  savingsVnd: number;
  priority: SuggestionPriority;
}

export interface RoomSuggestion {
  roomName: string;
  roomType: string;
  summary: string;
  totalSavingsKwh: number;
  totalSavingsVnd: number;
  devices: DeviceSuggestion[];
}

export interface SavingsSuggestionsResult {
  rooms: RoomSuggestion[];
  grandTotalSavingsKwh: number;
  grandTotalSavingsVnd: number;
  analyzedAt: string;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd backend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/types/ai.ts
git commit -m "feat(savings): add DeviceSuggestion, RoomSuggestion, SavingsSuggestionsResult types"
```

---

## Task 2: Backend prompt

**Files:**
- Create: `backend/src/prompts/savings-suggestions.ts`

- [ ] **Step 1: Create the prompt file**

```typescript
export const SAVINGS_SUGGESTIONS_SYSTEM_PROMPT = `Ban la "Tro Ly Khoai Tay", chuyen gia nang luong vui tinh cho ho gia dinh Viet Nam.

NHIEM VU: Phan tich tung phong va tung thiet bi, dua ra goi y tiet kiem dien nang cu the, thuc te.

QUY TAC PHAN TICH:
1. Moi phong can co mot "summary" ngan (1-2 cau) tom tat tinh trang tieu thu va tiem nang tiet kiem
2. Moi thiet bi can co mot "tip" cu the nguoi dung co the lam NGAY - khong chung chung
3. Uoc tinh tiet kiem theo kWh va VND/thang dua tren bieu gia EVN bac thang
4. Neu thiet bi khong du thong tin de goi y, bo qua (de mang devices trong)
5. Viet tieng Viet, giong than thien, nhe nhang hai huoc
6. "priority" la "high" neu tiet kiem > 20,000d/thang, "medium" neu 5,000-20,000d, "low" neu < 5,000d

BIEU GIA EVN 2024 (VND/kWh):
Bac 1: 0-50 kWh = 1.893 | Bac 2: 51-100 = 1.956 | Bac 3: 101-200 = 2.271
Bac 4: 201-300 = 2.860 | Bac 5: 301-400 = 3.197 | Bac 6: 401+ = 3.302

OUTPUT FORMAT (JSON thuan, KHONG markdown, KHONG giai thich):
{
  "rooms": [
    {
      "roomName": "ten phong",
      "roomType": "loai phong (living_room, bedroom, kitchen, ...)",
      "summary": "1-2 cau tieng Viet ve phong nay",
      "totalSavingsKwh": 0,
      "totalSavingsVnd": 0,
      "devices": [
        {
          "applianceName": "ten thiet bi",
          "tip": "hanh dong cu the bang tieng Viet",
          "savingsKwh": 0,
          "savingsVnd": 0,
          "priority": "high|medium|low"
        }
      ]
    }
  ],
  "grandTotalSavingsKwh": 0,
  "grandTotalSavingsVnd": 0
}`;

export const SAVINGS_SUGGESTIONS_RETRY_PROMPT = `Hay tra ve DUNG FORMAT JSON thuan (KHONG co markdown, KHONG co \`\`\`json). Chi tra ve object JSON duy nhat co cac truong: rooms, grandTotalSavingsKwh, grandTotalSavingsVnd.`;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd backend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/prompts/savings-suggestions.ts
git commit -m "feat(savings): add savings-suggestions system prompt"
```

---

## Task 3: Backend service function

**Files:**
- Modify: `backend/src/services/ai-service.ts`

- [ ] **Step 1: Update imports at the top of ai-service.ts**

Replace the existing `../types/ai` import line (currently line 3) with:

```typescript
import { Recommendation, RecommendationType, RecommendationDifficulty, ApplianceEstimate, ImageRecognitionResult, ChatMessage, SavingsSuggestionsResult, RoomSuggestion, DeviceSuggestion } from '../types/ai';
```

Add a new import after the existing prompt imports (after line 9):

```typescript
import { SAVINGS_SUGGESTIONS_SYSTEM_PROMPT, SAVINGS_SUGGESTIONS_RETRY_PROMPT } from '../prompts/savings-suggestions';
```

- [ ] **Step 2: Add raw types and parse function before generateRecommendations**

Add after the `VALID_TYPES`/`VALID_DIFFICULTIES` constants and before `stripMarkdownJsonWrapper`:

```typescript
interface RawDeviceSuggestion {
  applianceName: string;
  tip: string;
  savingsKwh: number;
  savingsVnd: number;
  priority: 'high' | 'medium' | 'low';
}

interface RawRoomSuggestion {
  roomName: string;
  roomType: string;
  summary: string;
  totalSavingsKwh: number;
  totalSavingsVnd: number;
  devices: RawDeviceSuggestion[];
}

interface RawSavingsSuggestionsResult {
  rooms: RawRoomSuggestion[];
  grandTotalSavingsKwh: number;
  grandTotalSavingsVnd: number;
}

const VALID_PRIORITIES = new Set(['high', 'medium', 'low']);
const DEFAULT_PRIORITY = 'low';

function parseSavingsSuggestionsJson(text: string): SavingsSuggestionsResult {
  const cleaned = stripMarkdownJsonWrapper(text);
  const parsed = JSON.parse(cleaned) as RawSavingsSuggestionsResult;

  const rooms: RoomSuggestion[] = parsed.rooms.map((room) => ({
    roomName: room.roomName,
    roomType: room.roomType,
    summary: room.summary,
    totalSavingsKwh: room.totalSavingsKwh ?? 0,
    totalSavingsVnd: room.totalSavingsVnd ?? 0,
    devices: (room.devices ?? []).map((d): DeviceSuggestion => ({
      applianceName: d.applianceName,
      tip: d.tip,
      savingsKwh: d.savingsKwh ?? 0,
      savingsVnd: d.savingsVnd ?? 0,
      priority: VALID_PRIORITIES.has(d.priority) ? d.priority : DEFAULT_PRIORITY as 'low',
    })),
  }));

  return {
    rooms,
    grandTotalSavingsKwh: parsed.grandTotalSavingsKwh ?? 0,
    grandTotalSavingsVnd: parsed.grandTotalSavingsVnd ?? 0,
    analyzedAt: new Date().toISOString(),
  };
}
```

- [ ] **Step 3: Add generateSavingsSuggestions function after generateRecommendations**

```typescript
export async function generateSavingsSuggestions(
  homeData: Home
): Promise<SavingsSuggestionsResult> {
  const response = await getClient().messages.create({
    model: MODEL_SONNET,
    max_tokens: MAX_TOKENS_STANDARD,
    system: SAVINGS_SUGGESTIONS_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: JSON.stringify(homeData),
      },
    ],
  });

  const responseText = extractTextFromResponse(response);

  try {
    return parseSavingsSuggestionsJson(responseText);
  } catch {
    const retryResponse = await getClient().messages.create({
      model: MODEL_SONNET,
      max_tokens: MAX_TOKENS_STANDARD,
      system: SAVINGS_SUGGESTIONS_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: JSON.stringify(homeData),
        },
        {
          role: 'assistant',
          content: responseText,
        },
        {
          role: 'user',
          content: SAVINGS_SUGGESTIONS_RETRY_PROMPT,
        },
      ],
    });

    const retryText = extractTextFromResponse(retryResponse);
    return parseSavingsSuggestionsJson(retryText);
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd backend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/ai-service.ts
git commit -m "feat(savings): add generateSavingsSuggestions service function"
```

---

## Task 4: Backend model update

**Files:**
- Modify: `backend/src/models/home.model.ts`

- [ ] **Step 1: Add import and update HomeDocument + schema**

Replace the entire file content:

```typescript
import mongoose, { Schema, Document } from 'mongoose';
import { SavingsSuggestionsResult } from '../types/ai';

export interface HomeDocument extends Document {
  homeId: string;
  savingsSuggestions?: SavingsSuggestionsResult;
  createdAt: Date;
  updatedAt: Date;
}

const homeSchema = new Schema(
  {
    homeId: { type: String, required: true, unique: true },
    savingsSuggestions: { type: Schema.Types.Mixed, required: false },
  },
  { timestamps: true }
);

export const HomeModel = mongoose.model<HomeDocument>('Home', homeSchema);
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd backend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/models/home.model.ts
git commit -m "feat(savings): add savingsSuggestions cache field to HomeModel"
```

---

## Task 5: Backend route

**Files:**
- Modify: `backend/src/routes/ai.ts`

- [ ] **Step 1: Update imports at the top of ai.ts**

Replace the existing `../types/ai` import line with:

```typescript
import { Recommendation, ApplianceEstimate, ImageRecognitionResult, ChatMessage, SavingsSuggestionsResult } from '../types/ai';
```

Replace the existing `../services/ai-service` import line with:

```typescript
import {
  generateRecommendations,
  generateSavingsSuggestions,
  streamChat,
  estimateAppliance,
  recognizeAppliance,
  buildHomeContext,
} from '../services/ai-service';
```

Add a new import after the existing model imports:

```typescript
import { HomeModel } from '../models/home.model';
```

- [ ] **Step 2: Add Zod schema and types after the existing `estimateApplianceSchema`**

```typescript
const savingsSuggestionsSchema = z.object({
  homeId: z.string(),
  forceRefresh: z.boolean().optional().default(false),
});

type SavingsSuggestionsBody = z.infer<typeof savingsSuggestionsSchema>;
```

- [ ] **Step 3: Add the route handler before `export default router`**

```typescript
router.post(
  '/savings-suggestions',
  validate(savingsSuggestionsSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { homeId, forceRefresh } = req.body as SavingsSuggestionsBody;

      const homeDoc = await HomeModel.findOne({ homeId }).lean();

      if (!homeDoc) {
        const response: ApiErrorResponse = {
          success: false,
          error: `Home not found: ${homeId}`,
        };
        res.status(HTTP_NOT_FOUND).json(response);
        return;
      }

      if (homeDoc.savingsSuggestions && !forceRefresh) {
        const response: ApiSuccessResponse<SavingsSuggestionsResult> = {
          success: true,
          data: homeDoc.savingsSuggestions,
        };
        res.status(HTTP_OK).json(response);
        return;
      }

      const home = await getHome(homeId);
      const result = await generateSavingsSuggestions(home!);

      await HomeModel.updateOne({ homeId }, { savingsSuggestions: result });

      const response: ApiSuccessResponse<SavingsSuggestionsResult> = {
        success: true,
        data: result,
      };

      res.status(HTTP_OK).json(response);
    } catch (err) {
      next(err);
    }
  }
);
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd backend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Manual smoke test**

Start backend: `cd backend && npm run dev`

In a separate terminal (replace `<homeId>` with a real homeId from a previous setup):

```bash
curl -X POST http://localhost:3001/api/ai/savings-suggestions \
  -H "Content-Type: application/json" \
  -d '{"homeId":"<homeId>","forceRefresh":false}'
```

Expected: `{"success":true,"data":{"rooms":[...],"grandTotalSavingsKwh":...,"grandTotalSavingsVnd":...,"analyzedAt":"..."}}`

Second call (should return cached, same `analyzedAt`):

```bash
curl -X POST http://localhost:3001/api/ai/savings-suggestions \
  -H "Content-Type: application/json" \
  -d '{"homeId":"<homeId>","forceRefresh":false}'
```

Expected: same `analyzedAt` as first call (served from cache).

- [ ] **Step 6: Commit**

```bash
git add backend/src/routes/ai.ts
git commit -m "feat(savings): add POST /api/ai/savings-suggestions endpoint with caching"
```

---

## Task 6: Frontend types

**Files:**
- Modify: `frontend/src/lib/types.ts`

- [ ] **Step 1: Add new interfaces to the bottom of types.ts**

Append after the `ApiResponse` type (last line):

```typescript
export type SuggestionPriority = 'high' | 'medium' | 'low';

export interface DeviceSuggestion {
  applianceName: string;
  tip: string;
  savingsKwh: number;
  savingsVnd: number;
  priority: SuggestionPriority;
}

export interface RoomSuggestion {
  roomName: string;
  roomType: string;
  summary: string;
  totalSavingsKwh: number;
  totalSavingsVnd: number;
  devices: DeviceSuggestion[];
}

export interface SavingsSuggestionsResult {
  rooms: RoomSuggestion[];
  grandTotalSavingsKwh: number;
  grandTotalSavingsVnd: number;
  analyzedAt: string;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/types.ts
git commit -m "feat(savings): add DeviceSuggestion, RoomSuggestion, SavingsSuggestionsResult frontend types"
```

---

## Task 7: Frontend API function

**Files:**
- Modify: `frontend/src/lib/api.ts`

- [ ] **Step 1: Add SavingsSuggestionsResult to the import from types**

Update the import at the top of api.ts:

```typescript
import type {
  ApiResponse,
  Appliance,
  ApplianceEstimate,
  DashboardData,
  Home,
  ImageRecognitionResult,
  Recommendation,
  Room,
  SavingsSuggestionsResult,
  SimulationAdjustment,
  SimulationResult,
} from "./types";
```

- [ ] **Step 2: Add getSavingsSuggestions function before calculateSimulation**

```typescript
export async function getSavingsSuggestions(
  homeId: string,
  forceRefresh = false
): Promise<ApiResponse<SavingsSuggestionsResult>> {
  return request<SavingsSuggestionsResult>("/api/ai/savings-suggestions", {
    method: "POST",
    body: JSON.stringify({ homeId, forceRefresh }),
  });
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/api.ts
git commit -m "feat(savings): add getSavingsSuggestions API function"
```

---

## Task 8: Frontend components

**Files:**
- Create: `frontend/src/components/savings/DeviceSuggestionCard.tsx`
- Create: `frontend/src/components/savings/RoomAccordionItem.tsx`

- [ ] **Step 1: Create DeviceSuggestionCard**

```tsx
import { Badge } from "@/components/ui/badge";
import { formatKwh, formatVnd } from "@/lib/format";
import type { DeviceSuggestion, SuggestionPriority } from "@/lib/types";
import type { Translations } from "@/lib/translations";

type PriorityVariant = "destructive" | "secondary" | "outline";

const PRIORITY_VARIANT: Record<SuggestionPriority, PriorityVariant> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

interface DeviceSuggestionCardProps {
  device: DeviceSuggestion;
  t: Translations;
}

const PRIORITY_LABEL_MAP: Record<SuggestionPriority, keyof Translations> = {
  high: "SUGGESTIONS_PRIORITY_HIGH",
  medium: "SUGGESTIONS_PRIORITY_MEDIUM",
  low: "SUGGESTIONS_PRIORITY_LOW",
};

export function DeviceSuggestionCard({ device, t }: DeviceSuggestionCardProps) {
  const labelKey = PRIORITY_LABEL_MAP[device.priority];
  const priorityLabel = t[labelKey] as string;

  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{device.applianceName}</p>
        <Badge variant={PRIORITY_VARIANT[device.priority]}>{priorityLabel}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{device.tip}</p>
      <p className="text-xs text-primary font-medium">
        {formatVnd(device.savingsVnd)}{" "}
        <span className="font-normal text-muted-foreground">
          · {formatKwh(device.savingsKwh)} {t.SUGGESTIONS_SAVINGS_PER_MONTH}
        </span>
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create RoomAccordionItem**

```tsx
"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

import { formatVnd } from "@/lib/format";
import type { RoomSuggestion } from "@/lib/types";
import type { Translations } from "@/lib/translations";
import { DeviceSuggestionCard } from "./DeviceSuggestionCard";

interface RoomAccordionItemProps {
  room: RoomSuggestion;
  defaultOpen?: boolean;
  t: Translations;
}

export function RoomAccordionItem({ room, defaultOpen = false, t }: RoomAccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <button
        className="flex w-full items-center justify-between gap-2 bg-card px-4 py-3 text-left"
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <div className="flex items-center gap-2">
          <p className="font-semibold">{room.roomName}</p>
          <span className="text-xs text-muted-foreground">
            {room.devices.length} {t.SUGGESTIONS_TIPS_SUFFIX}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-medium text-primary">
            ~{formatVnd(room.totalSavingsVnd)}
          </span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-2 bg-background px-4 pb-4 pt-2">
          <p className="text-xs text-muted-foreground italic">{room.summary}</p>
          {room.devices.map((device) => (
            <DeviceSuggestionCard key={device.applianceName} device={device} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/savings/
git commit -m "feat(savings): add DeviceSuggestionCard and RoomAccordionItem components"
```

---

## Task 9: Frontend page rewrite

**Files:**
- Modify: `frontend/src/app/(app)/suggestions/page.tsx`

- [ ] **Step 1: Replace the entire file with the new implementation**

```tsx
"use client";

import { Lightbulb, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RoomAccordionItem } from "@/components/savings/RoomAccordionItem";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useT } from "@/hooks/use-t";
import { getSavingsSuggestions } from "@/lib/api";
import { LOCAL_STORAGE_HOME_ID_KEY, NAV_ROUTES } from "@/lib/constants";
import { formatKwh, formatVnd } from "@/lib/format";
import type { Translations } from "@/lib/translations";
import type { SavingsSuggestionsResult } from "@/lib/types";

type PageState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: SavingsSuggestionsResult };

const INITIAL_STATE: PageState = { status: "idle" };

interface NoHomeStateProps {
  t: Translations;
}

function NoHomeState({ t }: NoHomeStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <Lightbulb className="h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-semibold">{t.SUGGESTIONS_NO_HOME_TITLE}</p>
        <p className="text-sm text-muted-foreground">{t.SUGGESTIONS_NO_HOME_MESSAGE}</p>
        <Button asChild>
          <Link href={NAV_ROUTES.SETUP}>{t.SUGGESTIONS_NO_HOME_CTA}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
  t: Translations;
}

function ErrorBanner({ message, onRetry, t }: ErrorBannerProps) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-sm font-semibold text-destructive">{t.SUGGESTIONS_ERROR_TITLE}</p>
        <p className="text-xs text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t.SUGGESTIONS_RETRY}
        </Button>
      </CardContent>
    </Card>
  );
}

interface TotalSavingsCardProps {
  data: SavingsSuggestionsResult;
  t: Translations;
}

function TotalSavingsCard({ data, t }: TotalSavingsCardProps) {
  return (
    <Card className="border-primary bg-primary/10">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{t.SUGGESTIONS_TOTAL_SAVINGS}</p>
        <p className="mt-1 text-2xl font-bold text-primary">
          {formatVnd(data.grandTotalSavingsVnd)}
        </p>
        <p className="text-sm text-muted-foreground">{formatKwh(data.grandTotalSavingsKwh)}</p>
      </CardContent>
    </Card>
  );
}

export default function SuggestionsPage() {
  const t = useT();
  const [homeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);
  const [pageState, setPageState] = useState<PageState>(INITIAL_STATE);

  const fetchSuggestions = useCallback(async (id: string, forceRefresh: boolean) => {
    setPageState({ status: "loading" });

    const result = await getSavingsSuggestions(id, forceRefresh);

    if (!result.success) {
      setPageState({ status: "error", message: result.error });
      return;
    }

    setPageState({ status: "success", data: result.data });
  }, []);

  useEffect(() => {
    if (!homeId) {
      return;
    }
    if (pageState.status !== "idle") {
      return;
    }
    fetchSuggestions(homeId, false);
  }, [homeId, pageState.status, fetchSuggestions]);

  if (!homeId) {
    return <NoHomeState t={t} />;
  }

  if (pageState.status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t.SUGGESTIONS_ANALYZING}</p>
      </div>
    );
  }

  if (pageState.status === "error") {
    return (
      <ErrorBanner
        message={pageState.message}
        onRetry={() => fetchSuggestions(homeId, false)}
        t={t}
      />
    );
  }

  if (pageState.status === "idle") {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t.SUGGESTIONS_ANALYZING}</p>
      </div>
    );
  }

  const { data } = pageState;

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">{t.SUGGESTIONS_PAGE_TITLE}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchSuggestions(homeId, true)}
        >
          {t.SUGGESTIONS_ANALYZE_BUTTON}
        </Button>
      </div>

      <TotalSavingsCard data={data} t={t} />

      {data.rooms.map((room, index) => (
        <RoomAccordionItem
          key={room.roomName}
          room={room}
          defaultOpen={index === 0}
          t={t}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Manual end-to-end test**

1. Start MongoDB: `mongod --dbpath ./data/db`
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`
4. Open `http://localhost:3000` in browser
5. Complete home setup if not already done (add at least 2 rooms with appliances)
6. Navigate to the "Gợi ý" tab in the bottom nav
7. Verify: loading spinner shows while Claude analyzes
8. Verify: grand total savings card appears
9. Verify: accordion rows appear — first room expanded, rest collapsed
10. Verify: clicking a closed room expands it and shows device cards with tips
11. Verify: clicking "Phân tích lại" triggers fresh analysis (different `analyzedAt`)
12. Verify: navigating away and back returns instantly (cached, no loading)

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/\(app\)/suggestions/page.tsx
git commit -m "feat(savings): rewrite suggestions page with accordion UI and new AI endpoint"
```
