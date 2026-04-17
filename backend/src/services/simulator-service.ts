import { getHome } from './home-service';
import {
  calculateApplianceMonthlyKwh,
  calculateMonthlyCost,
} from './evn-pricing-service';
import {
  CO2_EMISSION_FACTOR_KG_PER_KWH,
  CO2_ABSORPTION_PER_TREE_KG_PER_YEAR,
} from '../constants/co2';
import {
  Adjustment,
  SimulationResult,
  ApplianceSimulationResult,
  ImpactLevel,
} from '../types/simulator';
import { Appliance } from '../types/home';

const MONTHS_PER_YEAR = 12;
const TWO_DECIMAL_PRECISION = 100;
const BASE_TEMPERATURE_CELSIUS = 20;
const SAVINGS_PER_DEGREE = 0.035;
const MIN_WATTAGE_RATIO = 0.3;
const HIGH_IMPACT_THRESHOLD = 0.2;
const MEDIUM_IMPACT_THRESHOLD = 0.1;
const ZERO_KWH = 0;

interface AdjustedAppliance {
  applianceId: string;
  name: string;
  originalKwh: number;
  simulatedKwh: number;
}

function applyTemperatureAdjustment(
  originalWattage: number,
  newTemperature: number
): number {
  const degreesAboveBase = newTemperature - BASE_TEMPERATURE_CELSIUS;
  const reductionFactor = 1 - degreesAboveBase * SAVINGS_PER_DEGREE;
  const clampedFactor = Math.max(reductionFactor, MIN_WATTAGE_RATIO);
  return originalWattage * clampedFactor;
}

function resolveWattage(
  appliance: Appliance,
  adjustment: Adjustment | undefined
): number {
  if (!adjustment) {
    return appliance.wattage;
  }

  if (adjustment.newTemperature !== undefined) {
    const baseWattage = adjustment.newWattage ?? appliance.wattage;
    return applyTemperatureAdjustment(baseWattage, adjustment.newTemperature);
  }

  return adjustment.newWattage ?? appliance.wattage;
}

function resolveDailyHours(
  appliance: Appliance,
  adjustment: Adjustment | undefined
): number {
  if (!adjustment) {
    return appliance.dailyUsageHours;
  }

  return adjustment.newDailyHours ?? appliance.dailyUsageHours;
}

function determineImpact(
  originalKwh: number,
  simulatedKwh: number
): ImpactLevel {
  if (originalKwh <= ZERO_KWH) {
    return 'low';
  }

  const reductionRatio = (originalKwh - simulatedKwh) / originalKwh;

  if (reductionRatio > HIGH_IMPACT_THRESHOLD) {
    return 'high';
  }

  if (reductionRatio >= MEDIUM_IMPACT_THRESHOLD) {
    return 'medium';
  }

  return 'low';
}

export async function calculateSimulation(
  homeId: string,
  adjustments: Adjustment[]
): Promise<SimulationResult | null> {
  const home = await getHome(homeId);
  if (!home) {
    return null;
  }

  const adjustmentMap = new Map<string, Adjustment>();
  for (const adj of adjustments) {
    adjustmentMap.set(adj.applianceId, adj);
  }

  const allAppliances: Appliance[] = home.rooms.flatMap(
    (room) => room.appliances
  );

  let originalTotalKwh = ZERO_KWH;
  let simulatedTotalKwh = ZERO_KWH;
  const adjustedAppliances: AdjustedAppliance[] = [];

  for (const appliance of allAppliances) {
    const adjustment = adjustmentMap.get(appliance.applianceId);

    const originalKwh = calculateApplianceMonthlyKwh(
      appliance.wattage,
      appliance.dailyUsageHours
    );

    const adjustedWattage = resolveWattage(appliance, adjustment);
    const adjustedDailyHours = resolveDailyHours(appliance, adjustment);

    const simulatedKwh = calculateApplianceMonthlyKwh(
      adjustedWattage,
      adjustedDailyHours
    );

    originalTotalKwh += originalKwh;
    simulatedTotalKwh += simulatedKwh;

    adjustedAppliances.push({
      applianceId: appliance.applianceId,
      name: appliance.name,
      originalKwh,
      simulatedKwh,
    });
  }

  const originalMonthlyCost = calculateMonthlyCost(originalTotalKwh);
  const simulatedMonthlyCost = calculateMonthlyCost(simulatedTotalKwh);

  const originalCo2Kg = Math.round(originalTotalKwh * CO2_EMISSION_FACTOR_KG_PER_KWH * TWO_DECIMAL_PRECISION) / TWO_DECIMAL_PRECISION;
  const simulatedCo2Kg = Math.round(simulatedTotalKwh * CO2_EMISSION_FACTOR_KG_PER_KWH * TWO_DECIMAL_PRECISION) / TWO_DECIMAL_PRECISION;

  const kwhSaved = originalTotalKwh - simulatedTotalKwh;
  const costSaved = originalMonthlyCost - simulatedMonthlyCost;
  const co2Saved = Math.round((originalCo2Kg - simulatedCo2Kg) * TWO_DECIMAL_PRECISION) / TWO_DECIMAL_PRECISION;
  const annualCo2Saved = co2Saved * MONTHS_PER_YEAR;
  const treesEquivalent =
    CO2_ABSORPTION_PER_TREE_KG_PER_YEAR > 0
      ? annualCo2Saved / CO2_ABSORPTION_PER_TREE_KG_PER_YEAR
      : 0;

  const perAppliance: ApplianceSimulationResult[] = adjustedAppliances.map(
    (item) => ({
      applianceId: item.applianceId,
      applianceName: item.name,
      originalKwh: item.originalKwh,
      simulatedKwh: item.simulatedKwh,
      impact: determineImpact(item.originalKwh, item.simulatedKwh),
    })
  );

  return {
    original: {
      monthlyKwh: originalTotalKwh,
      monthlyCost: originalMonthlyCost,
      co2Kg: originalCo2Kg,
    },
    simulated: {
      monthlyKwh: simulatedTotalKwh,
      monthlyCost: simulatedMonthlyCost,
      co2Kg: simulatedCo2Kg,
    },
    delta: {
      kwhSaved,
      costSaved,
      co2Saved,
      treesEquivalent: Math.round(treesEquivalent * 100) / 100,
    },
    perAppliance,
  };
}
