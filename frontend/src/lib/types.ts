export type RoomType =
  | "bedroom"
  | "living_room"
  | "kitchen"
  | "bathroom"
  | "office"
  | "other";

export type RoomSize = "small" | "medium" | "large";

export type RecommendationType = "behavior" | "upgrade" | "schedule" | "vampire";

export type RecommendationPriority = "high" | "medium" | "low";

export type RecommendationDifficulty = "easy" | "medium" | "hard";

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  size: RoomSize;
}

export interface Appliance {
  id: string;
  roomId: string;
  name: string;
  type: string;
  wattage: number;
  dailyUsageHours: number;
  standbyWattage: number;
  usageHabit: string;
  monthlyKwh: number;
  monthlyCost: number;
}

export interface RoomWithAppliances extends Room {
  appliances: Appliance[];
}

export interface Home {
  homeId: string;
  rooms: RoomWithAppliances[];
}

export interface TopConsumer {
  applianceId: string;
  name: string;
  monthlyKwh: number;
  monthlyCost: number;
  roomName: string;
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

export interface ComparisonData {
  averageHouseholdKwh: number;
  percentDifference: number;
  status: 'above' | 'below' | 'average';
}

export interface DashboardData {
  totalMonthlyKwh: number;
  totalMonthlyCost: number;
  evnTier: number;
  topConsumers: TopConsumer[];
  comparison: ComparisonData;
  anomalies: Anomaly[];
  co2: Co2Data;
}

export interface Recommendation {
  id: string;
  applianceName: string;
  roomName: string;
  type: RecommendationType;
  title: string;
  description: string;
  savingsKwh: number;
  savingsVnd: number;
  priority: RecommendationPriority;
  difficulty: RecommendationDifficulty;
}

export interface ApplianceEstimate {
  name: string;
  type: string;
  estimatedWattage: number;
  estimatedStandbyWattage: number;
  commonBrands: string[];
}

export interface ImageRecognitionResult {
  name: string;
  type: string;
  estimatedWattage: number;
  estimatedStandbyWattage: number;
  brand: string;
  model: string;
  confidence: 'high' | 'medium' | 'low';
  details: string;
}

export interface SimulationAdjustment {
  applianceId: string;
  newDailyHours?: number;
  newWattage?: number;
  newTemperature?: number;
}

export interface EnergySnapshot {
  monthlyKwh: number;
  monthlyCost: number;
  co2Kg: number;
}

export interface SimulationDelta {
  kwhSaved: number;
  costSaved: number;
  co2Saved: number;
  treesEquivalent: number;
}

export interface ApplianceSimulationResult {
  applianceId: string;
  applianceName: string;
  originalKwh: number;
  simulatedKwh: number;
  impact: "high" | "medium" | "low";
}

export interface SimulationResult {
  original: EnergySnapshot;
  simulated: EnergySnapshot;
  delta: SimulationDelta;
  perAppliance: ApplianceSimulationResult[];
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
