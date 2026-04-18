# E-LUMI-NATE — AI-Powered Home Energy Intelligence

> "Illuminate the waste. Eliminate the bill."

16-hour hackathon. Mobile-first web app. No auth. MVP only.
AI persona: **"Trợ Lý Khoai Tây"** (Brotato Assistant) — witty, eco-friendly energy expert speaking Vietnamese.

## Quick Start

```bash
# MongoDB (must be running first) — pick one:
docker compose up -d          # uses ./docker-compose.yml
# OR: mongod --dbpath ./data/db

# Backend (terminal 1)
cd backend
cp .env.example .env          # fill ANTHROPIC_API_KEY
npm install
npm run seed                  # optional: seed demo home
npm run dev                   # http://localhost:3001

# Frontend (terminal 2)
cd frontend
npm install
npm run dev                   # http://localhost:3000
```

## Architecture

```
Mobile Browser (Next.js 14 App Router, :3000)
        |
        | HTTP / SSE
        |
Express.js API Server (:3001)
        |
        +--- @anthropic-ai/sdk → Claude Sonnet 4.6
        |         (chat, recommendations, estimation, image recognition)
        |
        +--- MongoDB (mongoose) → persistent data
        |
        +--- Web Speech API (browser-native, no backend)
        |
        +--- node-cron (every minute) → fires due schedules via SSE + Slack webhook
```

**Boundaries:**
- Frontend NEVER calls Claude directly — all AI goes through backend
- Backend routes are thin — business logic in `services/`
- AI Integration owns `services/ai-service.ts` and `prompts/` — nobody else touches these

## Directory Structure

```
backend/
  src/
    index.ts                    # Entry point + node-cron schedule checker
    routes/                     # Express route handlers (thin)
      home.ts                   # POST /setup, POST /:id/appliances, GET /:id
      energy.ts                 # GET /:homeId/dashboard
      ai.ts                     # POST /recommendations, /chat (SSE), /estimate-appliance, /recognize-appliance, /savings-suggestions, /analyze-habit
      simulator.ts              # POST /calculate
      schedules.ts              # CRUD + SSE /events + /fire-all + /:id/complete (Slack redirect)
    services/                   # Business logic
      home-service.ts
      energy-service.ts
      ai-service.ts             # Claude API calls (AI agent owns this)
      simulator-service.ts
      evn-pricing-service.ts    # EVN tiered pricing calculator
      schedule-service.ts       # create/activate/fire/complete schedules
      notification-service.ts   # SSE client registry + Slack webhook fan-out
    models/                     # Mongoose schemas
      home.model.ts
      room.model.ts
      appliance.model.ts
      chat-session.model.ts
      schedule.model.ts
      completion.model.ts
    middleware/
      error-handler.ts
      validate.ts               # zod validation factory
      upload.ts                 # multer config for image uploads
    prompts/                    # One file per AI use case (AI agent owns)
      appliance-estimator.ts
      chat-assistant.ts
      habit-analyzer.ts
      image-recognizer.ts
      recommendation.ts
      savings-suggestions.ts
      usage-habit-parser.ts
    seed/
      demo-home.ts              # run: npm run seed
    types/                      # Shared TypeScript interfaces
    constants/                  # EVN tiers, CO2 factor, appliance defaults, room sizes
    db/
      connection.ts             # MongoDB connection

frontend/
  src/
    app/
      page.tsx                  # Landing (shows "Back to dashboard" if homeId in localStorage)
      layout.tsx                # Root layout (ThemeProvider, LanguageProvider)
      (app)/                    # Route group: shared Sidebar + Header + BottomNav + SchedulesProvider
        layout.tsx
        setup/page.tsx          # F1 Home Setup Wizard
        dashboard/page.tsx      # F2 Energy Dashboard
        chat/page.tsx           # F3 AI Chat with Khoai Tay
        simulator/page.tsx      # F4 Green Heatmap Simulator
        suggestions/page.tsx    # UC6 Savings Suggestions
        schedules/page.tsx      # F7 Scheduled reminders (Bell icon in nav)
        tips/page.tsx           # AI Tips tab view
    contexts/
      language-context.tsx      # vi/en toggle
      schedules-context.tsx     # global schedules state + SSE subscription
    components/
      ui/                       # shadcn/ui (auto-generated)
      layout/                   # Header, BottomNav, PageContainer, Sidebar, SideNav, ThemeProvider
      setup/                    # RoomSelector, ApplianceForm, ApplianceCard, EditModeView, SetupReview, StepIndicator, VoiceInputButton, ImageCaptureButton
      dashboard/                # EnergyOverview, TopConsumersChart, EvnTierProgress, Co2TreeVisual, AnomalyAlert, CarbonWaterfallChart, EfficiencyGauge, FixedBottomActions, MonthComparison, MonthlyBillProjection, RoomEnergyHeatmap, SavingsCounter, SavingsForecastChart, VampireAppliances, WasteHotspotChart
      chat/                     # ChatBubble, ChatInput, ChatActionCard, IotActionCard, RecommendationCards
      simulator/                # ApplianceAdjuster, ComparisonBar, ImpactSummary
      schedule/                 # ScheduleToast, ScheduleToastContainer
      savings/                  # DeviceSuggestionCard, RoomAccordionItem
      recommendations/          # ActivateAllButton
      tips/                     # IotSuggestionsPanel
    lib/
      api.ts                    # ALL backend calls go here — never fetch in components
      types.ts                  # Shared interfaces
      constants.ts              # EVN tiers, CO2, nav routes, localStorage keys
      format.ts                 # VND/kWh/% formatting
      speech.ts + speech-constants.ts       # Web Speech API wrapper
      image.ts + image-constants.ts         # Image resize + base64 (heic2any lazy-imported)
      calculations.ts                       # Energy math helpers
      chat-action.ts + chat-action-apply.ts # IoT / schedule action handling from chat
      translations.ts                       # vi/en strings
      cn.ts + utils.ts                      # Tailwind class merging
      setup-constants.ts + simulator-constants.ts
    hooks/                      # use-t, useChat, useImageCapture, useLocalStorage, useSpeech, useScheduledEvents
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, shadcn/ui, lucide-react icons |
| Charts | Recharts |
| Backend | Express.js, TypeScript, zod validation |
| Database | MongoDB + Mongoose |
| AI | `@anthropic-ai/sdk` → `claude-sonnet-4-6` |
| Voice | Web Speech API (browser-native, lang: `vi-VN`) |
| Vision | Claude Vision API (base64 image → appliance recognition) |
| Upload | multer (image upload, max 5MB, JPEG/PNG/WebP) |

## Environment Variables

```bash
# backend/.env
PORT=3001
ANTHROPIC_API_KEY=sk-ant-...
MONGODB_URI=mongodb://localhost:27017/e-lumi-nate
NODE_ENV=development
SLACK_WEBHOOK_URL=https://hooks.slack.com/...   # optional: schedule fire notifications
FRONTEND_URL=http://localhost:3000              # used by /schedules/:id/complete redirect

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## MVP Features

| ID | Feature | Owner |
|----|---------|-------|
| F1 | Home Setup Wizard — rooms + appliances (type/voice/camera) | Frontend + Backend |
| F2 | Energy Dashboard — top consumers, EVN tier progress, anomalies, CO2 | Frontend + Backend |
| F3 | AI Chat — "Trợ Lý Khoai Tây" streaming recommendations in Vietnamese | Frontend + AI |
| F4 | Green Heatmap Simulator — adjust settings, see VND/CO2 impact live | Frontend + Backend |
| F5 | Voice Input — Web Speech API for appliance names + chat (vi-VN) | Frontend |
| F6 | Image Recognition — camera/upload photo → Claude Vision identifies appliance | Frontend + AI |
| F7 | Schedules — activate recommendations as scheduled reminders with SSE toast + optional Slack webhook | Frontend + Backend |

**Out of scope:** auth, real weather API, push notifications, PWA, social sharing.

## API Conventions

All endpoints return the same envelope:

```typescript
{ success: true, data: T }        // success
{ success: false, error: string }  // error
```

- Base URL: `http://localhost:3001/api`
- Validate ALL input with `zod` at route boundary
- Streaming: SSE with headers `Content-Type: text/event-stream`, `Cache-Control: no-cache`
- Image upload: `multipart/form-data` via multer, resize client-side to max 1024px before sending

## Key Constants

```typescript
// EVN Pricing Tiers 2024 (VND/kWh)
// Tier 1: 0-50 kWh = 1,893 | Tier 2: 51-100 = 1,956 | Tier 3: 101-200 = 2,271
// Tier 4: 201-300 = 2,860 | Tier 5: 301-400 = 3,197 | Tier 6: 401+ = 3,302

// CO2
const CO2_EMISSION_FACTOR = 0.913;  // kg CO2 per kWh (Vietnam grid)
const CO2_PER_TREE_PER_YEAR = 20;   // kg CO2 absorbed by 1 mature tree/year
```

## Branding / Theme

Colors are **CSS HSL variables** — never hardcode hex in Tailwind config for theme tokens. Tailwind config uses `primary: { DEFAULT: "hsl(var(--primary))" }` to enable opacity modifiers like `bg-primary/10`.

| Mode | Background | Primary |
|------|-----------|---------|
| Dark (EcoHeart navy) | `hsl(213 52% 5%)` | `hsl(142 68% 54%)` neon green |
| Light (Eco-Luxury) | `hsl(155 25% 96%)` | `hsl(145 56% 24%)` deep forest |

**Glassmorphism utilities** (defined in `globals.css`):
- `.glass` — frosted card (light: white 72% opacity; dark: navy 58% + blur)
- `.glass-strong` — stronger blur for sidebars/headers
- `.stat-card-primary` — gradient green stat card
- `.btn-primary-gradient` — gradient green button

Dark mode is default. Use `next-themes` with `class` strategy.

## Code Style

- TypeScript everywhere — no `.js` files
- No `any` — use `unknown` and narrow, or define proper types
- Guard clauses over `if/else` chains
- No hardcoded strings — use named constants
- No magic numbers — use named index constants
- Files: `kebab-case.ts` | Components: `PascalCase.tsx` | Constants: `SCREAMING_SNAKE_CASE`
- One component per file, keep components small
- Comments only when WHY is non-obvious

## Git

**Branch strategy:**

| Agent | Branch |
|-------|--------|
| Researcher | `feat/research` |
| Frontend Engineer | `feat/frontend` |
| Backend Engineer | `feat/backend` |
| AI Integration | `feat/ai` |

**Commit format:** `type(scope): short description`
Types: `feat`, `fix`, `chore`, `docs`, `refactor`

Never commit `.env` or `node_modules/`.

## AI Use Cases (6 total)

| UC | Purpose | Model | Input | Output |
|----|---------|-------|-------|--------|
| UC1 | Recommendations | Sonnet | Home JSON | Structured JSON: per-appliance tips |
| UC2 | Chat (Khoai Tay) | Sonnet (streaming) | User message + home context | Vietnamese text via SSE |
| UC3 | Appliance estimation | Sonnet | Appliance name (Vietnamese) | JSON: wattage, type, standby |
| UC4 | Image recognition | Sonnet (Vision) | Base64 image | JSON: name, type, wattage, brand, confidence |
| UC5 | Usage Habit Analysis | Sonnet | Appliance name + habit text + current hours | JSON: `calculated_average_hours`, `analysis_summary`, `habit_suggestions[3]`, `carbon_impact_note` |
| UC6 | Savings Suggestions | Sonnet | homeId (cached per home) | JSON: room-by-room suggestions with `savingsKwh`/`savingsVnd` |

System prompts live in `backend/src/prompts/` as exported constants — one file per UC. Never inline prompts in route handlers.

## Detailed Plans

For implementation details beyond what's here, see `plans/`:

| File | Content |
|------|---------|
| [plans/00-overview.md](plans/00-overview.md) | Master timeline, feature list, agent ownership |
| [plans/01-research-specs.md](plans/01-research-specs.md) | Product spec, API contracts, AI prompt designs |
| [plans/02-frontend-plan.md](plans/02-frontend-plan.md) | Pages, components, voice/camera UX, mobile nav |
| [plans/03-backend-plan.md](plans/03-backend-plan.md) | Routes, Mongoose models, services, validation schemas |
| [plans/04-ai-integration-plan.md](plans/04-ai-integration-plan.md) | All 4 system prompts, streaming, Vision API, token budget |
| [plans/05-integration-and-demo.md](plans/05-integration-and-demo.md) | Integration checklist, demo script, risk mitigation |

## Cross-Cutting Standards

- [standards/code-conventions.md](standards/code-conventions.md) — naming, fetch rules, TypeScript conventions
- [standards/architecture.md](standards/architecture.md) — system boundaries, ports, SSE, MongoDB
- [standards/git-policies.md](standards/git-policies.md) — branches, commit format
- [standards/tech-stack.md](standards/tech-stack.md) — confirmed tech decisions, NPM packages

## Feature Specs (by domain)

- [specs/home-setup/](specs/home-setup/) — F1 Home Setup Wizard + F5 Voice + F6 Image Recognition
- [specs/energy/](specs/energy/) — F2 Energy Dashboard, EVN pricing, CO2
- [specs/chat/](specs/chat/) — F3 AI Chat (Trợ Lý Khoai Tây) + Recommendations
- [specs/simulator/](specs/simulator/) — F4 Green Heatmap Simulator
- [specs/testing/](specs/testing/) — Unit + E2E testing strategy (Jest, supertest, RTL, Playwright)
- [specs/verification-matrix.md](specs/verification-matrix.md) — REQ → AC → method → evidence trace for every spec

## Gotchas

- **`heic2any` must be dynamically imported** inside the async function body — a static top-level import causes `window is not defined` during Next.js SSR static generation. Use `const heic2any = (await import("heic2any")).default` in `lib/image.ts`.
- **ESLint skipped during builds** — `eslint: { ignoreDuringBuilds: true }` is set in `next.config.mjs` due to pre-existing lint errors. Fix before removing this flag.
- **Client-only libraries in hooks** — any `useState` initializer that accesses `window`/`document` directly (not inside `useEffect`) will break SSR. Always guard with `typeof window === "undefined"`.
- **UC5 weighted average formula**: `[(weekday_hours × 5) + (weekend_hours × 2)] / 7` — natural language habit text is parsed by Claude, not regex.
- **SSE route order in `schedules.ts`**: `/events`, `/savings`, `/activate-all`, `/fire-all` MUST be registered BEFORE `/:scheduleId` routes, or Express will match them as scheduleIds.
- **Schedule cron fires every minute** via `node-cron` in `backend/src/index.ts`. `scheduledTime` is stored as a string (HH:mm) — compared against current local time in `checkAndFireDue()`.
- **Slack webhook is optional** — if `SLACK_WEBHOOK_URL` is unset, `postToSlack()` returns early; SSE push to connected frontend clients still happens.

## Agent Roles (reference)

- [agents/researcher.md](agents/researcher.md) — Hours 0-2, specs only
- [agents/frontend-engineer.md](agents/frontend-engineer.md) — Hours 2-14, parallel
- [agents/backend-engineer.md](agents/backend-engineer.md) — Hours 2-14, parallel
- [agents/ai-integration.md](agents/ai-integration.md) — Hours 2-14, parallel
