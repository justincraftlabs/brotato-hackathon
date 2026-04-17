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
const HIGH_IMPACT_THRESHOLD = 0.2;
const MEDIUM_IMPACT_THRESHOLD = 0.1;
const ZERO_KWH = 0;

const COOLING_TYPE = 'cooling';
const HEATING_TYPE = 'heating';

const COOLING_AMBIENT_TEMP = 35;
const COOLING_BASELINE_TEMP = 25;
const HEATING_AMBIENT_TEMP = 25;
const HEATING_BASELINE_TEMP = 45;
const TEMP_FACTOR_MIN = 0;
const TEMP_FACTOR_MAX = 2;

interface AdjustedAppliance {
  applianceId: string;
  name: string;
  originalKwh: number;
  simulatedKwh: number;
}

function calculateTemperatureFactor(
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

function resolveWattage(
  appliance: Appliance,
  adjustment: Adjustment | undefined
): number {
  if (!adjustment) {
    return appliance.wattage;
  }

  const baseWattage = adjustment.newWattage ?? appliance.wattage;

  if (adjustment.newTemperature !== undefined) {
    const factor = calculateTemperatureFactor(appliance.type, adjustment.newTemperature);
    return baseWattage * factor;
  }

  return baseWattage;
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
