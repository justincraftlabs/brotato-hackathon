# Design: "Kích hoạt tất cả" — Actionable Schedules + Slack + Savings Tracker

**Date:** 2026-04-17  
**Goal:** Turn AI recommendations into live, demo-able scheduled actions that fire to Slack and in-app, with a savings completion counter on the dashboard.  
**Demo target:** 30-second wow moment — Activate All → Slack cascade → Done → savings counter rolls up.

---

## 1. Architecture Overview

```
Recommendations (existing) → "Kích hoạt tất cả 🚀" button
                                    ↓
                          Schedule records in Mongo
                                    ↓
                    node-cron (every 1 min) + "Fire now" demo button
                          ↙                    ↘
            Slack webhook POST          SSE event → in-app toast
                          ↘                    ↙
                    User taps "Đã làm ✓"
                                    ↓
                          Completion record in Mongo
                                    ↓
                    Dashboard savings counter (VND + kWh + trees)
```

**Boundaries:**
- Scheduler runs in-process on Express (node-cron). No Redis/BullMQ.
- Slack is the only external channel (webhook URL in env, no OAuth).
- Browser push notifications (Web Push / Service Worker) are **out of scope** for this version.
- In-app notifications via existing SSE infrastructure (same pattern as chat).

---

## 2. Data Models

### `Schedule`
```typescript
{
  homeId: ObjectId           // ref: Home
  applianceName: string
  roomName: string
  type: "behavior" | "upgrade" | "schedule" | "vampire"
  title: string              // from recommendation (Vietnamese, max 50 chars)
  description: string        // from recommendation
  scheduledTime: string      // "HH:MM" 24h local time
  savingsKwh: number
  savingsVnd: number
  status: "active" | "paused" | "completed"
  lastFiredAt?: Date
  createdAt: Date
}
```

### `Completion`
```typescript
{
  homeId: ObjectId
  scheduleId: ObjectId       // ref: Schedule
  applianceName: string
  roomName: string
  savingsKwh: number         // copied from schedule at completion time
  savingsVnd: number
  completedAt: Date
}
```

---

## 3. Auto-Time Assignment by Type

When "Activate All" is tapped, each recommendation gets a time based on its `type`:

| Type | Assigned Time | Rationale |
|------|--------------|-----------|
| `vampire` | 22:00 | Bedtime — remind to unplug standby devices |
| `schedule` | 07:00 | Morning reminder to adjust usage timing for the day |
| `behavior` | 07:00 | Morning nudge before day starts |
| `upgrade` | Immediate (fires once on activation) | One-time Slack message with shopping context |

---

## 4. API Routes (`/api/schedules`)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/schedules` | Create one schedule |
| `POST` | `/api/schedules/activate-all` | Batch-create from recommendations array |
| `GET` | `/api/schedules?homeId=` | List schedules for a home |
| `PATCH` | `/api/schedules/:id` | Update status (pause/activate) |
| `DELETE` | `/api/schedules/:id` | Remove schedule |
| `POST` | `/api/schedules/:id/fire` | Demo: fire immediately (Slack + SSE) |
| `GET` | `/api/schedules/:id/complete` | Mark done → create Completion (GET so Slack button URL works) |
| `GET` | `/api/schedules/savings?homeId=` | Aggregate savings from Completions |

All responses use the standard `{ success, data }` envelope.

---

## 5. Notification Service

### Slack Webhook
```typescript
// services/notification-service.ts
async function postToSlack(schedule: Schedule): Promise<void>
```
Payload format:
```json
{
  "text": "⚡ Nhắc nhở tiết kiệm điện!",
  "blocks": [
    { "type": "section", "text": { "type": "mrkdwn",
      "text": "*🥔 Khoai Tây nhắc bạn:*\n_Phòng {roomName} — {applianceName}_\n{title}" }},
    { "type": "section", "fields": [
      { "type": "mrkdwn", "text": "*Tiết kiệm:* {savingsVnd} VND/tháng" },
      { "type": "mrkdwn", "text": "*CO₂:* {savingsKwh × 0.913} kg" }
    ]},
    { "type": "actions", "elements": [
      { "type": "button", "text": { "type": "plain_text", "text": "✅ Đã làm rồi!" },
        "url": "http://localhost:3000/schedules/{id}/complete" }
    ]}
  ]
}
```

### In-App SSE Event
Reuses the existing SSE pattern from `/api/ai/chat`. When a schedule fires, the backend emits:
```
event: schedule-fired
data: { scheduleId, title, applianceName, roomName, savingsVnd }
```
Frontend listens on `/api/schedules/events?homeId=` and shows an animated toast.

---

## 6. node-cron Setup

In `backend/src/index.ts`:
```typescript
import cron from "node-cron";
// Runs every minute
cron.schedule("* * * * *", () => scheduleService.checkAndFireDue());
```

`checkAndFireDue()` queries `Schedule.find({ status: "active", scheduledTime: currentHHMM })`, fires each (Slack + SSE), updates `lastFiredAt`.

**Demo "fire all" endpoint** stagger: each schedule fires with a `600ms × index` setTimeout delay so Slack messages appear one-by-one on stage rather than all at once.

---

## 7. Frontend Changes

### `/suggestions` or `/chat` page
- Each recommendation card gains an "Kích hoạt" button (individual)
- Hero "Kích hoạt tất cả 🚀" button at top — calls `POST /api/schedules/activate-all`
- Success state: banner "5 nhắc nhở đã được lên lịch!"

### `/schedules` page (new)
- List of active schedules per home
- Toggle pause/active per schedule
- "Demo: Kích hoạt ngay 🔥" button → calls `POST /api/schedules/:id/fire`
- "Demo: Kích hoạt tất cả ngay" → fires all active schedules immediately (for demo)

### Dashboard widget (new): `SavingsCounter`
- Calls `GET /api/schedules/savings?homeId=`
- Displays: **VND tiết kiệm được**, **kWh**, **🌳 số cây tương đương**
- Animated number roll-up on value change (CSS counter animation)
- Position: new card row below EVN tier progress bar

---

## 8. Environment Variables

```bash
# backend/.env additions
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../...
```

No new frontend env vars needed (savings counter reads from same API base URL).

---

## 9. Files Added / Modified

### New (Backend)
- `models/schedule.model.ts`
- `models/completion.model.ts`
- `services/schedule-service.ts`
- `services/notification-service.ts`
- `routes/schedules.ts`

### Modified (Backend)
- `index.ts` — register cron + new route

### New (Frontend)
- `app/schedules/page.tsx`
- `components/recommendations/ActivateAllButton.tsx`
- `components/dashboard/SavingsCounter.tsx`
- `hooks/useScheduledEvents.ts` — SSE listener for schedule-fired events

### Modified (Frontend)
- `app/dashboard/page.tsx` — add `SavingsCounter`
- `app/chat/page.tsx` or `suggestions/page.tsx` — add activate buttons
- `lib/api.ts` — new schedule + completion + savings endpoints

---

## 10. Demo Script (30 seconds)

| Step | Action | What audience sees |
|------|--------|--------------------|
| 1 | Navigate to recommendations | 5 recommendation cards visible |
| 2 | Tap **"Kích hoạt tất cả 🚀"** | Banner: "5 nhắc nhở đã được lên lịch!" |
| 3 | Navigate to `/schedules` | List of 5 active schedules with times |
| 4 | Tap **"Demo: Kích hoạt tất cả ngay 🔥"** | Slack channel: 4-5 messages appear staggered |
| 5 | In-app toast fires on phone | "⚡ Tắt máy lạnh phòng ngủ trước khi ngủ!" |
| 6 | Tap **"Đã làm ✓"** on toast | Toast dismisses |
| 7 | Navigate to Dashboard | **"Đã tiết kiệm: 287,000 VND / 12.6 kWh / 🌳 0.6 cây"** |

---

## 11. Out of Scope

- Web Push / Service Worker notifications (iOS fragility risk)
- Recurring daily/weekly schedules (one-shot per demo)
- Zalo Official Account integration (requires business verification)
- Email delivery
- Multi-user / family sharing
- Real smart plug control (TP-Link, Tuya)
