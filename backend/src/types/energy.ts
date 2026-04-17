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

export interface DashboardData {
  totalMonthlyKwh: number;
  totalMonthlyCost: number;
  evnTier: number;
  topConsumers: TopConsumer[];
  comparison: Comparison;
  anomalies: Anomaly[];
  co2: Co2Data;
}
