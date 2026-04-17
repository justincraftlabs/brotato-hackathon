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

## Success Criteria

- Heatmap simulator shows real-time VND/CO2 changes when adjusting appliances
