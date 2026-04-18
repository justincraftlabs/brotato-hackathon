export interface EvnTier {
  tier: number;
  minKwh: number;
  maxKwh: number;
  ratePerKwh: number;
  /** [oldRate, newRate] — range shown in the 2026 tariff schedule */
  rateRange: readonly [number, number];
}

// Source: EVN residential tariff 2026 (Biểu giá điện sinh hoạt 6 bậc)
// Prices exclude 10% VAT. ratePerKwh = current 2026 applicable rate.
export const EVN_TIERS: readonly EvnTier[] = [
  { tier: 1, minKwh: 0,   maxKwh: 50,       ratePerKwh: 1984, rateRange: [1826, 1984] },
  { tier: 2, minKwh: 50,  maxKwh: 100,      ratePerKwh: 2050, rateRange: [1892, 2050] },
  { tier: 3, minKwh: 100, maxKwh: 200,      ratePerKwh: 2380, rateRange: [2109, 2380] },
  { tier: 4, minKwh: 200, maxKwh: 300,      ratePerKwh: 2998, rateRange: [2667, 2998] },
  { tier: 5, minKwh: 300, maxKwh: 400,      ratePerKwh: 3350, rateRange: [3015, 3350] },
  { tier: 6, minKwh: 400, maxKwh: Infinity, ratePerKwh: 3967, rateRange: [3151, 3967] },
] as const;

export const FIRST_TIER_INDEX = 0;
