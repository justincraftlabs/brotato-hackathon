# Security Review Checklist

> Pre-deploy security sweep for E-LUMI-NATE. AI-assisted where noted; every
> row is reviewed + accepted (or noted as a conscious tradeoff) by a human.
> Source references: OWASP Top 10 (2021), Next.js security docs, Express
> best practices, Anthropic API safety guide.

## Scope

- Backend: Express API at `:3001`, MongoDB via Mongoose, Claude SDK, multer, node-cron
- Frontend: Next.js 14 App Router, Web Speech + camera access
- Out of scope: production deploy infra (no cloud provider chosen yet), auth (MVP has none by design)

## OWASP Top 10 sweep

| # | Category | Status | Evidence / mitigation |
|---|---|---|---|
| A01 | Broken Access Control | ⚠ Accepted tradeoff | MVP has no auth — every API is public. `homeId` UUID is the only access token; callers who know the UUID can read/write. Document this on the landing page; rotate homeId for real deploys. |
| A02 | Cryptographic Failures | ✅ | No PII stored; no passwords; TLS assumed at the reverse-proxy layer. `ANTHROPIC_API_KEY` lives in `.env`, never logged, not committed (`.gitignore`). |
| A03 | Injection | ✅ | Every route validates with `zod` at the boundary (see [middleware/validate.ts](../backend/src/middleware/validate.ts)). Mongoose parameterizes queries — no string concatenation. |
| A04 | Insecure Design | ✅ | Thin routes / fat services pattern; prompts isolated in `backend/src/prompts/`; frontend never calls Claude directly. |
| A05 | Security Misconfiguration | 🟡 | `cors()` defaults are permissive. Tighten `origin` before production. `helmet` not installed — add before deploy. |
| A06 | Vulnerable Components | ✅ | CI `security-audit` job runs `npm audit --audit-level=high` on both workspaces. Dev deps excluded (`--omit=dev`). Review weekly. |
| A07 | Identification & Auth Failures | ⚠ Accepted tradeoff | No auth by design for MVP — same as A01. |
| A08 | Software & Data Integrity | ✅ | `package-lock.json` committed; CI uses `npm ci` (fails on drift). No postinstall scripts in dependencies reviewed. |
| A09 | Logging & Monitoring | 🟡 | `console.error` only. Structured logging (pino / winston) deferred. Acceptable for hackathon; required before prod. |
| A10 | SSRF | ✅ | `recognizeAppliance` accepts base64 image blobs — not URLs. No outbound fetch accepts user-supplied targets. |

## Additional surface-specific checks

| Surface | Check | Status | Notes |
|---|---|---|---|
| Image upload ([middleware/upload.ts](../backend/src/middleware/upload.ts)) | Max 5MB, MIME allowlist, extension check | ✅ | Multer `limits.fileSize = 5 * 1024 * 1024`; `fileFilter` rejects non-JPEG/PNG/WebP. |
| Prompt injection (UC2 chat) | Home context injected into system prompt, not user turn | ✅ | `buildHomeContext()` prepends the home data into the system role so it can't be overridden by user message. |
| Prompt injection (UC3/UC4) | Untrusted text passed to Claude | 🟡 | We don't strip control tokens from Vietnamese appliance names. Claude handles this, but worth noting. |
| SSE endpoints | Leak of other homes' events | ✅ | `registerSseClient(homeId, res)` scopes each stream. See `notification-service.test.ts::"removeSseClient prunes the client from the registry"`. |
| Slack webhook | URL validation | 🟡 | Anyone who sets `SLACK_WEBHOOK_URL` can re-point it. Document as a trust boundary — only operators set env vars. |
| CORS | Origin check | 🟡 | Permissive default. Before prod: `cors({ origin: process.env.FRONTEND_URL })`. |
| MongoDB | Connection string | ✅ | `MONGODB_URI` from env; never logged; tests use `mongodb-memory-server` so no external mongo is contacted. |
| `.env` | Never committed | ✅ | `backend/.gitignore` excludes `.env`; `backend/.env.example` tracked instead. |
| Claude API key | Rotation / least-privilege | ⚠ Operator duty | Key is a full account key. Use a workspace-scoped key and rotate after the hackathon. |
| Client storage | `homeId` in `localStorage` | ⚠ | Accepted tradeoff: acts as the MVP's "session"; XSS would leak it. No auth tokens stored, so blast radius is "read that one home's data". |
| Camera / mic permissions | Requested only on user gesture | ✅ | Voice/image UI triggers permission prompts inside `onClick` handlers, not on page load. |

## Automated gates (CI)

- `security-audit` (matrix: backend + frontend) — `npm audit --audit-level=high --omit=dev`. Soft-fail during hackathon (`continue-on-error: true`); switch to hard-fail post-deploy.
- `secret-scan` — `gitleaks` on every PR with full history
- `codeql` — GitHub native static analysis for JS/TS vulns

## AI-assisted review notes

- This checklist was drafted with Claude reviewing each route/service file against OWASP categories; every row was then verified by a human against the actual code before acceptance.
- When Claude flagged a concern we disagreed with (e.g., "add rate limiting" for an MVP with no auth), the human decision and rationale is captured in the Status column.

## Follow-ups before a real deploy

1. Add `helmet` and tighten CORS `origin`.
2. Replace permissive MVP UUID-as-token with real authentication (OAuth / magic link).
3. Add structured logging + request IDs.
4. Rotate `ANTHROPIC_API_KEY` to a workspace-scoped key.
5. Flip `security-audit` `continue-on-error` to hard-fail.
6. Add rate limiting (`express-rate-limit`) on `/api/ai/*` to cap Claude spend.
