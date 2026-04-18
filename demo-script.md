# E-LUMI-NATE — Demo Script (English, 5 minutes)

> For Rubric Criterion 4 ("Storytelling & Presentation"). Built as a
> narrative arc: **Problem → Insight → Solution → Impact**. Every timestamp
> is a moment where the screen changes or a click happens — rehearse to
> land each beat.

## Target runtime: 5:00 · Slide deck: 8 slides · Screens: 4 (dashboard, chat, simulator, schedules)

---

## 0:00 — 0:30 · Hook & Problem (Slide 1–2)

> "Every Vietnamese household pays more for electricity than it needs to.
> Not because they're wasteful — because they can't **see** the waste.
>
> EVN's 6-tier pricing punishes overconsumption: cross 400 kWh and you pay
> **74% more per kWh** than tier one. Standby appliances — the TV,
> the router, the rice cooker — silently drain 5 to 15 percent of every
> bill, 24 hours a day.
>
> Existing apps tell you the number. Nobody tells you what to *do*."

**Visual:** static slide with EVN tier chart + "+74%" highlighted.

---

## 0:30 — 1:00 · Insight & Solution (Slide 3)

> "We built **E-LUMI-NATE** — a mobile-first web app that turns raw home
> data into personality-driven, Vietnamese-first advice.
>
> Meet our AI persona — **Trợ Lý Khoai Tây**, the Brotato Assistant.
> She's witty, eco-minded, and speaks like a Vietnamese friend, not a
> customer service bot."

**Visual:** Slide 3 — Khoai Tây illustration + tagline *"Illuminate the waste. Eliminate the bill."*

---

## 1:00 — 1:45 · Live demo — Setup Wizard (Screen 1)

> "Setup is three ways: type, **speak**, or **snap a photo**."

**Actions (rehearsed):**

1. Land on `/setup`, add one room ("Phòng ngủ", size Medium) — 5s.
2. Click **camera** icon, upload a pre-staged photo of an air conditioner.
3. Wait for Claude Vision response (~2 s). Card appears: "Điều hòa 12000 BTU · 1,100W · Daikin · medium confidence".
4. Click **Sử dụng** — fields auto-fill.

> "Claude Vision identifies the appliance. Claude Sonnet estimates the wattage from a Vietnamese name. Zero typing."

---

## 1:45 — 2:45 · Live demo — Dashboard & Chat (Screens 2–3)

**Actions:**

1. Navigate to `/dashboard` (pre-seeded demo home) — show the top-consumers bar chart, EVN tier progress bar (red-zone), **CO2 tree visual**.

> "Top consumers, EVN tier, vampire appliances, CO2 in *tree-equivalents* — because 'you saved 47 kg of CO2' hits differently when the UI plants a sapling."

2. Tap **"Xem gợi ý tiết kiệm"** → land on `/chat`.
3. Tap a pre-loaded recommendation card: *"Tủ lạnh đang ngốn điện hơn 34% so với tháng trước"*.
4. Watch the chat **stream** in real time. Khoai Tây explains in Vietnamese, roasts, and offers a specific number.

> "This is Server-Sent Events. The stream is grounded in the home's live data — Khoai Tây only references appliances that actually exist. Try asking it about a dishwasher you don't own and it'll redirect."

5. In the chat response, an **action card** appears: *"Tắt TV khi không xem · Save 85,000đ/month"*. Tap **Activate**.

> "One tap converts a recommendation into a scheduled reminder."

---

## 2:45 — 3:15 · Live demo — Simulator (Screen 4)

**Actions:**

1. Navigate to `/simulator`. Pull the AC slider from 8h/day down to 4h/day.
2. Impact summary at top updates **live**: `−50.5 kWh · −125,000đ · −46.0 kg CO2 · 2.3 trees`.

> "Debounced 300ms API call. Real math, real tiered pricing. What-if, without the spreadsheet."

---

## 3:15 — 3:45 · Live demo — Schedules + Slack (Screen 5)

**Actions:**

1. Back to `/schedules`. Show the list of pending reminders.
2. Trigger the test endpoint (pre-configured via a keyboard shortcut) to fire a schedule right now.
3. **SSE toast pops up in-app** + simultaneously **Slack notification** on the phone shown on camera.

> "Node-cron fires every minute. SSE pushes to the open browser. Slack pushes to your phone — no push notification infrastructure, no app store, zero friction."

---

## 3:45 — 4:15 · AI-Native Development (Slide 4–5)

> "The rubric weights AI-native development highest — 30 percent. Here's what we did.
>
> - We wrote **specs first** with REQ/AC IDs and RFC 2119 keywords —
>   ten specs, forty-nine requirements.
> - Every requirement traces to evidence: unit test, end-to-end test,
>   or manual demo. See `specs/verification-matrix.md`.
> - Every prompt was **iterated** — the chat-assistant went through three
>   versions before the action-block behavior stabilized.
> - Pre-deploy verification is run **locally** — `npm test` for both
>   workspaces, `npx playwright test`, `npm audit`, and an OWASP Top 10
>   sweep. See `specs/security-review.md`.
> - And we publish our **AI provenance** — which artefacts were AI-drafted,
>   which were human-edited, which AI suggestions we *rejected*, and why."

**Visual:** a real screenshot of `specs/verification-matrix.md` + `specs/ai-provenance.md` highlighted.

---

## 4:15 — 4:40 · Lessons learned (Slide 6)

> "We won't pretend it was smooth.
>
> 1. Our first drafts of the specs were narratives without acceptance
>    criteria. We had to redo them.
> 2. We shipped with ESLint disabled during builds. It hid five real
>    issues.
> 3. Our top-consumers spec said five; the code returned ten. Nobody
>    noticed until the verification matrix existed.
>
> The rubric's discipline caught these. The full retrospective is in
> `RETROSPECTIVE.md`."

---

## 4:40 — 5:00 · Close (Slide 7–8)

> "E-LUMI-NATE turns Vietnamese households from electricity-bill victims
> into informed customers. Sixteen hours, one human, four Claude agents,
> ten specs, sixty-two tests, one security review, one retrospective.
>
> Illuminate the waste. Eliminate the bill. **Cảm ơn** — questions?"

**Visual:** Slide 8 — team credits + QR to the GitHub repo.

---

## Q&A preparation

Top 5 questions we expect:

1. *"Why no authentication?"* — Conscious MVP tradeoff documented in `specs/security-review.md`. `homeId` UUID is the session. Real deploy plan has OAuth.
2. *"Why not a native mobile app?"* — Zero install friction, works on any phone, Web Speech API is built in. PWA is in the roadmap.
3. *"How do you handle prompt injection?"* — Home context is injected at the **system** role, not the user turn. See `specs/security-review.md`.
4. *"Won't Claude hallucinate prices?"* — Prompts include the EVN tier table explicitly and require specific VND amounts. Incorrect numbers are caught during validation (UC1 retry prompt).
5. *"What's the unit economics?"* — Sonnet calls with prompt caching are ~$0.002 per chat turn; ~$0.005 per recommendation; ~$0.008 per vision call. At 100 active households per day, ~$3/month. See `plans/04-ai-integration-plan.md`.

---

## Rehearsal checklist (the day before)

- [ ] Demo home seeded with realistic appliances (`npm run seed` in backend)
- [ ] Pre-staged photo of an air conditioner in `~/demo-assets/`
- [ ] Chrome profile with camera + mic permissions pre-granted for `localhost:3000`
- [ ] Slack channel `#demo-hackathon` open on phone, webhook configured
- [ ] Test the schedule-fire keyboard shortcut: create a schedule at `HH:mm+1`, wait one minute
- [ ] Dry-run the full 5 minutes twice with a timer visible
- [ ] Presenter hydrated, Q&A notes printed, backup slides loaded

## If the live demo fails

- Pre-record a 90-second screencast of the happy path; keep it in slide 3 as a backup video.
- Narration is scripted — don't ad-lib if the demo breaks; switch to the screencast and keep timing.
