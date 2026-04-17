import { getHome } from './home-service';
import { calculateMonthlyCost, getCurrentTier } from './evn-pricing-service';
import {
  CO2_EMISSION_FACTOR_KG_PER_KWH,
  CO2_ABSORPTION_PER_TREE_KG_PER_YEAR,
} from '../constants/co2';
import { APPLIANCE_DEFAULTS } from '../constants/appliance-defaults';
import {
  DashboardData,
  TopConsumer,
  Comparison,
  Anomaly,
  Co2Data,
} from '../types/energy';
import { Appliance, Room } from '../types/home';

const TOP_CONSUMERS_LIMIT = 5;
const ANOMALY_THRESHOLD_MULTIPLIER = 1.2;
const MONTHS_PER_YEAR = 12;
const PERCENT_MULTIPLIER = 100;
const ZERO_KWH = 0;
const AVERAGE_HOUSEHOLD_KWH = 300;
const STABLE_THRESHOLD = 2;

interface ApplianceWithRoom {
  appliance: Appliance;
  roomName: string;
}

function collectAppliancesWithRoom(rooms: Room[]): ApplianceWithRoom[] {
  const result: ApplianceWithRoom[] = [];

  for (const room of rooms) {
    for (const appliance of room.appliances) {
      result.push({ appliance, roomName: room.name });
    }
  }

  return result;
}

function buildTopConsumers(
  appliancesWithRoom: ApplianceWithRoom[]
): TopConsumer[] {
  const sorted = [...appliancesWithRoom].sort(
    (a, b) => b.appliance.monthlyKwh - a.appliance.monthlyKwh
  );

  return sorted.slice(0, TOP_CONSUMERS_LIMIT).map(({ appliance, roomName }) => ({
    applianceId: appliance.applianceId,
    name: appliance.name,
    monthlyKwh: appliance.monthlyKwh,
    monthlyCost: appliance.monthlyCost,
    roomName,
  }));
}

function buildComparison(totalMonthlyKwh: number): Comparison {
  const delta =
    ((totalMonthlyKwh - AVERAGE_HOUSEHOLD_KWH) / AVERAGE_HOUSEHOLD_KWH) * PERCENT_MULTIPLIER;
  const roundedDelta = Math.round(delta * PERCENT_MULTIPLIER) / PERCENT_MULTIPLIER;

  let status: Comparison['status'] = 'average';
  if (roundedDelta > STABLE_THRESHOLD) {
    status = 'above';
  }
  if (roundedDelta < -STABLE_THRESHOLD) {
    status = 'below';
  }

  return {
    averageHouseholdKwh: AVERAGE_HOUSEHOLD_KWH,
    percentDifference: roundedDelta,
    status,
  };
}

function buildAnomalies(appliancesWithRoom: ApplianceWithRoom[]): Anomaly[] {
  const anomalies: Anomaly[] = [];

  for (const { appliance, roomName } of appliancesWithRoom) {
    const baseline = APPLIANCE_DEFAULTS[appliance.type];
    if (!baseline) {
      continue;
    }

    const baselineMonthlyKwh =
      (baseline.typicalWattage / 1000) * baseline.typicalDailyHours * 30;
    const deviationRatio = appliance.monthlyKwh / baselineMonthlyKwh;

    if (deviationRatio <= ANOMALY_THRESHOLD_MULTIPLIER) {
      continue;
    }

    const deviationPercent = Math.round(
      (deviationRatio - 1) * PERCENT_MULTIPLIER
    );

    anomalies.push({
      applianceId: appliance.applianceId,
      name: appliance.name,
      reason: `${appliance.name} tai ${roomName} tieu thu cao hon ${deviationPercent}% so voi muc trung binh`,
      suggestedAction: `Kiem tra ${appliance.name} - co the can bao tri hoac dieu chinh thoi gian su dung`,
    });
  }

  return anomalies;
}

function buildCo2(totalMonthlyKwh: number): Co2Data {
  const totalKg = totalMonthlyKwh * CO2_EMISSION_FACTOR_KG_PER_KWH;
  const treesEquivalent =
    (totalKg / CO2_ABSORPTION_PER_TREE_KG_PER_YEAR) * MONTHS_PER_YEAR;

  return {
    totalKg: Math.round(totalKg * PERCENT_MULTIPLIER) / PERCENT_MULTIPLIER,
    treesEquivalent: Math.round(treesEquivalent * PERCENT_MULTIPLIER) / PERCENT_MULTIPLIER,
  };
}

export async function getDashboard(
  homeId: string
): Promise<DashboardData | null> {
  const home = await getHome(homeId);
  if (!home) {
    return null;
  }

  const appliancesWithRoom = collectAppliancesWithRoom(home.rooms);

  const totalMonthlyKwh = appliancesWithRoom.reduce(
    (sum, { appliance }) => sum + appliance.monthlyKwh,
    ZERO_KWH
  );

  const totalMonthlyCost = calculateMonthlyCost(totalMonthlyKwh);
  const evnTierInfo = getCurrentTier(totalMonthlyKwh);
  const evnTier = evnTierInfo.current;
  const topConsumers = buildTopConsumers(appliancesWithRoom);
  const comparison = buildComparison(totalMonthlyKwh);
  const anomalies = buildAnomalies(appliancesWithRoom);
  const co2 = buildCo2(totalMonthlyKwh);

  return {
    totalMonthlyKwh,
    totalMonthlyCost,
    evnTier,
    topConsumers,
    comparison,
    anomalies,
    co2,
  };
}
