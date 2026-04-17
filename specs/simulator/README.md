# Simulator Domain

**Features:** F4 (Green Heatmap Simulator)

## Scope

Interactive "what-if" simulation: adjust appliance settings (hours, wattage, temperature), see real-time impact on kWh, VND cost, and CO2. Visual heatmap color-codes appliances by efficiency.

## Specs

- [heatmap.md](heatmap.md) — Green heatmap simulator: sliders, impact calculation, color coding

## Dependencies

- `specs/home-setup/` — needs appliance list to simulate adjustments
- `specs/energy/` — uses same EVN pricing engine for cost calculations
- `standards/architecture.md` — service boundaries

## API Endpoints (this domain)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/simulator/calculate` | Calculate simulation with adjustments |

## File Ownership

```
backend/src/routes/simulator.ts
backend/src/services/simulator-service.ts
backend/src/types/simulator.ts
frontend/src/app/simulator/page.tsx
frontend/src/components/simulator/*
frontend/src/hooks/useSimulator.ts
```
