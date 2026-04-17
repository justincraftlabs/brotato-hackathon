"use client";

import { CO2_EMISSION_FACTOR, EVN_TIERS } from "./constants";
import {
  COOLING_TYPE,
  HEATING_TYPE,
  COOLING_AMBIENT_TEMP,
  COOLING_BASELINE_TEMP,
  HEATING_AMBIENT_TEMP,
  HEATING_BASELINE_TEMP,
  TEMP_FACTOR_MIN,
  TEMP_FACTOR_MAX,
} from "./simulator-constants";

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

/**
 * Cooling: factor = (T_ambient - T_set) / (T_ambient - T_baseline)
 *   → at 25°C factor=1.0, at 20°C factor=1.5, at 30°C factor=0.5
 *
 * Heating: factor = (T_set - T_ambient) / (T_baseline - T_ambient)
 *   → at 45°C factor=1.0, at 35°C factor=0.5, at 55°C factor=1.5
 *
 * Non-temperature appliances always return 1.0.
 */
export function calculateTemperatureFactor(
  applianceType: string,
  temperature: number
): number {
  if (applianceType === COOLING_TYPE) {
    const baselineDelta = COOLING_AMBIENT_TEMP - COOLING_BASELINE_TEMP;
    if (baselineDelta <= 0) {
      return 1;
    }
    const actualDelta = COOLING_AMBIENT_TEMP - temperature;
    return Math.max(
      TEMP_FACTOR_MIN,
      Math.min(actualDelta / baselineDelta, TEMP_FACTOR_MAX)
    );
  }

  if (applianceType === HEATING_TYPE) {
    const baselineDelta = HEATING_BASELINE_TEMP - HEATING_AMBIENT_TEMP;
    if (baselineDelta <= 0) {
      return 1;
    }
    const actualDelta = temperature - HEATING_AMBIENT_TEMP;
    return Math.max(
      TEMP_FACTOR_MIN,
      Math.min(actualDelta / baselineDelta, TEMP_FACTOR_MAX)
    );
  }

  return 1;
}
