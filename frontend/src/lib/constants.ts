export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const CO2_EMISSION_FACTOR = 0.913;
export const CO2_PER_TREE_PER_YEAR = 20;

export interface EvnTier {
  tier: number;
  minKwh: number;
  maxKwh: number;
  /** Current 2026 applicable rate (used for all calculations) */
  pricePerKwh: number;
  /** [oldRate, newRate] — displayed in the pricing info table */
  priceRange: readonly [number, number];
}

// Source: EVN residential tariff 2026 (Biểu giá điện sinh hoạt 6 bậc)
// Prices exclude 10% VAT.
export const EVN_TIERS: readonly EvnTier[] = [
  { tier: 1, minKwh: 0,   maxKwh: 50,       pricePerKwh: 1984, priceRange: [1826, 1984] },
  { tier: 2, minKwh: 50,  maxKwh: 100,      pricePerKwh: 2050, priceRange: [1892, 2050] },
  { tier: 3, minKwh: 100, maxKwh: 200,      pricePerKwh: 2380, priceRange: [2109, 2380] },
  { tier: 4, minKwh: 200, maxKwh: 300,      pricePerKwh: 2998, priceRange: [2667, 2998] },
  { tier: 5, minKwh: 300, maxKwh: 400,      pricePerKwh: 3350, priceRange: [3015, 3350] },
  { tier: 6, minKwh: 400, maxKwh: Infinity, pricePerKwh: 3967, priceRange: [3151, 3967] },
] as const;

export const LOCAL_STORAGE_HOME_ID_KEY = "homeId";
export const LOCAL_STORAGE_RECOMMENDATIONS_KEY = "recommendations_cache";

export const NAV_ROUTES = {
  HOME: "/",
  SETUP: "/setup",
  DASHBOARD: "/dashboard",
  CHAT: "/chat",
  SIMULATOR: "/tips?tab=simulator",
  SUGGESTIONS: "/tips?tab=suggestions",
  SCHEDULES: "/schedules",
  TIPS: "/tips",
  ASSISTANT: "/chat",
} as const;

export const APP_DESCRIPTION = "Illuminate the waste. Eliminate the bill.";

export const CHAT_LABELS = {
  STREAM_DONE_MARKER: "[DONE]",
  STREAM_ERROR_MARKER: "[ERROR]",
  SESSION_HEADER: "X-Session-Id",
} as const;

export const MAX_TREE_ICONS = 10;
