# Energy Dashboard (F2)

## User Stories

> As a homeowner, I want to see which appliances consume the most energy so I know where to cut back.
>
> As a homeowner, I want to see my CO2 impact in tree equivalents so I feel motivated to save.

## API Contract

### GET /api/energy/:homeId/dashboard

```typescript
// Response
{
  success: true,
  data: {
    totalMonthlyKwh: number;
    totalMonthlyCost: number;
    evnTier: {
      current: number;
      nextThreshold: number;
      currentRate: number;
      nextRate: number;
    };
    topConsumers: Array<{
      applianceName: string;
      roomName: string;
      monthlyKwh: number;
      monthlyCost: number;
      percentOfTotal: number;
    }>;
    comparison: {
      vsLastMonth: number;
      trend: "up" | "down" | "stable";
    };
    anomalies: Array<{
      applianceName: string;
      deviation: number;
      message: string;
    }>;
    co2: {
      totalKg: number;
      treesEquivalent: number;
    };
  }
}
```

## Dashboard Layout (mobile, top to bottom)

1. **Header Section**
   - Welcome greeting with time of day ("Chào buổi sáng!")
   - Quick stat: "Tháng này: XXX kWh ~ XXX,000đ"

2. **Anomaly Alerts** (if any)
   - Red/amber banner: "Tủ lạnh đang ngốn điện hơn 34% so với tháng trước"
   - Tappable → scrolls to appliance detail

3. **EVN Tier Progress**
   - Visual progress bar showing current kWh vs tier thresholds
   - Color-coded segments (green → amber → red as tier increases)
   - Text: "Còn 45 kWh nữa sẽ lên bậc 4 (2,860đ/kWh)"

4. **Top Consumers Chart**
   - Horizontal bar chart (Recharts)
   - Top 5 appliances by monthly kWh
   - Color: green (normal) → amber (high) → red (anomaly)
   - Each bar shows: appliance name, kWh, VND, % of total

5. **Month Comparison**
   - Simple card: "+12% so với tháng trước" or "-8% so với tháng trước"
   - Arrow indicator with color (green for down, red for up)

6. **CO2 Impact Card**
   - Total CO2 this month (kg)
   - Tree equivalents with visual tree icons
   - "Tương đương X cây xanh trưởng thành/năm"

7. **Quick Actions**
   - "Xem gợi ý tiết kiệm" → `/chat`
   - "Mô phỏng tiết kiệm" → `/simulator`

## EVN Tiered Pricing (2024)

```typescript
const EVN_TIERS = [
  { tier: 1, maxKwh: 50,       ratePerKwh: 1893 },
  { tier: 2, maxKwh: 100,      ratePerKwh: 1956 },
  { tier: 3, maxKwh: 200,      ratePerKwh: 2271 },
  { tier: 4, maxKwh: 300,      ratePerKwh: 2860 },
  { tier: 5, maxKwh: 400,      ratePerKwh: 3197 },
  { tier: 6, maxKwh: Infinity, ratePerKwh: 3302 },
];
```

## CO2 Constants

```typescript
const CO2_EMISSION_FACTOR = 0.913;      // kg CO2 per kWh (Vietnam grid)
const CO2_PER_TREE_PER_YEAR = 20;       // kg CO2 absorbed by 1 mature tree/year
```

## Backend Service Logic

### `energy-service.ts`

1. Get home from MongoDB
2. Calculate total monthly kWh across all appliances: `(wattage / 1000) * dailyHours * 30`
3. Calculate total monthly cost using EVN tiered pricing
4. Determine current EVN tier + next threshold
5. Rank top consumers (sort by monthlyKwh desc, take top 5)
6. Generate mock comparison data (±5-15% random for demo)
7. Flag anomalies (any appliance >120% of its type's baseline)
8. Calculate CO2: `totalKwh * 0.913`, trees = `co2 / 20`

### `evn-pricing-service.ts`

```typescript
calculateMonthlyCost(totalKwh: number): number
// Iterate through EVN_TIERS, accumulate cost per tier

getCurrentTier(totalKwh: number): { current, nextThreshold, currentRate, nextRate }
// Returns which tier the household is currently at
```

## Data Fetching

- `GET /api/energy/:homeId/dashboard` on page load
- Pull-to-refresh on mobile
- Skeleton loaders during fetch

## Success Criteria

- Dashboard shows energy breakdown with clear visual hierarchy
