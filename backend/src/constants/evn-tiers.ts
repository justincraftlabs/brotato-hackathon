export interface EvnTier {
  tier: number;
  maxKwh: number;
  ratePerKwh: number;
}

// Source: Decision No. 1279/QD-BCT dated 09/05/2025 (Ministry of Industry and Trade)
// Effective: 10/05/2025 — prices exclude 8% VAT
export const EVN_TIERS: readonly EvnTier[] = [
  { tier: 1, maxKwh: 50, ratePerKwh: 1984 },
  { tier: 2, maxKwh: 100, ratePerKwh: 2050 },
  { tier: 3, maxKwh: 200, ratePerKwh: 2380 },
  { tier: 4, maxKwh: 300, ratePerKwh: 2998 },
  { tier: 5, maxKwh: 400, ratePerKwh: 3350 },
  { tier: 6, maxKwh: Infinity, ratePerKwh: 3460 },
] as const;

export const FIRST_TIER_INDEX = 0;
