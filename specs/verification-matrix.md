# Verification Matrix

> Traces every `REQ-*` / `AC-*` defined in `specs/` to its verification
> evidence. Update the **Status** column as evidence lands. New requirements
> added to a spec file **MUST** also appear here.

## Legend

- ✅ automated — green CI job covers it
- 🟡 partial — automated check exists but doesn't fully cover the AC
- ⏳ manual — verified via manual QA / demo script; no automated gate yet
- ❌ gap — no evidence; needs to be addressed

Verification methods:

- **Unit** — backend `jest` (`backend/tests/unit/*.test.ts`) or frontend `jest` (`frontend/src/**/*.test.ts(x)`)
- **E2E-BE** — backend HTTP e2e (`backend/tests/e2e/*.test.ts`, supertest + mongodb-memory-server)
- **E2E-FE** — frontend Playwright (`frontend/e2e/*.spec.ts`)
- **Manual** — demo script / manual QA
- **Static** — TypeScript / ESLint / schema

---

## F1 — Home Setup (`specs/home-setup/wizard.md`)

| ID | Method | Evidence | Status |
|----|--------|----------|--------|
| REQ-SETUP-001 | E2E-BE | `backend/tests/e2e/home.e2e.test.ts` → "rejects an empty rooms array with 400" | ✅ |
| REQ-SETUP-002 | E2E-BE | `backend/tests/e2e/home.e2e.test.ts` → "rejects invalid room types with 400" | ✅ |
| REQ-SETUP-003 | Static | zod `setupSchema.rooms[].size` enum in `backend/src/routes/home.ts` | 🟡 |
| REQ-SETUP-004 | E2E-BE | `backend/tests/e2e/home.e2e.test.ts` → "returns 400 for non-positive wattage" | ✅ |
| REQ-SETUP-005 | Static | zod `appliancesSchema.appliances[].dailyUsageHours` | 🟡 |
| REQ-SETUP-006 | Unit | `backend/tests/unit/home-service.test.ts` → "computes monthlyKwh...", "recomputes monthlyKwh after a wattage change" | ✅ |
| REQ-SETUP-007 | Unit | `backend/tests/unit/validate-middleware.test.ts`, `backend/tests/unit/error-handler.test.ts` | ✅ |
| REQ-SETUP-008 | E2E-BE | `backend/tests/e2e/home.e2e.test.ts` → "returns 404 when the home does not exist" | ✅ |
| REQ-SETUP-009 | Manual | Demo script step 1.3 "Review & Confirm" | ⏳ |
| REQ-SETUP-010 | Manual | Visual QA on mobile (Pixel 5 Playwright profile) | ⏳ |
| AC-SETUP-001 | E2E-BE | `home.e2e.test.ts::"rejects an empty rooms array with 400"` | ✅ |
| AC-SETUP-002 | E2E-BE | `home.e2e.test.ts::"rejects invalid room types with 400"` | ✅ |
| AC-SETUP-003 | E2E-BE | `home.e2e.test.ts::"returns 400 for non-positive wattage"` | ✅ |
| AC-SETUP-004 | E2E-BE | `home.e2e.test.ts::"returns 404 when the home does not exist"` | ✅ |
| AC-SETUP-005 | E2E-BE | `home.e2e.test.ts::"returns the full home with appliances"` | ✅ |
| AC-SETUP-006 | Unit | `home-service.test.ts::"recomputes monthlyKwh after a wattage change"` | ✅ |

## F5 — Voice Input (`specs/home-setup/voice-input.md`)

| ID | Method | Evidence | Status |
|----|--------|----------|--------|
| REQ-VOICE-001..008 | Manual | Demo checklist: speak "điều hòa" on Chrome mobile → name field populated; block audio permission → toast | ⏳ |
| AC-VOICE-001 | Manual | Open `/setup` in Firefox (no SpeechRecognition) — mic button absent | ⏳ |
| AC-VOICE-002 | Manual | Chrome mobile, record Vietnamese phrase | ⏳ |
| AC-VOICE-003 | Manual | Deny mic permission → observe toast | ⏳ |
| AC-VOICE-004 | Unit (gap) | No automated coverage yet for auto-estimate trigger | ❌ |
| AC-VOICE-005 | Manual | Demo checklist | ⏳ |

## F6 — Image Recognition (`specs/home-setup/image-recognition.md`)

| ID | Method | Evidence | Status |
|----|--------|----------|--------|
| REQ-IMG-001 | Unit (gap) | No test for `resizeImageToBase64` yet | ❌ |
| REQ-IMG-002 | Static | `backend/src/middleware/upload.ts` multer `limits.fileSize = 5MB` | 🟡 |
| REQ-IMG-003 | Static | `upload.ts` `fileFilter` accepts `image/jpeg|png|webp` | 🟡 |
| REQ-IMG-004 | Static | `frontend/src/lib/image.ts` — dynamic import check via code review | 🟡 |
| REQ-IMG-005 | Manual | `image-recognizer.ts` prompt enforces `confidence` field; validated during demo | ⏳ |
| REQ-IMG-006 | Manual | Deliberately corrupt JSON via prompt to observe retry | ⏳ |
| REQ-IMG-007..008 | Manual | Demo script | ⏳ |
| AC-IMG-001..005 | Manual | Demo script (camera upload of fridge photo) | ⏳ |

## F2 — Energy Dashboard (`specs/energy/dashboard.md`)

| ID | Method | Evidence | Status |
|----|--------|----------|--------|
| REQ-DASH-001 | Unit | `backend/tests/unit/home-service.test.ts` + visual check of top-5 sorting | 🟡 |
| REQ-DASH-002 | Unit | `backend/tests/unit/evn-pricing-service.test.ts` — all `calculateMonthlyCost` / `getCurrentTier` cases | ✅ |
| REQ-DASH-003 | Unit (gap) | CO2 constant usage covered implicitly by e2e dashboard test | 🟡 |
| REQ-DASH-004 | E2E-BE | `backend/tests/e2e/energy.e2e.test.ts` → "returns the dashboard envelope with totals and breakdowns" | ✅ |
| REQ-DASH-005 | Manual | Demo with intentionally high-usage appliance | ⏳ |
| REQ-DASH-006 | E2E-BE | `energy.e2e.test.ts` → "returns 404 when the home does not exist" | ✅ |
| REQ-DASH-007 | Unit | `evn-pricing-service.test.ts` → "returns a monotonically increasing cost for increasing kWh" | ✅ |
| REQ-DASH-008 | E2E-BE | `energy.e2e.test.ts` asserts `evnTier` object shape | ✅ |
| REQ-DASH-009 | E2E-FE | `frontend/e2e/dashboard.spec.ts` → "renders without crashing when a homeId exists" | 🟡 |
| AC-DASH-001 | E2E-BE | `energy.e2e.test.ts::"returns the dashboard envelope..."` | ✅ |
| AC-DASH-002 | E2E-BE | `energy.e2e.test.ts::"returns 404 when the home does not exist"` | ✅ |
| AC-DASH-003 | Unit (gap) | No direct test on top-5 truncation; needs test | ❌ |
| AC-DASH-004 | Unit | `evn-pricing-service.test.ts::"places 250 kWh in tier 4"` (analogous) | ✅ |
| AC-DASH-005 | Unit (gap) | Not explicitly asserted; covered via visual demo | 🟡 |
| AC-DASH-006 | Unit | `evn-pricing-service.test.ts::"returns a monotonically increasing cost..."` | ✅ |
| AC-DASH-007 | Unit | `evn-pricing-service.test.ts::"uses only tier 1 rate when consumption <= 50 kWh"` | ✅ |

## F3 — AI Chat (`specs/chat/chat-assistant.md`)

| ID | Method | Evidence | Status |
|----|--------|----------|--------|
| REQ-CHAT-001..004 | Manual | Prompt review + demo (persona behavior is prompt-driven) | ⏳ |
| REQ-CHAT-005 | Unit (gap) | No automated history-truncation test | ❌ |
| REQ-CHAT-006 | Unit | `backend/tests/unit/notification-service.test.ts` (SSE writer shared with chat) | 🟡 |
| REQ-CHAT-007..008 | Manual | curl `POST /api/ai/chat`, inspect tail of stream | ⏳ |
| REQ-CHAT-009 | Manual | Mongo Compass, confirm `chat-sessions` collection | ⏳ |
| REQ-CHAT-010 | Static | Grep frontend for direct `api.anthropic.com` — absent | 🟡 |
| AC-CHAT-001..006 | Manual | Demo script steps 3.1–3.4 | ⏳ |

## UC1 — Recommendations (`specs/chat/recommendations.md`)

| ID | Method | Evidence | Status |
|----|--------|----------|--------|
| REQ-REC-001..005 | Static | `Recommendation` type + zod validation on AI output | 🟡 |
| REQ-REC-006 | Manual | Spot-check demo run | ⏳ |
| REQ-REC-007..008 | Manual | Force invalid JSON via prompt override | ⏳ |
| REQ-REC-009..010 | Manual | Output review | ⏳ |
| AC-REC-001..005 | Manual | Demo + output inspection | ⏳ |

## F4 — Simulator (`specs/simulator/heatmap.md`)

| ID | Method | Evidence | Status |
|----|--------|----------|--------|
| REQ-SIM-001 | Static | zod `newDailyHours.min(0).max(24)` | 🟡 |
| REQ-SIM-002 | E2E-BE | `simulator.e2e.test.ts` → "rejects temperature adjustments outside [16, 60]" | ✅ |
| REQ-SIM-003 | Static | zod `newWattage.positive()` | 🟡 |
| REQ-SIM-004 | Manual | Observe devtools network panel during slider use | ⏳ |
| REQ-SIM-005 | Unit | `backend/tests/unit/simulator-service.test.ts` full suite | ✅ |
| REQ-SIM-006 | Unit | `simulator-service.test.ts::"classifies >20% reduction as high impact"` | ✅ |
| REQ-SIM-007 | E2E-BE + Unit | `simulator.e2e.test.ts::"returns 404 when the home does not exist"` + `simulator-service.test.ts::"returns null when the home does not exist"` | ✅ |
| REQ-SIM-008 | E2E-BE | `simulator.e2e.test.ts::"returns baseline results..."` | ✅ |
| REQ-SIM-009 | Unit + E2E-BE | `simulator-service.test.ts::"produces identical original and simulated values..."` | ✅ |
| REQ-SIM-010 | Manual | Demo: move sliders → click Reset | ⏳ |
| AC-SIM-001 | E2E-BE | `simulator.e2e.test.ts::"returns baseline results with zero savings when no adjustments"` | ✅ |
| AC-SIM-002 | Unit + E2E-BE | `simulator-service.test.ts::"reports positive savings when daily hours are reduced"` + `"classifies >20% reduction as high impact"` | ✅ |
| AC-SIM-003 | E2E-BE | `simulator.e2e.test.ts::"returns 404 when the home does not exist"` | ✅ |
| AC-SIM-004 | E2E-BE | `simulator.e2e.test.ts::"rejects temperature adjustments outside [16, 60]"` | ✅ |
| AC-SIM-005 | Manual | Devtools observation | ⏳ |
| AC-SIM-006 | Unit | `simulator-service.test.ts::"temperature adjustment on cooling appliances changes consumption"` | ✅ |

## F7 — Schedules (cross-cutting, no dedicated spec file yet)

> Spec lives in `plans/05-integration-and-demo.md`. When promoted, extract
> into `specs/schedules/` and assign `REQ-SCHED-*` IDs.

| ID | Method | Evidence | Status |
|----|--------|----------|--------|
| (SSE broadcast) | Unit | `notification-service.test.ts::"pushes the SSE event to every registered client for the home"` | ✅ |
| (Slack optional) | Unit | `notification-service.test.ts::"does not post to Slack when SLACK_WEBHOOK_URL is unset"` + positive case | ✅ |
| (SSE client cleanup) | Unit | `notification-service.test.ts::"removeSseClient prunes the client from the registry"` | ✅ |
| Cron firing | Manual | Set schedule to current HH:mm, observe Slack + toast | ⏳ |

## Frontend smoke (cross-cutting)

| Target | Method | Evidence | Status |
|--------|--------|----------|--------|
| Landing renders | E2E-FE | `frontend/e2e/landing.spec.ts::"renders the E-LUMI-NATE hero..."` | ✅ |
| Landing CTA flow | E2E-FE | `landing.spec.ts::"shows the Back to Dashboard CTA when a homeId is in localStorage"` | ✅ |
| Setup entry | E2E-FE | `setup-wizard.spec.ts::"loads /setup and shows the room selector step"` | ✅ |
| Dashboard renders | E2E-FE | `dashboard.spec.ts::"renders without crashing when a homeId exists"` | ✅ |
| Utilities | Unit | `frontend/src/lib/*.test.ts` (calculations, chat-action, format, utils, api) | ✅ |
| UI primitives | Unit | `frontend/src/components/ui/button.test.tsx` | ✅ |
| Hooks | Unit | `frontend/src/hooks/useLocalStorage.test.tsx` | ✅ |

---

## Gap summary (❌ rows — hackathon backlog)

1. **AC-VOICE-004** — add a jest test that mocks `useSpeech` and asserts `POST /api/ai/estimate-appliance` is called exactly once on final transcript.
2. **REQ-IMG-001** — unit-test `resizeImageToBase64` against a known fixture to assert 1024px output.
3. **REQ-CHAT-005** — unit-test the chat service's history truncation when ≥20 messages stored.
4. **AC-DASH-003** — unit-test `topConsumers` truncation to exactly 5 entries for homes with >5 appliances.

Everything else is either covered or consciously verified via manual demo.
