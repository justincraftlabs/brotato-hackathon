"use client";

import { CO2_EMISSION_FACTOR, EVN_TIERS } from "./constants";

export function calculateMonthlyKwh(
  wattage: number,
  dailyHours: number
): number {
  const HOURS_PER_MONTH = 30;
  const WATTS_TO_KW = 1000;
  return (wattage / WATTS_TO_KW) * dailyHours * HOURS_PER_MONTH;
}

export function calculateMonthlyCost(totalKwh: number): number {
  let remainingKwh = totalKwh;
  let totalCost = 0;

  for (const tier of EVN_TIERS) {
    if (remainingKwh <= 0) {
      break;
    }

    const tierRange = tier.maxKwh === Infinity
      ? remainingKwh
      : tier.maxKwh - tier.minKwh + 1;
    const kwhInTier = Math.min(remainingKwh, tierRange);
    totalCost += kwhInTier * tier.pricePerKwh;
    remainingKwh -= kwhInTier;
  }

  return totalCost;
}

export function calculateCo2(kwh: number): number {
  return kwh * CO2_EMISSION_FACTOR;
}
