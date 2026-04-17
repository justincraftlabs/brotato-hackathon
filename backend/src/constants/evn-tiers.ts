export interface EvnTier {
  tier: number;
  maxKwh: number;
  ratePerKwh: number;
}

export const EVN_TIERS: readonly EvnTier[] = [
  { tier: 1, maxKwh: 50, ratePerKwh: 1893 },
  { tier: 2, maxKwh: 100, ratePerKwh: 1956 },
  { tier: 3, maxKwh: 200, ratePerKwh: 2271 },
  { tier: 4, maxKwh: 300, ratePerKwh: 2860 },
  { tier: 5, maxKwh: 400, ratePerKwh: 3197 },
  { tier: 6, maxKwh: Infinity, ratePerKwh: 3302 },
] as const;

export const FIRST_TIER_INDEX = 0;
