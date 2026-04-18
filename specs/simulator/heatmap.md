# Green Heatmap Simulator (F4)

## User Story

> As a homeowner, I want to simulate "what if" scenarios so I can see the impact before changing habits.

## API Contract

### POST /api/simulator/calculate

```typescript
// Request
{
  homeId: string;
  adjustments: Array<{
    applianceId: string;
    newWattage?: number;
    newDailyHours?: number;
    newTemperature?: number;
  }>
}

// Response
{
  success: true,
  data: {
    original: { monthlyKwh: number, monthlyCost: number, co2Kg: number };
    simulated: { monthlyKwh: number, monthlyCost: number, co2Kg: number };
    delta: { kwhSaved: number, costSaved: number, co2Saved: number, treesEquivalent: number };
    perAppliance: Array<{
      applianceId: string;
      applianceName: string;
      originalKwh: number;
      simulatedKwh: number;
      impact: "high" | "medium" | "low";
    }>;
  }
}
```

## Zod Validation

```typescript
const simulatorSchema = z.object({
  homeId: z.string(),
  adjustments: z.array(z.object({
    applianceId: z.string(),
    newWattage: z.number().positive().optional(),
    newDailyHours: z.number().min(0).max(24).optional(),
    newTemperature: z.number().min(16).max(30).optional(),
  })),
});
```

## Page Layout

1. **Impact Summary** (top, sticky)
   - Three cards: kWh saved, VND saved, CO2 saved
   - Updates in real-time as user adjusts sliders
   - Tree equivalent visual

2. **Appliance Grid** (main content)
   - List of all appliances grouped by room
   - Each appliance shows:
     - Name + icon + current monthly kWh
     - Adjustment sliders: daily hours (0-24h), temperature (for AC: 16-30°C)
     - Color indicator by efficiency level
   - Changes from baseline highlighted

3. **Comparison Bar** (bottom)
   - Before vs After side-by-side
   - Monthly cost: original → simulated
   - CO2: original → simulated
   - "Reset" button to restore original values

## Real-time Calculation

Prefer local calculation for instant feedback:

```typescript
monthlyKwh = (wattage / 1000) * dailyHours * 30
monthlyCost = calculateEvnTieredCost(monthlyKwh)
co2Kg = monthlyKwh * 0.913
```

Debounced API call (300ms) to `POST /api/simulator/calculate` for validated totals.

## Heatmap Color Mapping

| Impact Level | Color | Hex |
|-------------|-------|-----|
| High savings (>20% reduction) | Primary green | `#3B8C2A` |
| Medium savings (10-20%) | Mid green | `#639922` |
| Low savings (<10%) | Light green | `#EAF3DE` |
| No change | Neutral gray | `#888888` |
| Increased usage | Amber | `#EF9F27` |
| High increase | Dark amber | `#BA7517` |

## Backend Service Logic

### `simulator-service.ts`

1. Get current home data from MongoDB
2. Apply adjustments to create simulated appliance list
3. Calculate original totals (kWh, cost, CO2)
4. Calculate simulated totals
5. Compute deltas
6. Determine per-appliance impact level (high/medium/low)

## Requirements

RFC 2119 keywords: **MUST** · **SHOULD** · **MAY**.

| ID | Requirement |
|----|-------------|
| REQ-SIM-001 | `newDailyHours` **MUST** ∈ `[0, 24]`. |
| REQ-SIM-002 | `newTemperature` **MUST** ∈ `[16, 30]` for AC adjustments. |
| REQ-SIM-003 | `newWattage` **MUST** be a positive number when provided. |
| REQ-SIM-004 | API calls **SHOULD** be debounced client-side at 300ms. |
| REQ-SIM-005 | Client **MUST** compute a local preview using `monthlyKwh = (wattage/1000) * dailyHours * 30` for instant feedback. |
| REQ-SIM-006 | Impact classification **MUST** be: `high` (>20% reduction), `medium` (10–20%), `low` (<10%). |
| REQ-SIM-007 | `POST /api/simulator/calculate` **MUST** return `404` when the home does not exist. |
| REQ-SIM-008 | Response **MUST** include `original`, `simulated`, `delta`, `perAppliance`. |
| REQ-SIM-009 | `delta.kwhSaved`, `delta.costSaved`, `delta.co2Saved`, `delta.treesEquivalent` **MUST** all be zero when no adjustments are provided. |
| REQ-SIM-010 | Reset action **MUST** restore original appliance values without reloading the page. |

## Acceptance Criteria

| ID | Criterion | Verifies |
|----|-----------|----------|
| AC-SIM-001 | Given no adjustments, when `POST /api/simulator/calculate`, then `delta.kwhSaved === 0`. | REQ-SIM-009 |
| AC-SIM-002 | Given daily-hours reduced from 8→4 on a 1000W appliance, when calculate, then `delta.kwhSaved > 0` and the per-appliance `impact === "high"`. | REQ-SIM-006 |
| AC-SIM-003 | Given a non-existent `homeId`, when `POST /api/simulator/calculate`, then response is `404`. | REQ-SIM-007 |
| AC-SIM-004 | Given `newTemperature` outside the allowed range, when `POST /api/simulator/calculate`, then response is `400`. | REQ-SIM-002 |
| AC-SIM-005 | Given rapid slider movement, when 10 changes fire within 300ms, then only one API call is made after the debounce settles. | REQ-SIM-004 |
| AC-SIM-006 | Given a temperature change on a cooling appliance, when computed, then simulated consumption differs from baseline. | REQ-SIM-005 |

## Boundaries

**In scope**
- What-if simulation for existing appliances (wattage, daily hours, AC temperature)
- Deterministic server-side recomputation using the same formulas as the dashboard
- Local client preview for instant UI feedback

**Out of scope**
- Adding or removing appliances from within the simulator
- Persisting simulated scenarios (stateless endpoint)
- Multi-day scheduling or seasonal variation

**Ambiguity policy**
- Adjustments referencing an unknown `applianceId` **MUST** be ignored silently (not 400) — the simulator is exploratory.
- If only `newTemperature` is provided for a non-cooling appliance, treat it as a no-op for that appliance.

## Examples

**Valid request**
```json
{
  "homeId": "65f0...",
  "adjustments": [
    { "applianceId": "a1", "newDailyHours": 4 },
    { "applianceId": "a2", "newTemperature": 26 }
  ]
}
```

**Valid response (abbreviated)**
```json
{
  "success": true,
  "data": {
    "original":  { "monthlyKwh": 248.5, "monthlyCost": 612000, "co2Kg": 226.8 },
    "simulated": { "monthlyKwh": 198.0, "monthlyCost": 487000, "co2Kg": 180.8 },
    "delta":     { "kwhSaved": 50.5, "costSaved": 125000, "co2Saved": 46.0, "treesEquivalent": 2.3 }
  }
}
```

**Invalid — temperature out of range**
```json
{ "adjustments": [{ "applianceId": "a1", "newTemperature": 10 }] }
```
→ `400` (zod violation: `min(16)`).

## Success Criteria

- Heatmap simulator shows real-time VND/CO2 changes when adjusting appliances.
