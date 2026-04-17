import { v4 as uuidv4 } from 'uuid';
import { connectDatabase } from '../db/connection';
import { HomeModel } from '../models/home.model';
import { RoomModel } from '../models/room.model';
import { ApplianceModel } from '../models/appliance.model';
import {
  calculateApplianceMonthlyKwh,
  calculateMonthlyCost,
} from '../services/evn-pricing-service';
import { CO2_EMISSION_FACTOR_KG_PER_KWH } from '../constants/co2';
import { RoomType, RoomSize } from '../types/home';
import mongoose from 'mongoose';

const DEMO_HOME_ID = 'demo-home-001';

const USAGE_HABIT_DAILY = 'daily';
const USAGE_HABIT_ALWAYS_ON = 'always_on';

const WATTS_TO_KW_DIVISOR = 1000;
const DAYS_PER_MONTH = 30;
const HOURS_FULL_DAY = 24;

interface SeedAppliance {
  name: string;
  type: string;
  wattage: number;
  dailyUsageHours: number;
  standbyWattage: number;
}

interface SeedRoom {
  name: string;
  type: RoomType;
  size: RoomSize;
  appliances: SeedAppliance[];
}

const SEED_ROOMS: SeedRoom[] = [
  {
    name: 'Phong khach',
    type: 'living_room',
    size: 'large',
    appliances: [
      {
        name: 'Dieu hoa Daikin 1.5HP',
        type: 'air_conditioner',
        wattage: 1500,
        dailyUsageHours: 10,
        standbyWattage: 10,
      },
      {
        name: 'TV Samsung 55 inch',
        type: 'television',
        wattage: 120,
        dailyUsageHours: 6,
        standbyWattage: 10,
      },
      {
        name: 'Quat dung Panasonic',
        type: 'fan',
        wattage: 60,
        dailyUsageHours: 8,
        standbyWattage: 0,
      },
    ],
  },
  {
    name: 'Phong ngu chinh',
    type: 'bedroom',
    size: 'medium',
    appliances: [
      {
        name: 'Dieu hoa LG 1HP',
        type: 'air_conditioner',
        wattage: 1200,
        dailyUsageHours: 8,
        standbyWattage: 10,
      },
      {
        name: 'Den LED',
        type: 'light',
        wattage: 10,
        dailyUsageHours: 6,
        standbyWattage: 0,
      },
    ],
  },
  {
    name: 'Phong ngu con',
    type: 'bedroom',
    size: 'small',
    appliances: [
      {
        name: 'Quat tran',
        type: 'fan',
        wattage: 60,
        dailyUsageHours: 10,
        standbyWattage: 0,
      },
      {
        name: 'Den LED',
        type: 'light',
        wattage: 10,
        dailyUsageHours: 8,
        standbyWattage: 0,
      },
    ],
  },
  {
    name: 'Bep',
    type: 'kitchen',
    size: 'small',
    appliances: [
      {
        name: 'Tu lanh Hitachi',
        type: 'refrigerator',
        wattage: 150,
        dailyUsageHours: 24,
        standbyWattage: 150,
      },
      {
        name: 'Noi com dien Tiger',
        type: 'rice_cooker',
        wattage: 700,
        dailyUsageHours: 1,
        standbyWattage: 5,
      },
      {
        name: 'Lo vi song',
        type: 'microwave',
        wattage: 1000,
        dailyUsageHours: 0.3,
        standbyWattage: 3,
      },
      {
        name: 'May loc nuoc',
        type: 'water_purifier',
        wattage: 30,
        dailyUsageHours: 24,
        standbyWattage: 0,
      },
    ],
  },
  {
    name: 'Phong lam viec',
    type: 'office',
    size: 'medium',
    appliances: [
      {
        name: 'Laptop + man hinh',
        type: 'computer',
        wattage: 200,
        dailyUsageHours: 10,
        standbyWattage: 5,
      },
      {
        name: 'Den ban LED',
        type: 'light',
        wattage: 15,
        dailyUsageHours: 10,
        standbyWattage: 0,
      },
      {
        name: 'Router WiFi',
        type: 'router',
        wattage: 12,
        dailyUsageHours: 24,
        standbyWattage: 12,
      },
    ],
  },
];

function resolveUsageHabit(dailyUsageHours: number): string {
  if (dailyUsageHours >= HOURS_FULL_DAY) {
    return USAGE_HABIT_ALWAYS_ON;
  }
  return USAGE_HABIT_DAILY;
}

async function clearExistingData(): Promise<void> {
  await Promise.all([
    ApplianceModel.deleteMany({ homeId: DEMO_HOME_ID }),
    RoomModel.deleteMany({ homeId: DEMO_HOME_ID }),
    HomeModel.deleteOne({ homeId: DEMO_HOME_ID }),
  ]);
}

interface ApplianceWithKwh {
  applianceId: string;
  roomId: string;
  homeId: string;
  name: string;
  type: string;
  wattage: number;
  dailyUsageHours: number;
  standbyWattage: number;
  usageHabit: string;
  monthlyKwh: number;
  monthlyCost: number;
}

function buildApplianceDocs(
  rooms: SeedRoom[],
  roomIdMap: Map<string, string>,
  totalKwh: number,
  totalCost: number
): ApplianceWithKwh[] {
  const docs: ApplianceWithKwh[] = [];

  for (const room of rooms) {
    const roomId = roomIdMap.get(room.name);
    if (!roomId) {
      continue;
    }

    for (const appliance of room.appliances) {
      const monthlyKwh = calculateApplianceMonthlyKwh(
        appliance.wattage,
        appliance.dailyUsageHours
      );

      const proportionalCost =
        totalKwh > 0
          ? Math.round((monthlyKwh / totalKwh) * totalCost)
          : 0;

      docs.push({
        applianceId: uuidv4(),
        roomId,
        homeId: DEMO_HOME_ID,
        name: appliance.name,
        type: appliance.type,
        wattage: appliance.wattage,
        dailyUsageHours: appliance.dailyUsageHours,
        standbyWattage: appliance.standbyWattage,
        usageHabit: resolveUsageHabit(appliance.dailyUsageHours),
        monthlyKwh: parseFloat(monthlyKwh.toFixed(2)),
        monthlyCost: proportionalCost,
      });
    }
  }

  return docs;
}

function calculateTotalKwh(rooms: SeedRoom[]): number {
  let total = 0;
  for (const room of rooms) {
    for (const appliance of room.appliances) {
      total += calculateApplianceMonthlyKwh(
        appliance.wattage,
        appliance.dailyUsageHours
      );
    }
  }
  return total;
}

async function seed(): Promise<void> {
  await connectDatabase();
  console.log('Connected to MongoDB');

  await clearExistingData();
  console.log('Cleared existing demo data');

  await HomeModel.create({ homeId: DEMO_HOME_ID });

  const roomIdMap = new Map<string, string>();
  const roomDocs = SEED_ROOMS.map((room) => {
    const roomId = uuidv4();
    roomIdMap.set(room.name, roomId);
    return {
      roomId,
      homeId: DEMO_HOME_ID,
      name: room.name,
      type: room.type,
      size: room.size,
    };
  });

  await RoomModel.insertMany(roomDocs);

  const totalKwh = calculateTotalKwh(SEED_ROOMS);
  const totalCost = calculateMonthlyCost(totalKwh);
  const applianceDocs = buildApplianceDocs(
    SEED_ROOMS,
    roomIdMap,
    totalKwh,
    totalCost
  );

  await ApplianceModel.insertMany(applianceDocs);

  const totalCo2Kg = totalKwh * CO2_EMISSION_FACTOR_KG_PER_KWH;
  const totalAppliances = applianceDocs.length;

  console.log('--- Seed Summary ---');
  console.log(`Home: ${DEMO_HOME_ID}`);
  console.log(`Rooms: ${SEED_ROOMS.length}`);
  console.log(`Appliances: ${totalAppliances}`);
  console.log(`Total kWh/month: ${totalKwh.toFixed(2)}`);
  console.log(`Total cost/month: ${totalCost.toLocaleString()} VND`);
  console.log(`Total CO2/month: ${totalCo2Kg.toFixed(2)} kg`);
  console.log('--- Seed Complete ---');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
