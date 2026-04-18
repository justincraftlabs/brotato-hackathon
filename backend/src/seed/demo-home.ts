import { v4 as uuidv4 } from 'uuid';
import { connectDatabase } from '../db/connection';
import { HomeModel } from '../models/home.model';
import { RoomModel } from '../models/room.model';
import { ApplianceModel } from '../models/appliance.model';
import {
  calculateApplianceMonthlyKwhForRoom,
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
      { name: 'Dieu hoa Daikin 12000BTU', type: 'cooling', wattage: 1500, dailyUsageHours: 8, standbyWattage: 15 },
      { name: 'Tivi Samsung 55 inch', type: 'entertainment', wattage: 120, dailyUsageHours: 5, standbyWattage: 8 },
      { name: 'Quat tran Panasonic', type: 'cooling', wattage: 65, dailyUsageHours: 10, standbyWattage: 0 },
      { name: 'Den LED phong khach', type: 'lighting', wattage: 24, dailyUsageHours: 6, standbyWattage: 0 },
      { name: 'Loa soundbar JBL', type: 'entertainment', wattage: 80, dailyUsageHours: 3, standbyWattage: 12 },
    ],
  },
  {
    name: 'Phong ngu',
    type: 'bedroom',
    size: 'medium',
    appliances: [
      { name: 'Dieu hoa phong ngu', type: 'cooling', wattage: 1200, dailyUsageHours: 9, standbyWattage: 12 },
      { name: 'Den ngu LED', type: 'lighting', wattage: 10, dailyUsageHours: 2, standbyWattage: 0 },
      { name: 'Quat dung Senko', type: 'cooling', wattage: 55, dailyUsageHours: 6, standbyWattage: 0 },
      { name: 'May loc khong khi Xiaomi', type: 'other', wattage: 45, dailyUsageHours: 24, standbyWattage: 5 },
    ],
  },
  {
    name: 'Bep',
    type: 'kitchen',
    size: 'medium',
    appliances: [
      { name: 'Tu lanh Panasonic 300L', type: 'kitchen', wattage: 150, dailyUsageHours: 24, standbyWattage: 0 },
      { name: 'Noi com dien Toshiba', type: 'kitchen', wattage: 700, dailyUsageHours: 1, standbyWattage: 5 },
      { name: 'Lo vi song Sharp', type: 'kitchen', wattage: 1000, dailyUsageHours: 0.5, standbyWattage: 3 },
      { name: 'May giat Samsung 9kg', type: 'laundry', wattage: 500, dailyUsageHours: 1, standbyWattage: 4 },
      { name: 'Binh nong lanh Ariston', type: 'heating', wattage: 2500, dailyUsageHours: 0.5, standbyWattage: 10 },
    ],
  },
  {
    name: 'Phong tam',
    type: 'bathroom',
    size: 'small',
    appliances: [
      { name: 'May say toc Philips', type: 'heating', wattage: 1200, dailyUsageHours: 0.3, standbyWattage: 0 },
      { name: 'Den LED phong tam', type: 'lighting', wattage: 15, dailyUsageHours: 2, standbyWattage: 0 },
      { name: 'Quat hut am', type: 'other', wattage: 30, dailyUsageHours: 1, standbyWattage: 0 },
    ],
  },
  {
    name: 'Van phong',
    type: 'office',
    size: 'small',
    appliances: [
      { name: 'Laptop Dell XPS', type: 'office', wattage: 65, dailyUsageHours: 8, standbyWattage: 3 },
      { name: 'Man hinh LG 27 inch', type: 'office', wattage: 40, dailyUsageHours: 8, standbyWattage: 2 },
      { name: 'Den ban LED', type: 'lighting', wattage: 12, dailyUsageHours: 6, standbyWattage: 0 },
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
      const monthlyKwh = calculateApplianceMonthlyKwhForRoom(
        appliance.wattage,
        appliance.dailyUsageHours,
        room.size,
        appliance.type
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
      total += calculateApplianceMonthlyKwhForRoom(
        appliance.wattage,
        appliance.dailyUsageHours,
        room.size,
        appliance.type
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
