export interface TopConsumer {
  applianceId: string;
  name: string;
  monthlyKwh: number;
  monthlyCost: number;
  roomName: string;
}

export interface EvnTierInfo {
  current: number;
  nextThreshold: number;
  currentRate: number;
  nextRate: number;
}

export interface Anomaly {
  applianceId: string;
  name: string;
  reason: string;
  suggestedAction: string;
}

export interface Co2Data {
  totalKg: number;
  treesEquivalent: number;
}

export interface Comparison {
  averageHouseholdKwh: number;
  percentDifference: number;
  status: 'above' | 'below' | 'average';
}

export interface VampireAppliance {
  applianceId: string;
  name: string;
  roomName: string;
  standbyWattage: number;
  monthlyStandbyKwh: number;
  monthlyStandbyCost: number;
  standbyRatio: number;
}

export interface VampireData {
  topVampires: VampireAppliance[];
  totalStandbyKwh: number;
  totalStandbyCost: number;
  vampirePercent: number;
}

export interface RoomStat {
  roomName: string;
  totalKwh: number;
  totalCost: number;
  applianceCount: number;
}

export interface DashboardData {
  totalMonthlyKwh: number;
  totalMonthlyCost: number;
  evnTier: number;
  topConsumers: TopConsumer[];
  roomStats: RoomStat[];
  comparison: Comparison;
  anomalies: Anomaly[];
  co2: Co2Data;
  vampireData: VampireData;
}
