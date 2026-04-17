# Energy Domain

**Features:** F2 (Energy Dashboard)

## Scope

Energy consumption analysis, EVN tiered pricing calculation, CO2 tracking, anomaly detection, and month-over-month comparison. Transforms raw appliance data into actionable insights.

## Specs

- [dashboard.md](dashboard.md) — Energy dashboard: top consumers, EVN tier, CO2, anomalies

## Dependencies

- `specs/home-setup/` — needs configured home with appliances
- `standards/code-conventions.md` — response envelope, naming
- `standards/architecture.md` — port, service boundaries

## Downstream Dependents

- `specs/chat/` — AI recommendations reference energy calculations
- `specs/simulator/` — simulator uses same EVN pricing engine

## API Endpoints (this domain)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/energy/:homeId/dashboard` | Full energy dashboard data |

## File Ownership

```
backend/src/routes/energy.ts
backend/src/services/energy-service.ts
backend/src/services/evn-pricing-service.ts
backend/src/constants/evn-tiers.ts
backend/src/constants/co2.ts
backend/src/types/energy.ts
frontend/src/app/dashboard/page.tsx
frontend/src/components/dashboard/*
frontend/src/hooks/useDashboard.ts
frontend/src/lib/constants.ts (EVN tiers, CO2 factor)
frontend/src/lib/format.ts (VND/kWh/% formatting)
```
