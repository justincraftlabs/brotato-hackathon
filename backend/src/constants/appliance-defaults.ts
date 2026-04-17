export interface ApplianceDefault {
  type: string;
  typicalWattage: number;
  typicalStandbyWattage: number;
  typicalDailyHours: number;
}

export const APPLIANCE_DEFAULTS: Record<string, ApplianceDefault> = {
  air_conditioner: {
    type: 'air_conditioner',
    typicalWattage: 1500,
    typicalStandbyWattage: 5,
    typicalDailyHours: 8,
  },
  fan: {
    type: 'fan',
    typicalWattage: 60,
    typicalStandbyWattage: 0,
    typicalDailyHours: 10,
  },
  refrigerator: {
    type: 'refrigerator',
    typicalWattage: 150,
    typicalStandbyWattage: 150,
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
    typicalWattage: 2500,
    typicalStandbyWattage: 0,
    typicalDailyHours: 1,
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
