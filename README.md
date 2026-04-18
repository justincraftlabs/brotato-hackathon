<div align="center">

```
  ███████╗       ██╗     ██╗   ██╗███╗   ███╗██╗      ███╗   ██╗ █████╗ ████████╗███████╗
  ██╔════╝       ██║     ██║   ██║████╗ ████║██║      ████╗  ██║██╔══██╗╚══██╔══╝██╔════╝
█████╗   █████╗██║     ██║   ██║██╔████╔██║██║█████╗██╔██╗ ██║███████║   ██║   █████╗
██╔══╝   ╚════╝██║     ██║   ██║██║╚██╔╝██║██║╚════╝██║╚██╗██║██╔══██║   ██║   ██╔══╝
  ███████╗       ███████╗╚██████╔╝██║ ╚═╝ ██║██║      ██║ ╚████║██║  ██║   ██║   ███████╗
  ╚══════╝       ╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝      ╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
```

### **Illuminate the waste. Eliminate the bill.**

AI-powered home energy intelligence for Vietnamese households — meet **Trợ Lý Khoai Tây**, your witty, eco-minded energy assistant.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Claude](https://img.shields.io/badge/Claude-Sonnet_4.6-D97757)](https://www.anthropic.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)

[**Features**](#-features) • [**Live Demo**](#-quick-start) • [**Architecture**](#-architecture) • [**AI Use Cases**](#-ai-use-cases) • [**Roadmap**](#-roadmap)

</div>

---

## The Problem

Vietnamese households are paying more than ever for electricity — and most of them don't know why.

- **EVN's 6-tier pricing** punishes overconsumption: cross 400 kWh and you pay **74% more per kWh** than tier 1.
- **Vampire loads** (standby appliances) silently drain 5–15% of every bill, 24/7.
- Families can see the bill, but **not where the waste is hiding**.
- Existing apps give raw numbers. Nobody translates them into *"turn off the TV when you're not watching it, dude."*

## The Solution

**E-LUMI-NATE** is a mobile-first web app that turns raw home data into actionable, personality-driven advice — powered by **Claude Sonnet 4.6** and narrated by a witty Vietnamese AI persona.

```
  Take a photo of your fridge       →   Claude Vision identifies wattage & brand
  Tell it "máy lạnh bật 8 tiếng"   →   Claude estimates cost in VND + CO2 in kg
  Ask "sao tháng này cao vậy?"     →   Khoai Tây explains, roasts, and advises
  Activate a tip                    →   Cron fires a Slack reminder at the right hour
```

No logins. No friction. Just **illumination**.

---

## Meet Trợ Lý Khoai Tây

<table>
<tr>
<td width="60%">

> *"Chào bạn! Tui là Khoai Tây — trợ lý điện năng thông minh, hơi lầy nhưng siêu có tâm. Tui giúp bạn soi ra từng đồng đang bay hơi trong cái hóa đơn điện, rồi chỉ cách giữ lại nó. Vừa tiết kiệm tiền, vừa cứu địa cầu — deal chưa?"*

**Trợ Lý Khoai Tây** (*"Brotato Assistant"*) is the soul of E-LUMI-NATE. Streaming responses over **Server-Sent Events**, grounded in your home's live appliance data, and speaking fluent, playful Vietnamese — Khoai Tây doesn't just report your usage, it **roasts**, **explains**, and **guides**.

</td>
<td align="center">

**Personality**

Witty · Eco-minded · Pragmatic

**Voice**

`vi-VN` native · Streaming

**Powered by**

Claude Sonnet 4.6

**Inputs**

Text · Voice · Camera

</td>
</tr>
</table>

---

## Features

<table>
<tr>
<th>ID</th>
<th>Feature</th>
<th>What it does</th>
</tr>

<tr><td><b>F1</b></td><td><b>Home Setup Wizard</b></td>
<td>Add rooms and appliances three ways: type, <b>speak</b> (Web Speech API), or <b>snap a photo</b> (Claude Vision). Claude auto-fills wattage, standby draw, and appliance type from a Vietnamese name alone.</td></tr>

<tr><td><b>F2</b></td><td><b>Energy Dashboard</b></td>
<td>Top consumers, EVN tier progress bar, anomaly detection, vampire appliance alerts, waste hotspots, monthly bill projection, savings forecast, CO2 tree visual — all live, all mobile-first.</td></tr>

<tr><td><b>F3</b></td><td><b>AI Chat — Khoai Tây</b></td>
<td>Streaming Vietnamese chat grounded in your home's data. Ask anything, get personalized answers with embedded action cards ("Apply this tip", "Schedule this reminder").</td></tr>

<tr><td><b>F4</b></td><td><b>Green Heatmap Simulator</b></td>
<td>Dial an appliance's hours or wattage up/down — see the <b>VND saved</b> and <b>kg CO2 avoided</b> recalculate live. What-if modeling without the spreadsheet.</td></tr>

<tr><td><b>F5</b></td><td><b>Voice Input</b></td>
<td>Hands-free appliance entry and chat via the browser-native Web Speech API, tuned for Vietnamese (<code>lang: vi-VN</code>).</td></tr>

<tr><td><b>F6</b></td><td><b>Image Recognition</b></td>
<td>Point your camera at an appliance. Claude Vision returns name, type, estimated wattage, and brand confidence — in under 3 seconds.</td></tr>

<tr><td><b>F7</b></td><td><b>Smart Schedules</b></td>
<td>One tap turns a recommendation into a scheduled reminder. A minute-by-minute cron fires due schedules, push them as <b>live SSE toasts</b> in-app and <b>Slack webhooks</b> to your phone.</td></tr>

</table>

---

## AI Use Cases

Every AI call flows through the backend — the frontend **never** touches Claude directly. Six discrete use cases, one prompt file each, zero inline strings.

| UC | Purpose | Mode | Input | Output |
|----|---------|------|-------|--------|
| **UC1** | Recommendations | JSON | Home context | Per-appliance tips with VND + kWh savings |
| **UC2** | Chat *(Khoai Tây)* | Streaming SSE | Message + home context | Vietnamese prose, action cards |
| **UC3** | Appliance Estimation | JSON | Vietnamese appliance name | Wattage, type, standby draw |
| **UC4** | Image Recognition | Vision + JSON | Base64 image | Name, type, wattage, brand, confidence |
| **UC5** | Habit Analysis | JSON | Name + free-text habit + hours | Weighted avg, 3 suggestions, carbon note |
| **UC6** | Savings Suggestions | JSON (cached) | homeId | Room-by-room savings roadmap |

**UC5's weighted average formula** — natural-language habit text is parsed by Claude, not regex:

```
(weekday_hours × 5) + (weekend_hours × 2)
─────────────────────────────────────────
                   7
```

---

## Architecture

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │  Mobile Browser  ·  Next.js 14 App Router  ·  :3000                     │
 │  ────────────────────────────────────────────────────────────           │
 │  (app)/ route group · Sidebar + BottomNav · SchedulesProvider · SSE     │
 └──────────────────────────────┬──────────────────────────────────────────┘
                                │  HTTP  ·  SSE  ·  multipart/form-data
                                ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │  Express.js API  ·  :3001  ·  zod at every boundary                     │
 │  ────────────────────────────────────────────────────────────           │
 │                                                                         │
 │   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐      │
 │   │  /home   │    │ /energy  │    │   /ai    │    │  /schedules  │      │
 │   └────┬─────┘    └────┬─────┘    └────┬─────┘    └──────┬───────┘      │
 │        │               │               │                 │              │
 │        ▼               ▼               ▼                 ▼              │
 │   ┌─────────────────────────────────────────────────────────────┐       │
 │   │   services/  —  thin routes, fat services                   │       │
 │   └───┬────────────────────┬────────────────────┬───────────────┘       │
 │       │                    │                    │                       │
 │       ▼                    ▼                    ▼                       │
 │  ┌───────────┐       ┌──────────────┐     ┌───────────────────┐         │
 │  │ Mongo     │       │ @anthropic-  │     │  node-cron (1min) │         │
 │  │ (Mongoose)│       │   ai/sdk     │     │  → SSE fan-out    │         │
 │  │           │       │ Claude 4.6   │     │  → Slack webhook  │         │
 │  └───────────┘       └──────────────┘     └───────────────────┘         │
 │                                                                         │
 └─────────────────────────────────────────────────────────────────────────┘
```

**Non-negotiable boundaries:**

- Frontend **never** calls Claude directly.
- Routes are thin — business logic lives in `services/`.
- Prompts live in `backend/src/prompts/`, one file per use case — never inlined.
- `lib/api.ts` is the **only** place frontend calls the backend.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Route groups, streaming, zero-config TS |
| **UI** | Tailwind + shadcn/ui + Radix | Composable primitives, a11y-first |
| **Animation** | Framer Motion | Smooth stat-card entrances, toast springs |
| **Charts** | Recharts | Declarative, responsive, mobile-friendly |
| **Toasts** | Sonner | Beautiful queue for schedule-fired events |
| **Theme** | next-themes + HSL CSS vars | Dark-default with opacity modifiers (`bg-primary/10`) |
| **API** | Express.js + zod | Thin routes, strict validation |
| **DB** | MongoDB 7 + Mongoose | Flexible schema for evolving home models |
| **AI** | `@anthropic-ai/sdk` + Claude Sonnet 4.6 | Chat, JSON, Vision — one model, six prompts |
| **Voice** | Web Speech API (`vi-VN`) | Browser-native, zero backend cost |
| **Vision** | Claude Vision (base64) | Pipeline-free appliance recognition |
| **Uploads** | multer (max 5MB) | Client resizes to ≤1024px first |
| **Scheduler** | node-cron (`* * * * *`) | In-process, no external queue |
| **Realtime** | Server-Sent Events | Chat streaming + schedule fired toasts |
| **Notify** | Slack webhooks (optional) | Push to phone without push infra |

---

## Quick Start

**Prerequisites:** Node.js 18+, MongoDB (local or Docker), an Anthropic API key.

```bash
# 1. MongoDB — pick one:
docker compose up -d                # easy: uses ./docker-compose.yml
# OR: mongod --dbpath ./data/db

# 2. Backend
cd backend
cp .env.example .env                # fill ANTHROPIC_API_KEY
npm install
npm run seed                        # optional: seed a demo home
npm run dev                         # http://localhost:3001

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev                         # http://localhost:3000
```

Open **http://localhost:3000** and follow the setup wizard. Give Khoai Tây a room, a few appliances, and watch it work.

### Environment Variables

```bash
# backend/.env
PORT=3001
ANTHROPIC_API_KEY=sk-ant-...
MONGODB_URI=mongodb://localhost:27017/e-lumi-nate
NODE_ENV=development
SLACK_WEBHOOK_URL=https://hooks.slack.com/...   # optional: schedule notifications
FRONTEND_URL=http://localhost:3000              # used by /schedules/:id/complete redirect

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Project Structure

```
e-lumi-nate/
├── backend/
│   └── src/
│       ├── routes/         # Thin Express handlers (home, energy, ai, simulator, schedules)
│       ├── services/       # Business logic (home, energy, ai, simulator, evn-pricing,
│       │                   #                 schedule, notification)
│       ├── prompts/        # One file per AI use case — never inlined
│       ├── models/         # Mongoose schemas (home, room, appliance, chat-session,
│       │                   #                   schedule, completion)
│       ├── middleware/     # error-handler, zod validate, multer upload
│       ├── constants/      # EVN tiers, CO2 factor, appliance defaults, room sizes
│       ├── seed/           # demo-home.ts — run: npm run seed
│       └── index.ts        # Entry + node-cron scheduler
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx            # Landing
│       │   └── (app)/              # Route group — shared shell + SchedulesProvider
│       │       ├── setup/          # F1 Wizard
│       │       ├── dashboard/      # F2 Dashboard
│       │       ├── chat/           # F3 Khoai Tây
│       │       ├── simulator/      # F4 Heatmap
│       │       ├── suggestions/    # UC6 Savings
│       │       ├── schedules/      # F7 Reminders
│       │       └── tips/
│       ├── components/     # setup · dashboard · chat · simulator · schedule ·
│       │                   # savings · recommendations · tips · layout · ui
│       ├── contexts/       # language-context, schedules-context
│       ├── hooks/          # useChat, useSpeech, useImageCapture, useScheduledEvents...
│       └── lib/            # api, calculations, format, speech, image, translations...
│
├── plans/                  # Hackathon plans 00–05
├── specs/                  # Feature specs by domain (home-setup, energy, chat, simulator)
├── standards/              # Cross-cutting code conventions, architecture, git, tech stack
├── docker-compose.yml      # MongoDB
└── CLAUDE.md               # Agent context
```

---

## Vietnam-Native Intelligence

E-LUMI-NATE is not a generic energy app localized to Vietnamese. It's **designed around Vietnamese energy reality**.

### EVN Pricing Tiers (2024, VND/kWh)

| Tier | Range (kWh) | Price | vs. Tier 1 |
|---:|:---:|---:|---:|
| 1 | 0 – 50 | **1,893** | — |
| 2 | 51 – 100 | 1,956 | +3% |
| 3 | 101 – 200 | 2,271 | +20% |
| 4 | 201 – 300 | 2,860 | +51% |
| 5 | 301 – 400 | 3,197 | +69% |
| 6 | 401+ | **3,302** | **+74%** |

The dashboard draws a live progress bar across these tiers, shading red when you're one bad week from promotion.

### CO2 Accounting

```ts
CO2_EMISSION_FACTOR   = 0.913 kg CO2 per kWh  // Vietnam grid
CO2_PER_TREE_PER_YEAR = 20    kg CO2 per year  // mature tree
```

Every saved kWh is translated into **tree-equivalents** — because "you saved 47 kg of CO2" hits differently when the UI plants a sapling.

---

## API Conventions

All endpoints return the same envelope:

```ts
{ success: true,  data: T }          // success
{ success: false, error: string }    // error
```

- Base URL: `http://localhost:3001/api`
- Every body validated with **zod** at the route boundary
- Streaming endpoints use **SSE** (`Content-Type: text/event-stream`)
- Image uploads use **multipart/form-data**, resized client-side to ≤1024px, max 5MB

### Key Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/home/setup` | Create a home with rooms and appliances |
| `GET` | `/home/:id` | Fetch full home context |
| `GET` | `/energy/:homeId/dashboard` | Compute live dashboard metrics |
| `POST` | `/ai/chat` | **SSE** — stream Khoai Tây responses |
| `POST` | `/ai/recommendations` | UC1 structured recommendations |
| `POST` | `/ai/estimate-appliance` | UC3 wattage/type from name |
| `POST` | `/ai/recognize-appliance` | UC4 Vision — base64 image |
| `POST` | `/ai/analyze-habit` | UC5 weighted habit analysis |
| `POST` | `/ai/savings-suggestions` | UC6 room-by-room (cached per home) |
| `POST` | `/simulator/calculate` | What-if adjustment math |
| `GET` | `/schedules?homeId=` | List schedules for a home |
| `GET` | `/schedules/events?homeId=` | **SSE** — live schedule-fired stream |
| `POST` | `/schedules/activate-all` | Convert recommendations to schedules |

---

## Design System

Dark mode is the default. Glassmorphism is the aesthetic.

| Mode | Background | Primary | Mood |
|---|---|---|---|
| **Dark** (EcoHeart navy) | `hsl(213 52% 5%)` | `hsl(142 68% 54%)` neon green | Futuristic, urgent |
| **Light** (Eco-Luxury) | `hsl(155 25% 96%)` | `hsl(145 56% 24%)` deep forest | Calm, premium |

Utilities (in `globals.css`):

- `.glass` — frosted card (72% white / 58% navy + blur)
- `.glass-strong` — stronger blur for sidebars and headers
- `.stat-card-primary` — gradient green stat card
- `.btn-primary-gradient` — gradient green CTA

Colors are **HSL CSS variables**, never hard-coded — this is what lets `bg-primary/10` and the like work.

---

## Code Standards

- **TypeScript only** — no `.js`. No `any` — use `unknown` and narrow.
- **Guard clauses** over `if/else` chains.
- **No hardcoded strings or magic numbers** — named constants, always.
- **Files:** `kebab-case.ts` · **Components:** `PascalCase.tsx` · **Constants:** `SCREAMING_SNAKE_CASE`
- **One component per file.**
- **Comments only when *why* is non-obvious** — the code tells you *what*.

Full conventions: [`standards/code-conventions.md`](standards/code-conventions.md)

---

## Gotchas

- **`heic2any`** must be dynamically imported inside async functions — a static top-level import breaks Next.js SSR with `window is not defined`.
- **ESLint is skipped during builds** (`ignoreDuringBuilds: true`) — pre-existing lint debt. Fix before re-enabling.
- **Client-only `useState` initializers** must guard with `typeof window === "undefined"` or run inside `useEffect`.
- **SSE route order** in `schedules.ts` — `/events`, `/savings`, `/activate-all`, `/fire-all` must come **before** `/:scheduleId` or Express matches them as IDs.
- **Schedule cron** runs every minute. `scheduledTime` is stored as `HH:mm` and compared to local time.
- **Slack webhook is optional** — missing `SLACK_WEBHOOK_URL` skips the POST; in-app SSE still delivers.

---

## Roadmap

**Shipped (hackathon MVP):**

- [x] Home setup with type / voice / camera input
- [x] Live dashboard with EVN tiers, anomalies, CO2 trees
- [x] Streaming AI chat with action cards
- [x] Simulator with live VND + CO2 math
- [x] Vision appliance recognition
- [x] Schedules + SSE toasts + Slack webhooks

**Next:**

- [ ] Multi-user authentication
- [ ] Real-time weather integration (OpenWeatherMap)
- [ ] Push notifications (FCM / Web Push)
- [ ] PWA offline mode
- [ ] Social savings leaderboard
- [ ] Integration with smart plugs (Shelly / Tasmota)

---

## Credits

Built in **16 hours** during an internal hackathon by a team of one human and four Claude agents working in parallel:

| Agent | Branch | Owns |
|---|---|---|
| Researcher | `feat/research` | Specs, API contracts, prompt design |
| Frontend Engineer | `feat/frontend` | Pages, components, theme, voice UX |
| Backend Engineer | `feat/backend` | Routes, services, Mongoose models |
| AI Integration | `feat/ai` | `ai-service.ts`, prompts, streaming |

**Powered by** [Claude](https://www.anthropic.com/) · **Inspired by** every Vietnamese household staring at an EVN bill in disbelief.

---

## License

MIT — see [LICENSE](LICENSE).

<div align="center">

---

**Illuminate the waste. Eliminate the bill.**

*Made with care · Thiết kế cho người Việt · Powered by Khoai Tây*

</div>
