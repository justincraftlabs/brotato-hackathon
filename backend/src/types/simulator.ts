export interface Adjustment {
  applianceId: string;
  newWattage?: number;
  newDailyHours?: number;
  newTemperature?: number;
}

export type ImpactLevel = 'high' | 'medium' | 'low';

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
  impact: ImpactLevel;
}

export interface SimulationResult {
  original: EnergySnapshot;
  simulated: EnergySnapshot;
  delta: SimulationDelta;
  perAppliance: ApplianceSimulationResult[];
}
