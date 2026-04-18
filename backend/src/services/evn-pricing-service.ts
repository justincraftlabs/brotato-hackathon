import { EVN_TIERS, FIRST_TIER_INDEX, EvnTier } from '../constants/evn-tiers';
import {
  AREA_FACTOR_MAX,
  AREA_FACTOR_MIN,
  AREA_SENSITIVE_APPLIANCE_TYPES,
  BASELINE_ROOM_AREA_M2,
  ROOM_SIZE_AREA_M2,
} from '../constants/room-sizes';
import { RoomSize } from '../types/home';
import { EvnTierInfo } from '../types/energy';

const WATTS_PER_KW = 1000;
const DAYS_PER_MONTH = 30;
const NEUTRAL_FACTOR = 1;

export function calculateApplianceMonthlyKwh(
  wattage: number,
  dailyHours: number
): number {
  return (wattage / WATTS_PER_KW) * dailyHours * DAYS_PER_MONTH;
}

export function calculateSizeFactor(
  size: RoomSize,
  applianceType: string
): number {
  if (!AREA_SENSITIVE_APPLIANCE_TYPES.has(applianceType)) {
    return NEUTRAL_FACTOR;
  }
  if (BASELINE_ROOM_AREA_M2 <= 0) {
    return NEUTRAL_FACTOR;
  }
  const areaM2 = ROOM_SIZE_AREA_M2[size];
  const raw = areaM2 / BASELINE_ROOM_AREA_M2;
  return Math.max(AREA_FACTOR_MIN, Math.min(AREA_FACTOR_MAX, raw));
}

export function calculateApplianceMonthlyKwhForRoom(
  wattage: number,
  dailyHours: number,
  size: RoomSize,
  applianceType: string
): number {
  const factor = calculateSizeFactor(size, applianceType);
  return calculateApplianceMonthlyKwh(wattage * factor, dailyHours);
}

export function calculateMonthlyCost(totalKwh: number): number {
  let remainingKwh = totalKwh;
  let totalCost = 0;
  let previousMax = 0;

  for (const tier of EVN_TIERS) {
    if (remainingKwh <= 0) {
      break;
    }

    const tierCapacity = tier.maxKwh - previousMax;
    const kwhInThisTier = Math.min(remainingKwh, tierCapacity);

    totalCost += kwhInThisTier * tier.ratePerKwh;
    remainingKwh -= kwhInThisTier;
    previousMax = tier.maxKwh;
  }

  return Math.round(totalCost);
}

export function getCurrentTier(totalKwh: number): EvnTierInfo {
  let accumulatedKwh = 0;

  for (let i = 0; i < EVN_TIERS.length; i++) {
    const tier = EVN_TIERS[i] as EvnTier;

    if (totalKwh <= tier.maxKwh) {
      const nextTier = EVN_TIERS[i + 1] as EvnTier | undefined;

      return {
        current: tier.tier,
        nextThreshold: tier.maxKwh,
        currentRate: tier.ratePerKwh,
        nextRate: nextTier?.ratePerKwh ?? tier.ratePerKwh,
      };
    }

    accumulatedKwh = tier.maxKwh;
  }

  const lastTier = EVN_TIERS[EVN_TIERS.length - 1] as EvnTier;
  return {
    current: lastTier.tier,
    nextThreshold: Infinity,
    currentRate: lastTier.ratePerKwh,
    nextRate: lastTier.ratePerKwh,
  };
}
