# Retrospective — E-LUMI-NATE (2026 AI Hackathon)

> For Rubric Criterion 5 ("Lessons Learned"). Honest reflection, not
> perfection theater. Written to share failures as openly as successes.

## Team

- 1 human developer, driving
- 4 Claude agents working in parallel on named branches:
  - `feat/research` — specs & API contracts
  - `feat/frontend` — Next.js pages & components
  - `feat/backend` — Express routes & services
  - `feat/ai` — prompts, streaming, Vision

Each agent owned a set of files that only it wrote to. The human reviewed every merge.

## Timeline

- **Hour 0–2** — Research agent wrote `plans/00–05.md`, feature specs, prompt designs. Backend + frontend agents waited.
- **Hour 2–8** — Parallel build. Backend agent built routes/services/models. Frontend agent built the setup wizard + dashboard. AI agent refined prompts and wired Claude streams.
- **Hour 8–12** — Integration. Landing + chat + simulator glued together. First end-to-end demo: setup → dashboard → chat worked.
- **Hour 12–14** — Schedules (F7) + SSE + Slack added. Lots of race conditions on SSE route ordering.
- **Hour 14–16** — Polish: glassmorphism, animations, vi/en toggle, test coverage, verification matrix.
- **Hour 16+** (extended) — OSD rubric alignment pass: REQ/AC IDs, CI pipeline, security review, this retrospective.

## What worked

1. **One-file-per-prompt rule.** Prompts in `backend/src/prompts/` never got inlined. This made iteration cheap (edit one file, re-test) and diff-able — we could compare v1 → v2 for every prompt. See `specs/ai-provenance.md`.
2. **Thin routes, fat services.** Every time we had to fix a bug, the fix was in `services/`, never in `routes/`. Zod at the boundary caught every malformed request in integration testing.
3. **`lib/api.ts` as the only fetch point.** No scattered `fetch()` calls. When we added language negotiation for savings suggestions, we changed one file.
4. **Agent roles with hard boundaries.** The AI Integration agent owned `ai-service.ts` and `prompts/`. Nobody else touched them. Zero merge conflicts on these files.
5. **Verification matrix as a forcing function.** Writing `REQ → AC → Evidence` exposed four gaps on the first pass — gaps we wouldn't have seen otherwise.
6. **MongoDB Memory Server for tests.** Hermetic, fast (<10s), no fixtures to clean up. Worth every kilobyte of its install size.

## What didn't work

1. **"Vibe-spec" temptation.** The first draft of `specs/*/` were good narratives but lacked testable acceptance criteria. We had to do a second pass adding REQ/AC IDs + RFC 2119 keywords. Lesson: define acceptance before writing code, not after.
2. **ESLint skipped during builds.** We shipped with `ignoreDuringBuilds: true` in `next.config.mjs` because early lint debt was blocking us. It accumulated more debt. When we finally fixed it, five real issues were lurking (unused imports, unnecessary React Hook deps). Lesson: never turn off the mechanical gates to "ship faster" — you'll pay interest on the debt.
3. **`useSearchParams()` prerender error.** `/tips` uses `useSearchParams` without a `<Suspense>` boundary. The issue was hidden because `npm run build` wasn't part of CI — only lint/typecheck/test were. Claude suggested `export const dynamic = "force-dynamic"` as a fix; it does not actually fix the issue. Still open as a follow-up.
4. **Spec/code divergence on top-consumers count.** Spec said "top 5"; code returned top 10; UI sliced to 5. Nobody noticed until we wrote AC-DASH-003. Lesson: specs need a verification matrix from day one — divergence is invisible without it.
5. **Evn-pricing unit test had a TypeScript error for days.** `calculateSizeFactor('lighting', 'lighting')` passed `'lighting'` where `RoomSize` was expected. The test never compiled, so the evn-pricing suite silently didn't run. This slipped because the parent `npm test` reported 10 passed, 1 failed — and we glossed over the failure as "flaky". Lesson: never ignore a failing test suite even if you think it's unrelated.
6. **AI suggesting scope creep.** Claude proposed switching from Mongoose to Prisma mid-hackathon. Rejected — but it was a genuine time sink to evaluate. Lesson: the cost of *evaluating* a suggestion is real; default to "not now" unless the payoff is demo-visible.
7. **Voice input component is orphaned.** `VoiceInputButton.tsx` exists and has a unit test — but `ApplianceForm.tsx` doesn't import it. Feature F5 works via the browser-native mic button inside `<input>` on iOS, but the explicit component we built isn't wired. Integration oversight.

## What we'd change

1. **Verification matrix on day one.** Before writing a single line of code. Every feature PR has a "which REQ/AC does this verify?" line.
2. **CI build job from the start.** `npm run build` as a mandatory green check. Prerender issues surface within minutes, not days.
3. **Prompt versioning baked into the file.** Every prompt file gets a `// v3 — 2026-04-18 — added action-block rules (reason: v2 hallucinated IoT devices)` header, so the commit graph doesn't have to be archaeology.
4. **Reject AI's scope-expanding suggestions faster.** Time-box suggestion evaluation to 5 minutes. If it's not demo-visible in 5, defer to post-hackathon.
5. **Export internal helpers for testability.** `calculateResizedDimensions` was internal for a day too long. If a pure function exists, it gets exported — tests are part of its API surface.
6. **"Wire it up" checklist per feature.** For F5 Voice: built the hook ✅, built the component ✅, *used the component in the form* ❌. A checklist row would have caught this.

## What surprised us

1. **Claude is better at specs than at first-draft code.** We got more leverage by giving Claude a half-written spec to formalize than by giving it a blank file and saying "build the thing."
2. **Prompt caching matters more than we expected.** Adding `cache_control: { type: 'ephemeral' }` to system prompts cut chat TTFB from ~1.8s to ~500ms on the second turn. Nobody mentioned this in the rubric, but the demo feels 3× faster.
3. **SSE is still a pain.** Every round trip — route order, CORS headers, client reconnection, Slack optionality — had an edge case. `notification-service.ts` ended up bigger than expected.
4. **Vietnamese prompts need Vietnamese test data.** When we tested with English appliance names, UC3 looked fine. With Vietnamese slang ("máy lạnh", "quạt trần"), it failed 40% of the time. v2 prompt added a slang glossary and it recovered.
5. **The rubric's 30% weight on AI-native lifecycle is a good forcing function.** Without it, we would have shipped with no verification matrix, no security review, no provenance doc. That's the point.

## Shout-outs

- The `tram.ho` commits on `feat/ai` produced the chat action-block v3 prompt that made the chat feel intelligent rather than robotic.
- `justincraftlabs/scheduler-function` branch delivered the node-cron + Slack + SSE stack in one shot.
- Claude's 1M-context Opus 4.7 handled the entire codebase in one conversation to write this retrospective honestly.

## Net-net

We built the MVP. It works. The OSD rubric made us do homework we'd normally skip (formal specs, verification matrix, security review, provenance). That homework caught 5 real issues we wouldn't otherwise have seen.

Would we do it all again? Yes — but with the matrix on day one and the CI build job from hour zero.
