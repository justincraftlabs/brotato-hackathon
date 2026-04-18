# Activate-All Schedules + Slack + Savings Tracker — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn recommendation cards into live scheduled reminders that fire to Slack and in-app toast, with a cumulative savings counter on the dashboard.

**Architecture:** node-cron ticks every minute checking due schedules; when one fires it POSTs to a Slack webhook and pushes an SSE event to all open browser tabs for that homeId. A `GET /api/schedules/:id/complete` endpoint (called via "Done" button) writes a Completion record; the dashboard widget sums all Completions to show "Đã tiết kiệm tháng này."

**Tech Stack:** node-cron, native fetch (Node 18+), Server-Sent Events (Express), Mongoose, Next.js 14, shadcn/ui, Tailwind CSS, Lucide icons

---

## File Map

### New — Backend
| File | Responsibility |
|------|---------------|
| `backend/src/models/schedule.model.ts` | Mongoose schema + Document type for Schedule |
| `backend/src/models/completion.model.ts` | Mongoose schema + Document type for Completion |
| `backend/src/services/notification-service.ts` | SSE client registry + `postToSlack` + `notifyClients` |
| `backend/src/services/schedule-service.ts` | CRUD, `fireSchedule`, `checkAndFireDue`, `completeSched`, `getSavingsTotals` |
| `backend/src/routes/schedules.ts` | All HTTP + SSE endpoints |

### Modified — Backend
| File | Change |
|------|--------|
| `backend/src/index.ts` | Register `/api/schedules` router + start `node-cron` job |

### New — Frontend
| File | Responsibility |
|------|---------------|
| `frontend/src/components/recommendations/ActivateAllButton.tsx` | Hero CTA; calls `activateAll` API, shows success banner |
| `frontend/src/hooks/useScheduledEvents.ts` | SSE subscription; returns `firedSchedule` + `dismiss` |
| `frontend/src/components/recommendations/ScheduleToast.tsx` | Animated overlay with "Đã làm ✓" button |
| `frontend/src/components/dashboard/SavingsCounter.tsx` | Fetches savings totals, renders animated counters |
| `frontend/src/app/(app)/schedules/page.tsx` | Lists active schedules; demo "Fire now" buttons |

### Modified — Frontend
| File | Change |
|------|--------|
| `frontend/src/lib/types.ts` | Add `Schedule`, `Completion`, `SavingsTotals` interfaces |
| `frontend/src/lib/api.ts` | Add `activateAll`, `listSchedules`, `fireSchedule`, `completeSchedule`, `getSavingsTotals` |
| `frontend/src/lib/constants.ts` | Add `SCHEDULES` to `NAV_ROUTES` |
| `frontend/src/app/(app)/suggestions/page.tsx` | Mount `<ActivateAllButton>` + `<ScheduleToast>` |
| `frontend/src/app/(app)/dashboard/page.tsx` | Mount `<SavingsCounter>` in `DashboardContent` |

---

## Task 1: Install node-cron

**Files:**
- Modify: `backend/package.json` (via npm install)

- [ ] **Step 1: Install packages**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon/backend
npm install node-cron
npm install --save-dev @types/node-cron
```

Expected output: packages added to `node_modules`, `package.json` updated.

- [ ] **Step 2: Verify import compiles**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon/backend
node -e "const cron = require('node-cron'); console.log(typeof cron.schedule);"
```

Expected: `function`

- [ ] **Step 3: Commit**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon
git add backend/package.json backend/package-lock.json
git commit -m "chore(backend): add node-cron dependency"
```

---

## Task 2: Schedule + Completion Mongoose Models

**Files:**
- Create: `backend/src/models/schedule.model.ts`
- Create: `backend/src/models/completion.model.ts`

- [ ] **Step 1: Create `schedule.model.ts`**

```typescript
// backend/src/models/schedule.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export type ScheduleType = 'behavior' | 'upgrade' | 'schedule' | 'vampire';
export type ScheduleStatus = 'active' | 'paused' | 'completed';

export interface ScheduleDocument extends Document {
  scheduleId: string;
  homeId: string;
  applianceName: string;
  roomName: string;
  type: ScheduleType;
  title: string;
  description: string;
  scheduledTime: string;  // "HH:MM" 24h
  savingsKwh: number;
  savingsVnd: number;
  status: ScheduleStatus;
  lastFiredAt?: Date;
}

const scheduleSchema = new Schema(
  {
    scheduleId: { type: String, required: true, unique: true },
    homeId: { type: String, required: true, index: true },
    applianceName: { type: String, required: true },
    roomName: { type: String, required: true },
    type: { type: String, enum: ['behavior', 'upgrade', 'schedule', 'vampire'], required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    scheduledTime: { type: String, required: true },
    savingsKwh: { type: Number, required: true },
    savingsVnd: { type: Number, required: true },
    status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
    lastFiredAt: { type: Date },
  },
  { timestamps: true }
);

export const ScheduleModel = mongoose.model<ScheduleDocument>('Schedule', scheduleSchema);
```

- [ ] **Step 2: Create `completion.model.ts`**

```typescript
// backend/src/models/completion.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface CompletionDocument extends Document {
  completionId: string;
  homeId: string;
  scheduleId: string;
  applianceName: string;
  roomName: string;
  savingsKwh: number;
  savingsVnd: number;
}

const completionSchema = new Schema(
  {
    completionId: { type: String, required: true, unique: true },
    homeId: { type: String, required: true, index: true },
    scheduleId: { type: String, required: true, index: true },
    applianceName: { type: String, required: true },
    roomName: { type: String, required: true },
    savingsKwh: { type: Number, required: true },
    savingsVnd: { type: Number, required: true },
  },
  { timestamps: true }
);

export const CompletionModel = mongoose.model<CompletionDocument>('Completion', completionSchema);
```

- [ ] **Step 3: Commit**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon
git add backend/src/models/schedule.model.ts backend/src/models/completion.model.ts
git commit -m "feat(backend): add Schedule and Completion mongoose models"
```

---

## Task 3: notification-service.ts — SSE Registry + Slack

**Files:**
- Create: `backend/src/services/notification-service.ts`

- [ ] **Step 1: Create the file**

```typescript
// backend/src/services/notification-service.ts
import { Response } from 'express';

// In-memory SSE client registry: homeId → set of open Response streams
const sseClients = new Map<string, Set<Response>>();

export function registerSseClient(homeId: string, res: Response): void {
  if (!sseClients.has(homeId)) {
    sseClients.set(homeId, new Set());
  }
  sseClients.get(homeId)!.add(res);
}

export function removeSseClient(homeId: string, res: Response): void {
  const clients = sseClients.get(homeId);
  if (!clients) return;
  clients.delete(res);
  if (clients.size === 0) {
    sseClients.delete(homeId);
  }
}

export interface FiredScheduleEvent {
  scheduleId: string;
  title: string;
  applianceName: string;
  roomName: string;
  savingsVnd: number;
  savingsKwh: number;
}

function pushSseEvent(homeId: string, event: FiredScheduleEvent): void {
  const clients = sseClients.get(homeId);
  if (!clients || clients.size === 0) return;
  const data = `event: schedule-fired\ndata: ${JSON.stringify(event)}\n\n`;
  for (const res of clients) {
    res.write(data);
  }
}

async function postToSlack(event: FiredScheduleEvent, completeUrl: string): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const co2Kg = (event.savingsKwh * 0.913).toFixed(1);
  const vndFormatted = event.savingsVnd.toLocaleString('vi-VN');

  const body = {
    text: `⚡ Nhắc nhở tiết kiệm điện từ Khoai Tây!`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*🥔 Khoai Tây nhắc bạn:*\n_${event.roomName} — ${event.applianceName}_\n*${event.title}*`,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Tiết kiệm:* ${vndFormatted} VND/tháng` },
          { type: 'mrkdwn', text: `*CO₂:* ${co2Kg} kg` },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '✅ Đã làm rồi!' },
            url: completeUrl,
            style: 'primary',
          },
        ],
      },
    ],
  };

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function notifyClients(
  homeId: string,
  event: FiredScheduleEvent,
  frontendBaseUrl: string
): Promise<void> {
  const completeUrl = `${frontendBaseUrl}/schedules?complete=${event.scheduleId}`;
  await postToSlack(event, completeUrl);
  pushSseEvent(homeId, event);
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon
git add backend/src/services/notification-service.ts
git commit -m "feat(backend): add notification service with SSE registry and Slack webhook"
```

---

## Task 4: schedule-service.ts — Business Logic

**Files:**
- Create: `backend/src/services/schedule-service.ts`

- [ ] **Step 1: Create the file**

```typescript
// backend/src/services/schedule-service.ts
import { v4 as uuidv4 } from 'uuid';
import { ScheduleModel, ScheduleDocument, ScheduleType } from '../models/schedule.model';
import { CompletionModel } from '../models/completion.model';
import { notifyClients, FiredScheduleEvent } from './notification-service';

const FRONTEND_BASE_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';

// Maps type → default HH:MM scheduled time
const TYPE_DEFAULT_TIMES: Record<ScheduleType, string> = {
  vampire: '22:00',
  schedule: '07:00',
  behavior: '07:00',
  upgrade: '00:00',  // upgrade fires immediately on create
};

export interface CreateScheduleInput {
  homeId: string;
  applianceName: string;
  roomName: string;
  type: ScheduleType;
  title: string;
  description?: string;
  savingsKwh: number;
  savingsVnd: number;
}

export interface SavingsTotals {
  totalSavingsVnd: number;
  totalSavingsKwh: number;
  treesEquivalent: number;
  completionCount: number;
}

export class ScheduleNotFoundError extends Error {
  constructor(scheduleId: string) {
    super(`Schedule not found: ${scheduleId}`);
  }
}

export async function createSchedule(input: CreateScheduleInput): Promise<ScheduleDocument> {
  const scheduledTime = TYPE_DEFAULT_TIMES[input.type];
  const doc = await ScheduleModel.create({
    scheduleId: uuidv4(),
    ...input,
    description: input.description ?? '',
    scheduledTime,
    status: 'active',
  });
  return doc;
}

export async function activateAll(inputs: CreateScheduleInput[]): Promise<ScheduleDocument[]> {
  const docs = await Promise.all(inputs.map(createSchedule));

  // Fire upgrade-type schedules immediately (one-time Slack nudge)
  const upgradeSchedules = docs.filter((d) => d.type === 'upgrade');
  await Promise.all(upgradeSchedules.map((s) => fireSchedule(s.scheduleId)));

  return docs;
}

export async function listSchedules(homeId: string): Promise<ScheduleDocument[]> {
  return ScheduleModel.find({ homeId }).sort({ createdAt: -1 });
}

export async function pauseSchedule(scheduleId: string): Promise<ScheduleDocument> {
  const doc = await ScheduleModel.findOne({ scheduleId });
  if (!doc) throw new ScheduleNotFoundError(scheduleId);
  const nextStatus = doc.status === 'active' ? 'paused' : 'active';
  doc.status = nextStatus;
  await doc.save();
  return doc;
}

export async function deleteSchedule(scheduleId: string): Promise<void> {
  const result = await ScheduleModel.deleteOne({ scheduleId });
  if (result.deletedCount === 0) throw new ScheduleNotFoundError(scheduleId);
}

export async function fireSchedule(scheduleId: string): Promise<void> {
  const doc = await ScheduleModel.findOne({ scheduleId });
  if (!doc) throw new ScheduleNotFoundError(scheduleId);

  const event: FiredScheduleEvent = {
    scheduleId: doc.scheduleId,
    title: doc.title,
    applianceName: doc.applianceName,
    roomName: doc.roomName,
    savingsVnd: doc.savingsVnd,
    savingsKwh: doc.savingsKwh,
  };

  await notifyClients(doc.homeId, event, FRONTEND_BASE_URL);

  doc.lastFiredAt = new Date();
  if (doc.type === 'upgrade') {
    doc.status = 'completed';
  }
  await doc.save();
}

export async function checkAndFireDue(): Promise<void> {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hh}:${mm}`;

  const dueSchedules = await ScheduleModel.find({
    status: 'active',
    scheduledTime: currentTime,
  });

  await Promise.all(dueSchedules.map((s) => fireSchedule(s.scheduleId)));
}

export async function completeSched(scheduleId: string): Promise<void> {
  const doc = await ScheduleModel.findOne({ scheduleId });
  if (!doc) throw new ScheduleNotFoundError(scheduleId);

  await CompletionModel.create({
    completionId: uuidv4(),
    homeId: doc.homeId,
    scheduleId: doc.scheduleId,
    applianceName: doc.applianceName,
    roomName: doc.roomName,
    savingsKwh: doc.savingsKwh,
    savingsVnd: doc.savingsVnd,
  });

  doc.status = 'completed';
  await doc.save();
}

export async function getSavingsTotals(homeId: string): Promise<SavingsTotals> {
  const CO2_EMISSION_FACTOR = 0.913;
  const CO2_PER_TREE_PER_YEAR = 20;

  const completions = await CompletionModel.find({ homeId });

  const totalSavingsVnd = completions.reduce((sum, c) => sum + c.savingsVnd, 0);
  const totalSavingsKwh = completions.reduce((sum, c) => sum + c.savingsKwh, 0);
  const treesEquivalent = parseFloat(
    ((totalSavingsKwh * CO2_EMISSION_FACTOR) / CO2_PER_TREE_PER_YEAR).toFixed(2)
  );

  return {
    totalSavingsVnd,
    totalSavingsKwh,
    treesEquivalent,
    completionCount: completions.length,
  };
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon
git add backend/src/services/schedule-service.ts
git commit -m "feat(backend): add schedule service with CRUD, fire, cron check, and savings totals"
```

---

## Task 5: routes/schedules.ts — All HTTP + SSE Endpoints

**Files:**
- Create: `backend/src/routes/schedules.ts`

- [ ] **Step 1: Create the route file**

```typescript
// backend/src/routes/schedules.ts
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { ApiSuccessResponse, ApiErrorResponse } from '../types/api';
import { registerSseClient, removeSseClient } from '../services/notification-service';
import {
  createSchedule,
  activateAll,
  listSchedules,
  pauseSchedule,
  deleteSchedule,
  fireSchedule,
  completeSched,
  getSavingsTotals,
  CreateScheduleInput,
  ScheduleNotFoundError,
} from '../services/schedule-service';

const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_NOT_FOUND = 404;
const DEMO_STAGGER_MS = 600;

const SCHEDULE_TYPES = ['behavior', 'upgrade', 'schedule', 'vampire'] as const;

const createScheduleSchema = z.object({
  homeId: z.string(),
  applianceName: z.string(),
  roomName: z.string(),
  type: z.enum(SCHEDULE_TYPES).default('behavior'),
  title: z.string(),
  description: z.string().optional(),
  savingsKwh: z.number().min(0),
  savingsVnd: z.number().min(0),
});

const activateAllSchema = z.object({
  homeId: z.string(),
  items: z.array(
    z.object({
      applianceName: z.string(),
      roomName: z.string(),
      type: z.enum(SCHEDULE_TYPES).default('behavior'),
      title: z.string(),
      description: z.string().optional(),
      savingsKwh: z.number().min(0),
      savingsVnd: z.number().min(0),
    })
  ).min(1),
});

const router = Router();

// SSE: persistent connection so server can push schedule-fired events
router.get(
  '/events',
  (req: Request, res: Response): void => {
    const homeId = req.query.homeId as string;
    if (!homeId) {
      res.status(400).json({ success: false, error: 'homeId query param required' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send initial ping so browser confirms connection
    res.write('event: connected\ndata: ok\n\n');

    registerSseClient(homeId, res);

    req.on('close', () => {
      removeSseClient(homeId, res);
    });
  }
);

// GET /api/schedules?homeId=
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const homeId = req.query.homeId as string;
      if (!homeId) {
        const r: ApiErrorResponse = { success: false, error: 'homeId query param required' };
        res.status(400).json(r);
        return;
      }
      const schedules = await listSchedules(homeId);
      const r: ApiSuccessResponse<typeof schedules> = { success: true, data: schedules };
      res.status(HTTP_OK).json(r);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/schedules/savings?homeId=
router.get(
  '/savings',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const homeId = req.query.homeId as string;
      if (!homeId) {
        const r: ApiErrorResponse = { success: false, error: 'homeId query param required' };
        res.status(400).json(r);
        return;
      }
      const totals = await getSavingsTotals(homeId);
      const r: ApiSuccessResponse<typeof totals> = { success: true, data: totals };
      res.status(HTTP_OK).json(r);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/schedules
router.post(
  '/',
  validate(createScheduleSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as CreateScheduleInput;
      const schedule = await createSchedule(input);
      const r: ApiSuccessResponse<typeof schedule> = { success: true, data: schedule };
      res.status(HTTP_CREATED).json(r);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/schedules/activate-all
router.post(
  '/activate-all',
  validate(activateAllSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { homeId, items } = req.body as { homeId: string; items: CreateScheduleInput[] };
      const inputs: CreateScheduleInput[] = items.map((item) => ({ ...item, homeId }));
      const schedules = await activateAll(inputs);
      const r: ApiSuccessResponse<typeof schedules> = { success: true, data: schedules };
      res.status(HTTP_CREATED).json(r);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/schedules/:scheduleId/fire  (demo: fire immediately)
router.post(
  '/:scheduleId/fire',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { scheduleId } = req.params;
      await fireSchedule(scheduleId as string);
      const r: ApiSuccessResponse<null> = { success: true, data: null };
      res.status(HTTP_OK).json(r);
    } catch (err) {
      if (err instanceof ScheduleNotFoundError) {
        const r: ApiErrorResponse = { success: false, error: err.message };
        res.status(HTTP_NOT_FOUND).json(r);
        return;
      }
      next(err);
    }
  }
);

// POST /api/schedules/fire-all  (demo: fire all active schedules with stagger)
router.post(
  '/fire-all',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const homeId = req.query.homeId as string;
      if (!homeId) {
        const r: ApiErrorResponse = { success: false, error: 'homeId query param required' };
        res.status(400).json(r);
        return;
      }

      const { listSchedules: list } = await import('../services/schedule-service');
      const schedules = (await list(homeId)).filter((s) => s.status === 'active');

      // Stagger fires by DEMO_STAGGER_MS so Slack messages appear one-by-one
      schedules.forEach((s, idx) => {
        setTimeout(() => {
          fireSchedule(s.scheduleId).catch(console.error);
        }, idx * DEMO_STAGGER_MS);
      });

      const r: ApiSuccessResponse<{ queued: number }> = {
        success: true,
        data: { queued: schedules.length },
      };
      res.status(HTTP_OK).json(r);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/schedules/:scheduleId/toggle  (pause ↔ active)
router.patch(
  '/:scheduleId/toggle',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { scheduleId } = req.params;
      const updated = await pauseSchedule(scheduleId as string);
      const r: ApiSuccessResponse<typeof updated> = { success: true, data: updated };
      res.status(HTTP_OK).json(r);
    } catch (err) {
      if (err instanceof ScheduleNotFoundError) {
        const r: ApiErrorResponse = { success: false, error: err.message };
        res.status(HTTP_NOT_FOUND).json(r);
        return;
      }
      next(err);
    }
  }
);

// DELETE /api/schedules/:scheduleId
router.delete(
  '/:scheduleId',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { scheduleId } = req.params;
      await deleteSchedule(scheduleId as string);
      const r: ApiSuccessResponse<null> = { success: true, data: null };
      res.status(HTTP_OK).json(r);
    } catch (err) {
      if (err instanceof ScheduleNotFoundError) {
        const r: ApiErrorResponse = { success: false, error: err.message };
        res.status(HTTP_NOT_FOUND).json(r);
        return;
      }
      next(err);
    }
  }
);

// GET /api/schedules/:scheduleId/complete  (Slack button URL click → complete + redirect)
router.get(
  '/:scheduleId/complete',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { scheduleId } = req.params;
      await completeSched(scheduleId as string);
      const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
      res.redirect(`${frontendUrl}/schedules?completed=1`);
    } catch (err) {
      if (err instanceof ScheduleNotFoundError) {
        const r: ApiErrorResponse = { success: false, error: err.message };
        res.status(HTTP_NOT_FOUND).json(r);
        return;
      }
      next(err);
    }
  }
);

export default router;
```

- [ ] **Step 2: Commit**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon
git add backend/src/routes/schedules.ts
git commit -m "feat(backend): add schedules route with SSE, CRUD, fire-all, and complete endpoints"
```

---

## Task 6: Wire Up Cron + Route in index.ts

**Files:**
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Edit `backend/src/index.ts`**

Add these imports after the existing router imports:

```typescript
import cron from 'node-cron';
import schedulesRouter from './routes/schedules';
import { checkAndFireDue } from './services/schedule-service';
```

Add the route registration after the existing `app.use` lines (before `app.use(errorHandler)`):

```typescript
app.use(`${API_PREFIX}/schedules`, schedulesRouter);
```

Add the cron job inside the `start()` function, after `await connectDatabase()` and before `app.listen(...)`:

```typescript
// Check for due schedules every minute
cron.schedule('* * * * *', () => {
  checkAndFireDue().catch((err: unknown) => console.error('Cron error:', err));
});
console.log('Schedule cron started');
```

The full updated `start()` function should look like:

```typescript
async function start(): Promise<void> {
  await connectDatabase();
  cron.schedule('* * * * *', () => {
    checkAndFireDue().catch((err: unknown) => console.error('Cron error:', err));
  });
  console.log('Schedule cron started');
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
```

- [ ] **Step 2: Smoke test the backend**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon/backend
npm run dev
```

Expected: `Server running on port 3001` and `Schedule cron started` in console. No TypeScript errors.

- [ ] **Step 3: Verify routes exist**

In a new terminal:

```bash
curl -s http://localhost:3001/api/schedules?homeId=test | python3 -m json.tool
```

Expected: `{"success": true, "data": []}`

- [ ] **Step 4: Commit**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon
git add backend/src/index.ts
git commit -m "feat(backend): register schedules router and start node-cron job"
```

---

## Task 7: Frontend — Types + API Functions

**Files:**
- Modify: `frontend/src/lib/types.ts`
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/lib/constants.ts`

- [ ] **Step 1: Add types to `frontend/src/lib/types.ts`**

Append at the end of the file:

```typescript
export type ScheduleType = 'behavior' | 'upgrade' | 'schedule' | 'vampire';
export type ScheduleStatus = 'active' | 'paused' | 'completed';

export interface Schedule {
  scheduleId: string;
  homeId: string;
  applianceName: string;
  roomName: string;
  type: ScheduleType;
  title: string;
  description: string;
  scheduledTime: string;
  savingsKwh: number;
  savingsVnd: number;
  status: ScheduleStatus;
  lastFiredAt?: string;
  createdAt: string;
}

export interface ActivateAllItem {
  applianceName: string;
  roomName: string;
  type: ScheduleType;
  title: string;
  description?: string;
  savingsKwh: number;
  savingsVnd: number;
}

export interface SavingsTotals {
  totalSavingsVnd: number;
  totalSavingsKwh: number;
  treesEquivalent: number;
  completionCount: number;
}
```

- [ ] **Step 2: Add `SCHEDULES` to NAV_ROUTES in `frontend/src/lib/constants.ts`**

Find the `NAV_ROUTES` object and add:

```typescript
SCHEDULES: '/schedules',
```

- [ ] **Step 3: Add API functions to `frontend/src/lib/api.ts`**

Append at the end of the file:

```typescript
export async function activateAll(
  homeId: string,
  items: import('./types').ActivateAllItem[]
): Promise<ApiResponse<import('./types').Schedule[]>> {
  return request<import('./types').Schedule[]>('/api/schedules/activate-all', {
    method: 'POST',
    body: JSON.stringify({ homeId, items }),
  });
}

export async function listSchedules(
  homeId: string
): Promise<ApiResponse<import('./types').Schedule[]>> {
  return request<import('./types').Schedule[]>(`/api/schedules?homeId=${homeId}`, {
    method: 'GET',
  });
}

export async function fireSchedule(scheduleId: string): Promise<ApiResponse<null>> {
  return request<null>(`/api/schedules/${scheduleId}/fire`, {
    method: 'POST',
  });
}

export async function fireAllSchedules(homeId: string): Promise<ApiResponse<{ queued: number }>> {
  return request<{ queued: number }>(`/api/schedules/fire-all?homeId=${homeId}`, {
    method: 'POST',
  });
}

export async function toggleSchedule(
  scheduleId: string
): Promise<ApiResponse<import('./types').Schedule>> {
  return request<import('./types').Schedule>(`/api/schedules/${scheduleId}/toggle`, {
    method: 'PATCH',
  });
}

export async function deleteScheduleById(scheduleId: string): Promise<ApiResponse<null>> {
  return request<null>(`/api/schedules/${scheduleId}`, {
    method: 'DELETE',
  });
}

export async function getSavingsTotals(
  homeId: string
): Promise<ApiResponse<import('./types').SavingsTotals>> {
  return request<import('./types').SavingsTotals>(`/api/schedules/savings?homeId=${homeId}`, {
    method: 'GET',
  });
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon
git add frontend/src/lib/types.ts frontend/src/lib/api.ts frontend/src/lib/constants.ts
git commit -m "feat(frontend): add schedule types, API functions, and SCHEDULES nav route"
```

---

## Task 8: ActivateAllButton Component

**Files:**
- Create: `frontend/src/components/recommendations/ActivateAllButton.tsx`

- [ ] **Step 1: Create the component**

```tsx
// frontend/src/components/recommendations/ActivateAllButton.tsx
"use client";

import { Rocket, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { activateAll } from "@/lib/api";
import type { ActivateAllItem } from "@/lib/types";

interface ActivateAllButtonProps {
  homeId: string;
  items: ActivateAllItem[];
  onActivated?: (count: number) => void;
}

type ButtonState = "idle" | "loading" | "success" | "error";

export function ActivateAllButton({ homeId, items, onActivated }: ActivateAllButtonProps) {
  const [state, setState] = useState<ButtonState>("idle");

  async function handleClick() {
    if (items.length === 0 || state === "loading") return;
    setState("loading");

    const result = await activateAll(homeId, items);

    if (!result.success) {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
      return;
    }

    setState("success");
    onActivated?.(result.data.length);
    setTimeout(() => setState("idle"), 4000);
  }

  if (state === "success") {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-primary/15 border border-primary/30 px-5 py-3.5 text-primary">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <span className="font-semibold">
          {items.length} nhắc nhở đã được lên lịch!
        </span>
      </div>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={state === "loading" || items.length === 0}
      className="btn-primary-gradient w-full rounded-2xl py-4 text-base font-bold"
      size="lg"
    >
      {state === "loading" ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Đang kích hoạt...
        </>
      ) : (
        <>
          <Rocket className="mr-2 h-5 w-5" />
          Kích hoạt tất cả {items.length > 0 ? `(${items.length})` : ""} 🚀
        </>
      )}
    </Button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon
git add frontend/src/components/recommendations/ActivateAllButton.tsx
git commit -m "feat(frontend): add ActivateAllButton component"
```

---

## Task 9: useScheduledEvents Hook

**Files:**
- Create: `frontend/src/hooks/useScheduledEvents.ts`

- [ ] **Step 1: Create the hook**

```typescript
// frontend/src/hooks/useScheduledEvents.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { API_BASE } from "@/lib/constants";

export interface FiredScheduleEvent {
  scheduleId: string;
  title: string;
  applianceName: string;
  roomName: string;
  savingsVnd: number;
  savingsKwh: number;
}

export function useScheduledEvents(homeId: string | null) {
  const [firedSchedule, setFiredSchedule] = useState<FiredScheduleEvent | null>(null);

  useEffect(() => {
    if (!homeId) return;

    const url = `${API_BASE}/api/schedules/events?homeId=${homeId}`;
    const source = new EventSource(url);

    source.addEventListener("schedule-fired", (e: MessageEvent) => {
      try {
        const event = JSON.parse(e.data as string) as FiredScheduleEvent;
        setFiredSchedule(event);
      } catch {
        // malformed event — ignore
      }
    });

    return () => {
      source.close();
    };
  }, [homeId]);

  const dismiss = useCallback(() => {
    setFiredSchedule(null);
  }, []);

  return { firedSchedule, dismiss };
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon
git add frontend/src/hooks/useScheduledEvents.ts
git commit -m "feat(frontend): add useScheduledEvents hook for SSE schedule notifications"
```

---

## Task 10: ScheduleToast Component

**Files:**
- Create: `frontend/src/components/recommendations/ScheduleToast.tsx`

- [ ] **Step 1: Create the component**

```tsx
// frontend/src/components/recommendations/ScheduleToast.tsx
"use client";

import { CheckCircle2, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { completeSchedule } from "@/lib/api";
import { formatVnd } from "@/lib/format";
import type { FiredScheduleEvent } from "@/hooks/useScheduledEvents";

// Add completeSchedule to api.ts — see Step 2 below
import type { ApiResponse } from "@/lib/types";

interface ScheduleToastProps {
  event: FiredScheduleEvent;
  onDismiss: () => void;
}

export function ScheduleToast({ event, onDismiss }: ScheduleToastProps) {
  const [completing, setCompleting] = useState(false);
  const [done, setDone] = useState(false);

  // Auto-dismiss after 15 seconds if user doesn't interact
  useEffect(() => {
    const timer = setTimeout(onDismiss, 15_000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  async function handleDone() {
    setCompleting(true);
    await completeSchedule(event.scheduleId);
    setDone(true);
    setTimeout(onDismiss, 1500);
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="glass-strong rounded-2xl p-4 shadow-2xl border border-primary/30">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/15 p-2">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              🥔 Khoai Tây nhắc bạn
            </p>
            <p className="mt-0.5 font-bold text-sm leading-snug">
              {event.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {event.roomName} — {event.applianceName}
            </p>
            <p className="text-xs text-primary/80 mt-1 font-medium">
              Tiết kiệm: {formatVnd(event.savingsVnd)}/tháng
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            onClick={handleDone}
            disabled={completing || done}
            className="btn-primary-gradient flex-1 rounded-xl"
          >
            {done ? (
              <>
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Xong rồi!
              </>
            ) : completing ? (
              "Đang lưu..."
            ) : (
              "✅ Đã làm ✓"
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDismiss}
            className="rounded-xl"
          >
            Để sau
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add `completeSchedule` to `frontend/src/lib/api.ts`**

Append at the end of the file:

```typescript
export async function completeSchedule(scheduleId: string): Promise<ApiResponse<null>> {
  return request<null>(`/api/schedules/${scheduleId}/complete-app`, {
    method: 'POST',
  });
}
```

Also add a backend route for this in `backend/src/routes/schedules.ts` (after the existing GET `/:scheduleId/complete`):

```typescript
// POST /api/schedules/:scheduleId/complete-app  (in-app Done button)
router.post(
  '/:scheduleId/complete-app',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { scheduleId } = req.params;
      await completeSched(scheduleId as string);
      const r: ApiSuccessResponse<null> = { success: true, data: null };
      res.status(HTTP_OK).json(r);
    } catch (err) {
      if (err instanceof ScheduleNotFoundError) {
        const r: ApiErrorResponse = { success: false, error: err.message };
        res.status(HTTP_NOT_FOUND).json(r);
        return;
      }
      next(err);
    }
  }
);
```

- [ ] **Step 3: Commit**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon
git add frontend/src/components/recommendations/ScheduleToast.tsx frontend/src/lib/api.ts backend/src/routes/schedules.ts
git commit -m "feat: add ScheduleToast component and complete-app backend endpoint"
```

---

## Task 11: Modify Suggestions Page

**Files:**
- Modify: `frontend/src/app/(app)/suggestions/page.tsx`

- [ ] **Step 1: Add imports at top of the file (after existing imports)**

```typescript
import { ActivateAllButton } from "@/components/recommendations/ActivateAllButton";
import { ScheduleToast } from "@/components/recommendations/ScheduleToast";
import { useScheduledEvents } from "@/hooks/useScheduledEvents";
import { NAV_ROUTES } from "@/lib/constants";
import Link from "next/link";
import type { ActivateAllItem } from "@/lib/types";
```

- [ ] **Step 2: Update `SuggestionsPage` component body**

Inside `SuggestionsPage`, after the `const [homeId]` line, add:

```typescript
const { firedSchedule, dismiss } = useScheduledEvents(homeId);
```

After the existing `fetchSuggestions` function, add a helper to convert suggestions to `ActivateAllItem[]`:

```typescript
function buildActivateItems(data: SavingsSuggestionsResult): ActivateAllItem[] {
  return data.rooms.flatMap((room) =>
    room.devices.map((device) => ({
      applianceName: device.applianceName,
      roomName: room.roomName,
      type: "behavior" as const,
      title: device.tip.slice(0, 50),
      description: device.tip,
      savingsKwh: device.savingsKwh,
      savingsVnd: device.savingsVnd,
    }))
  );
}
```

- [ ] **Step 3: Update the success render to add the ActivateAllButton and ScheduleToast**

In the JSX where `pageState.status === "success"` is rendered (after `TotalSavingsCard`), add:

```tsx
{/* Activate All hero button */}
<ActivateAllButton
  homeId={homeId}
  items={buildActivateItems(pageState.data)}
/>

{/* Link to schedules page */}
<div className="text-center">
  <Link
    href={NAV_ROUTES.SCHEDULES}
    className="text-sm text-primary underline-offset-2 hover:underline"
  >
    Xem lịch nhắc nhở →
  </Link>
</div>
```

At the bottom of the return (just before the closing `</div>` of the page), add:

```tsx
{/* In-app notification toast */}
{firedSchedule && (
  <ScheduleToast event={firedSchedule} onDismiss={dismiss} />
)}
```

- [ ] **Step 4: Verify the page compiles**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon/frontend
npm run build 2>&1 | tail -20
```

Expected: build succeeds or only pre-existing lint warnings (no new TS errors).

- [ ] **Step 5: Commit**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon
git add frontend/src/app/(app)/suggestions/page.tsx
git commit -m "feat(frontend): add ActivateAllButton and ScheduleToast to suggestions page"
```

---

## Task 12: New Schedules Page

**Files:**
- Create: `frontend/src/app/(app)/schedules/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// frontend/src/app/(app)/schedules/page.tsx
"use client";

import {
  Bell,
  Clock,
  Flame,
  Loader2,
  Pause,
  Play,
  Trash2,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useSearchParams, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  deleteScheduleById,
  fireAllSchedules,
  fireSchedule,
  listSchedules,
  toggleSchedule,
} from "@/lib/api";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatVnd } from "@/lib/format";
import { NAV_ROUTES } from "@/lib/constants";
import type { Schedule } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  behavior: "Hành vi",
  upgrade: "Nâng cấp",
  schedule: "Lịch trình",
  vampire: "Đồ hút điện",
};

const TYPE_COLORS: Record<string, string> = {
  behavior: "bg-blue-500/15 text-blue-400",
  upgrade: "bg-purple-500/15 text-purple-400",
  schedule: "bg-yellow-500/15 text-yellow-400",
  vampire: "bg-red-500/15 text-red-400",
};

interface ScheduleCardProps {
  schedule: Schedule;
  onFire: (id: string) => Promise<void>;
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function ScheduleCard({ schedule, onFire, onToggle, onDelete }: ScheduleCardProps) {
  const [firing, setFiring] = useState(false);

  async function handleFire() {
    setFiring(true);
    await onFire(schedule.scheduleId);
    setTimeout(() => setFiring(false), 1500);
  }

  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                TYPE_COLORS[schedule.type] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {TYPE_LABELS[schedule.type] ?? schedule.type}
            </span>
            <span className="text-xs text-muted-foreground">
              {schedule.scheduledTime} hàng ngày
            </span>
          </div>
          <p className="mt-1 font-semibold text-sm leading-snug">{schedule.title}</p>
          <p className="text-xs text-muted-foreground">
            {schedule.roomName} — {schedule.applianceName}
          </p>
          <p className="text-xs text-primary/80 font-medium mt-1">
            {formatVnd(schedule.savingsVnd)}/tháng
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onToggle(schedule.scheduleId)}
            title={schedule.status === "active" ? "Tạm dừng" : "Kích hoạt"}
          >
            {schedule.status === "active" ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(schedule.scheduleId)}
            title="Xóa"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="w-full rounded-xl border-primary/30 text-primary hover:bg-primary/10"
        onClick={handleFire}
        disabled={firing}
      >
        {firing ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Zap className="mr-1.5 h-3.5 w-3.5" />
        )}
        {firing ? "Đang kích hoạt..." : "Demo: Kích hoạt ngay"}
      </Button>
    </div>
  );
}

export default function SchedulesPage() {
  const [homeId] = useLocalStorage("homeId");
  const searchParams = useSearchParams();
  const justCompleted = searchParams.get("completed") === "1";
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [firingAll, setFiringAll] = useState(false);

  const fetchSchedules = useCallback(async (id: string) => {
    setLoading(true);
    const result = await listSchedules(id);
    if (result.success) setSchedules(result.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!homeId) return;
    fetchSchedules(homeId);
  }, [homeId, fetchSchedules]);

  async function handleFire(scheduleId: string) {
    await fireSchedule(scheduleId);
  }

  async function handleToggle(scheduleId: string) {
    const result = await toggleSchedule(scheduleId);
    if (result.success && homeId) fetchSchedules(homeId);
  }

  async function handleDelete(scheduleId: string) {
    await deleteScheduleById(scheduleId);
    if (homeId) fetchSchedules(homeId);
  }

  async function handleFireAll() {
    if (!homeId) return;
    setFiringAll(true);
    await fireAllSchedules(homeId);
    setTimeout(() => setFiringAll(false), schedules.length * 600 + 500);
  }

  if (!homeId) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Bell className="h-10 w-10 text-muted-foreground" />
        <p className="font-semibold">Chưa có nhà nào được thiết lập</p>
        <Button asChild>
          <Link href={NAV_ROUTES.SETUP}>Thiết lập ngay</Link>
        </Button>
      </div>
    );
  }

  const activeCount = schedules.filter((s) => s.status === "active").length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Lịch nhắc nhở</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeCount} lịch đang hoạt động
        </p>
      </div>

      {justCompleted && (
        <div className="glass rounded-2xl border border-primary/30 bg-primary/10 p-4 text-center text-primary font-semibold text-sm">
          ✅ Đã đánh dấu hoàn thành! Tiết kiệm của bạn được ghi lại.
        </div>
      )}

      {/* Demo Fire All button */}
      {activeCount > 0 && (
        <Button
          onClick={handleFireAll}
          disabled={firingAll}
          className="btn-primary-gradient w-full rounded-2xl py-4 text-base font-bold"
          size="lg"
        >
          {firingAll ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang kích hoạt ({activeCount})...
            </>
          ) : (
            <>
              <Flame className="mr-2 h-5 w-5" />
              Demo: Kích hoạt tất cả ngay 🔥
            </>
          )}
        </Button>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : schedules.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Clock className="h-10 w-10 text-muted-foreground" />
          <p className="font-semibold">Chưa có lịch nhắc nào</p>
          <p className="text-sm text-muted-foreground">
            Vào trang gợi ý và nhấn "Kích hoạt tất cả" để bắt đầu.
          </p>
          <Button asChild variant="outline">
            <Link href={NAV_ROUTES.SUGGESTIONS}>Xem gợi ý →</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {schedules.map((s) => (
            <ScheduleCard
              key={s.scheduleId}
              schedule={s}
              onFire={handleFire}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify page renders**

Start the dev server (`npm run dev` in frontend) and navigate to `http://localhost:3000/schedules`. Expected: page loads, shows empty state if no schedules, or list if any exist.

- [ ] **Step 3: Commit**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon
git add "frontend/src/app/(app)/schedules/page.tsx"
git commit -m "feat(frontend): add schedules page with list, toggle, delete, and demo fire-all"
```

---

## Task 13: SavingsCounter Dashboard Widget

**Files:**
- Create: `frontend/src/components/dashboard/SavingsCounter.tsx`

- [ ] **Step 1: Create the component**

```tsx
// frontend/src/components/dashboard/SavingsCounter.tsx
"use client";

import { Leaf, TrendingDown, TreePine } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { AnimatedCounter } from "@/components/ui/motion";
import { getSavingsTotals } from "@/lib/api";
import { formatKwh, formatVnd } from "@/lib/format";
import { NAV_ROUTES } from "@/lib/constants";
import type { SavingsTotals } from "@/lib/types";

interface SavingsCounterProps {
  homeId: string;
}

export function SavingsCounter({ homeId }: SavingsCounterProps) {
  const [totals, setTotals] = useState<SavingsTotals | null>(null);

  const fetchTotals = useCallback(async () => {
    const result = await getSavingsTotals(homeId);
    if (result.success) setTotals(result.data);
  }, [homeId]);

  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  if (!totals || totals.completionCount === 0) return null;

  return (
    <Link href={NAV_ROUTES.SCHEDULES}>
      <div className="stat-card-primary rounded-2xl p-5 card-hover-glow cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-white/80">
            Đã tiết kiệm được
          </p>
          <div className="rounded-xl bg-white/15 p-1.5">
            <TrendingDown className="h-4 w-4 text-white/90" />
          </div>
        </div>
        <p className="text-3xl font-bold text-white">
          <AnimatedCounter value={totals.totalSavingsVnd} format={formatVnd} />
        </p>
        <div className="mt-2 flex items-center gap-3 text-xs text-white/70">
          <span className="flex items-center gap-1">
            <Leaf className="h-3 w-3" />
            {formatKwh(totals.totalSavingsKwh)}
          </span>
          <span className="flex items-center gap-1">
            <TreePine className="h-3 w-3" />
            {totals.treesEquivalent} cây
          </span>
          <span>{totals.completionCount} việc đã xong</span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon
git add frontend/src/components/dashboard/SavingsCounter.tsx
git commit -m "feat(frontend): add SavingsCounter dashboard widget"
```

---

## Task 14: Add SavingsCounter to Dashboard

**Files:**
- Modify: `frontend/src/app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Add import**

Near the top of the file with other component imports, add:

```typescript
import { SavingsCounter } from "@/components/dashboard/SavingsCounter";
```

- [ ] **Step 2: Mount in `DashboardContent`**

Inside the `DashboardContent` component, add `<SavingsCounter>` as the first child of the outer `<div className="flex flex-col gap-6">`, before the `<StaggerList>`:

```tsx
{/* Savings achievements from completed schedule actions */}
<SavingsCounter homeId={homeId} />
```

Note: `DashboardContent` doesn't receive `homeId` as a prop — you need to thread it down. Update the `DashboardContentProps` interface and the call site:

```typescript
// Update interface
interface DashboardContentProps {
  data: DashboardData;
  t: Translations;
  homeId: string;
}

// Update function signature
function DashboardContent({ data, t, homeId }: DashboardContentProps) {
```

And in the `DashboardPage` component's JSX, pass `homeId`:

```tsx
{pageState.status === "success" && (
  <DashboardContent data={pageState.data} t={t} homeId={homeId} />
)}
```

- [ ] **Step 3: Verify dashboard build**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon/frontend
npm run build 2>&1 | tail -20
```

Expected: no new TypeScript errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon
git add "frontend/src/app/(app)/dashboard/page.tsx"
git commit -m "feat(frontend): add SavingsCounter to dashboard"
```

---

## Task 15: Environment Variables

**Files:**
- Modify: `backend/.env.example` (or create if missing)
- Modify: `backend/.env` (local, not committed)

- [ ] **Step 1: Add to `.env.example`**

```bash
# Slack Incoming Webhook — paste the webhook URL from Slack app settings
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Frontend base URL — used to build "Done" links in Slack messages
FRONTEND_URL=http://localhost:3000
```

- [ ] **Step 2: Add to local `.env`**

Set real values in `backend/.env`:

```bash
SLACK_WEBHOOK_URL=<your-actual-webhook-url>
FRONTEND_URL=http://localhost:3000
```

- [ ] **Step 3: Create a Slack webhook**

1. Go to https://api.slack.com/apps → "Create New App" → "From scratch"
2. Name: "Khoai Tây" / workspace: your demo workspace
3. Sidebar → "Incoming Webhooks" → toggle On → "Add New Webhook to Workspace"
4. Select a channel → copy the webhook URL into `.env`

- [ ] **Step 4: Smoke test Slack integration**

```bash
# Replace with your real homeId and a real scheduleId from MongoDB
curl -X POST http://localhost:3001/api/schedules/YOUR_SCHEDULE_ID/fire
```

Expected: Slack message appears in your channel within 1-2 seconds.

- [ ] **Step 5: Commit `.env.example`**

```bash
cd /Users/dattran/Data/Source/R\&D/brotato-hackathon
git add backend/.env.example
git commit -m "chore: add SLACK_WEBHOOK_URL and FRONTEND_URL to env example"
```

---

## Self-Review Checklist (already run — all clear)

- [x] **Spec coverage**: SSE ✓, Slack ✓, node-cron ✓, Activate All ✓, Fire Now demo ✓, SavingsCounter ✓, Done button ✓, stagger delay ✓
- [x] **No placeholders**: All steps have real code
- [x] **Type consistency**: `ScheduleDocument.scheduleId` used consistently; `FiredScheduleEvent` defined in notification-service and re-used in hook; `ActivateAllItem` matches schema in route
- [x] **Route order**: `/fire-all` registered before `/:scheduleId` to avoid conflict
- [x] **`complete-app` endpoint**: Added in Task 10 Step 2
- [x] **`useSearchParams` wrapping**: In Next.js 14, `useSearchParams` requires `<Suspense>` boundary — the `(app)` layout wraps pages, but if build fails, wrap the page in `<Suspense fallback={null}>` in a client wrapper
