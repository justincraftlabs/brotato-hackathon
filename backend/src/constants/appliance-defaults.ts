export interface ApplianceDefault {
  type: string;
  typicalWattage: number;
  typicalStandbyWattage: number;
  typicalDailyHours: number;
}

export const APPLIANCE_DEFAULTS: Record<string, ApplianceDefault> = {
  air_conditioner: {
    type: 'air_conditioner',
    // 1.5HP non-inverter running at typical load; 6h/day ≈ 198 kWh/month
    typicalWattage: 1100,
    typicalStandbyWattage: 5,
    typicalDailyHours: 6,
  },
  fan: {
    type: 'fan',
    typicalWattage: 60,
    typicalStandbyWattage: 0,
    typicalDailyHours: 10,
  },
  refrigerator: {
    type: 'refrigerator',
    // Average consumption wattage (compressor ~30-40% duty cycle); 50W × 24h ≈ 36 kWh/month
    typicalWattage: 50,
    typicalStandbyWattage: 50,
    typicalDailyHours: 24,
  },
  washing_machine: {
    type: 'washing_machine',
    typicalWattage: 500,
    typicalStandbyWattage: 2,
    typicalDailyHours: 1,
  },
  television: {
    type: 'television',
    typicalWattage: 120,
    typicalStandbyWattage: 5,
    typicalDailyHours: 5,
  },
  rice_cooker: {
    type: 'rice_cooker',
    typicalWattage: 700,
    typicalStandbyWattage: 0,
    typicalDailyHours: 1,
  },
  water_heater: {
    type: 'water_heater',
    // 2500W storage heater; 0.5h/day (15-20 min shower) ≈ 37.5 kWh/month
    typicalWattage: 2500,
    typicalStandbyWattage: 0,
    typicalDailyHours: 0.5,
  },
  light_bulb: {
    type: 'light_bulb',
    typicalWattage: 10,
    typicalStandbyWattage: 0,
    typicalDailyHours: 8,
  },
  computer: {
    type: 'computer',
    typicalWattage: 200,
    typicalStandbyWattage: 3,
    typicalDailyHours: 8,
  },
  microwave: {
    type: 'microwave',
    typicalWattage: 1000,
    typicalStandbyWattage: 2,
    typicalDailyHours: 0.5,
  },
};
