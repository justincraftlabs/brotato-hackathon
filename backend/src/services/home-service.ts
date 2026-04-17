import { v4 as uuidv4 } from 'uuid';
import { HomeModel } from '../models/home.model';
import { RoomModel } from '../models/room.model';
import { ApplianceModel } from '../models/appliance.model';
import { Home, Room, Appliance, RoomType, RoomSize } from '../types/home';
import {
  calculateApplianceMonthlyKwh,
  calculateMonthlyCost,
} from './evn-pricing-service';
import { parseUsageHabits, UsageHabitInput } from './ai-service';

const ZERO_KWH = 0;
const ZERO_COST = 0;

interface RoomInput {
  name: string;
  type: RoomType;
  size: RoomSize;
}

interface ApplianceInput {
  name: string;
  type: string;
  wattage: number;
  dailyUsageHours: number;
  standbyWattage?: number;
  usageHabit?: string;
}

function buildRoomWithAppliances(
  roomDoc: { roomId: string; homeId: string; name: string; type: RoomType; size: RoomSize },
  appliances: Appliance[]
): Room {
  return {
    roomId: roomDoc.roomId,
    homeId: roomDoc.homeId,
    name: roomDoc.name,
    type: roomDoc.type,
    size: roomDoc.size,
    appliances,
  };
}

export async function createHome(rooms: RoomInput[]): Promise<Home> {
  const homeId = uuidv4();

  const homeDoc = await HomeModel.create({ homeId });

  const roomDocs = await RoomModel.insertMany(
    rooms.map((room) => ({
      roomId: uuidv4(),
      homeId,
      name: room.name,
      type: room.type,
      size: room.size,
    }))
  );

  const assembledRooms: Room[] = roomDocs.map((doc) =>
    buildRoomWithAppliances(
      {
        roomId: doc.roomId,
        homeId: doc.homeId,
        name: doc.name,
        type: doc.type,
        size: doc.size,
      },
      []
    )
  );

  return {
    homeId,
    rooms: assembledRooms,
    createdAt: homeDoc.createdAt,
    updatedAt: homeDoc.updatedAt,
  };
}

export async function addAppliances(
  homeId: string,
  roomId: string,
  appliances: ApplianceInput[]
): Promise<Appliance[]> {
  const home = await HomeModel.findOne({ homeId }).lean();
  if (!home) {
    throw new HomeNotFoundError(homeId);
  }

  const room = await RoomModel.findOne({ roomId, homeId }).lean();
  if (!room) {
    throw new RoomNotFoundError(roomId);
  }

  const existingAppliances = await ApplianceModel.find({ homeId }).lean();
  const existingTotalKwh = existingAppliances.reduce(
    (sum, a) => sum + a.monthlyKwh,
    ZERO_KWH
  );

  const habitInputs: UsageHabitInput[] = appliances.map((input, index) => ({
    index,
    name: input.name,
    wattage: input.wattage,
    usageHabit: input.usageHabit ?? '',
    currentDailyHours: input.dailyUsageHours,
  }));
  const effectiveHours = await parseUsageHabits(habitInputs);

  const newApplianceDocs = appliances.map((input, index) => {
    const dailyUsageHours = effectiveHours[index] ?? input.dailyUsageHours;
    const monthlyKwh = calculateApplianceMonthlyKwh(input.wattage, dailyUsageHours);

    return {
      applianceId: uuidv4(),
      roomId,
      homeId,
      name: input.name,
      type: input.type,
      wattage: input.wattage,
      dailyUsageHours,
      standbyWattage: input.standbyWattage ?? 0,
      usageHabit: input.usageHabit ?? '',
      monthlyKwh,
      monthlyCost: ZERO_COST,
    };
  });

  const newTotalKwh = newApplianceDocs.reduce(
    (sum, a) => sum + a.monthlyKwh,
    ZERO_KWH
  );
  const householdTotalKwh = existingTotalKwh + newTotalKwh;
  const householdTotalCost = calculateMonthlyCost(householdTotalKwh);

  const appliancesWithCost = newApplianceDocs.map((doc) => ({
    ...doc,
    monthlyCost:
      householdTotalKwh > ZERO_KWH
        ? Math.round((doc.monthlyKwh / householdTotalKwh) * householdTotalCost)
        : ZERO_COST,
  }));

  const created = await ApplianceModel.insertMany(appliancesWithCost);

  // Recalculate monthlyCost for existing appliances so proportional share stays accurate
  if (existingAppliances.length > ZERO_KWH && householdTotalKwh > ZERO_KWH) {
    const bulkOps = existingAppliances.map((a) => ({
      updateOne: {
        filter: { applianceId: a.applianceId, homeId },
        update: {
          $set: {
            monthlyCost: Math.round((a.monthlyKwh / householdTotalKwh) * householdTotalCost),
          },
        },
      },
    }));
    await ApplianceModel.bulkWrite(bulkOps);
  }

  return created.map((doc) => ({
    applianceId: doc.applianceId,
    roomId: doc.roomId,
    homeId: doc.homeId,
    name: doc.name,
    type: doc.type,
    wattage: doc.wattage,
    dailyUsageHours: doc.dailyUsageHours,
    standbyWattage: doc.standbyWattage,
    usageHabit: doc.usageHabit,
    monthlyKwh: doc.monthlyKwh,
    monthlyCost: doc.monthlyCost,
  }));
}

export async function getHome(homeId: string): Promise<Home | null> {
  const homeDoc = await HomeModel.findOne({ homeId }).lean();
  if (!homeDoc) {
    return null;
  }

  const roomDocs = await RoomModel.find({ homeId }).lean();
  const applianceDocs = await ApplianceModel.find({ homeId }).lean();

  const appliancesByRoom = new Map<string, Appliance[]>();
  for (const doc of applianceDocs) {
    const roomAppliances = appliancesByRoom.get(doc.roomId) ?? [];
    roomAppliances.push({
      applianceId: doc.applianceId,
      roomId: doc.roomId,
      homeId: doc.homeId,
      name: doc.name,
      type: doc.type,
      wattage: doc.wattage,
      dailyUsageHours: doc.dailyUsageHours,
      standbyWattage: doc.standbyWattage,
      usageHabit: doc.usageHabit,
      monthlyKwh: doc.monthlyKwh,
      monthlyCost: doc.monthlyCost,
    });
    appliancesByRoom.set(doc.roomId, roomAppliances);
  }

  const rooms: Room[] = roomDocs.map((doc) =>
    buildRoomWithAppliances(
      {
        roomId: doc.roomId,
        homeId: doc.homeId,
        name: doc.name,
        type: doc.type,
        size: doc.size,
      },
      appliancesByRoom.get(doc.roomId) ?? []
    )
  );

  return {
    homeId: homeDoc.homeId,
    rooms,
    createdAt: homeDoc.createdAt,
    updatedAt: homeDoc.updatedAt,
  };
}

export async function updateAppliance(
  homeId: string,
  applianceId: string,
  updates: Partial<ApplianceInput>
): Promise<Appliance> {
  const existing = await ApplianceModel.findOne({ applianceId, homeId }).lean();
  if (!existing) {
    throw new ApplianceNotFoundError(applianceId);
  }

  const newWattage = updates.wattage ?? existing.wattage;
  const newUsageHabit = updates.usageHabit ?? existing.usageHabit ?? '';
  const sliderDailyHours = updates.dailyUsageHours ?? existing.dailyUsageHours;

  const habitIsUpdated =
    updates.usageHabit !== undefined &&
    updates.usageHabit.trim().length > 0 &&
    updates.usageHabit.trim() !== (existing.usageHabit ?? '').trim();
  let newDailyUsageHours = sliderDailyHours;

  if (habitIsUpdated) {
    const [parsed] = await parseUsageHabits([{
      index: 0,
      name: existing.name,
      wattage: newWattage,
      usageHabit: newUsageHabit,
      currentDailyHours: sliderDailyHours,
    }]);
    newDailyUsageHours = parsed ?? sliderDailyHours;
  }

  const monthlyKwh = calculateApplianceMonthlyKwh(newWattage, newDailyUsageHours);

  const otherAppliances = await ApplianceModel.find({
    homeId,
    applianceId: { $ne: applianceId },
  }).lean();

  const otherTotalKwh = otherAppliances.reduce((sum, a) => sum + a.monthlyKwh, ZERO_KWH);
  const householdTotalKwh = otherTotalKwh + monthlyKwh;
  const householdTotalCost = calculateMonthlyCost(householdTotalKwh);

  const monthlyCost =
    householdTotalKwh > ZERO_KWH
      ? Math.round((monthlyKwh / householdTotalKwh) * householdTotalCost)
      : ZERO_COST;

  const updated = await ApplianceModel.findOneAndUpdate(
    { applianceId, homeId },
    { ...updates, dailyUsageHours: newDailyUsageHours, monthlyKwh, monthlyCost },
    { new: true }
  ).lean();

  if (!updated) {
    throw new ApplianceNotFoundError(applianceId);
  }

  // Recalculate monthlyCost for all other appliances so proportional share stays accurate
  if (otherAppliances.length > ZERO_KWH) {
    const bulkOps = otherAppliances.map((a) => ({
      updateOne: {
        filter: { applianceId: a.applianceId, homeId },
        update: {
          $set: {
            monthlyCost:
              householdTotalKwh > ZERO_KWH
                ? Math.round((a.monthlyKwh / householdTotalKwh) * householdTotalCost)
                : ZERO_COST,
          },
        },
      },
    }));
    await ApplianceModel.bulkWrite(bulkOps);
  }

  return {
    applianceId: updated.applianceId,
    roomId: updated.roomId,
    homeId: updated.homeId,
    name: updated.name,
    type: updated.type,
    wattage: updated.wattage,
    dailyUsageHours: updated.dailyUsageHours,
    standbyWattage: updated.standbyWattage,
    usageHabit: updated.usageHabit,
    monthlyKwh: updated.monthlyKwh,
    monthlyCost: updated.monthlyCost,
  };
}

export async function deleteAppliance(
  homeId: string,
  applianceId: string
): Promise<void> {
  const existing = await ApplianceModel.findOne({ applianceId, homeId }).lean();
  if (!existing) {
    throw new ApplianceNotFoundError(applianceId);
  }

  await ApplianceModel.deleteOne({ applianceId, homeId });

  const remainingAppliances = await ApplianceModel.find({ homeId }).lean();

  const totalKwh = remainingAppliances.reduce(
    (sum, a) => sum + a.monthlyKwh,
    ZERO_KWH
  );

  if (totalKwh <= ZERO_KWH) {
    return;
  }

  const totalCost = calculateMonthlyCost(totalKwh);

  for (const appliance of remainingAppliances) {
    const newCost = Math.round(
      (appliance.monthlyKwh / totalKwh) * totalCost
    );
    await ApplianceModel.updateOne(
      { applianceId: appliance.applianceId },
      { monthlyCost: newCost }
    );
  }
}

export async function addRoom(
  homeId: string,
  room: RoomInput
): Promise<Room> {
  const home = await HomeModel.findOne({ homeId }).lean();
  if (!home) {
    throw new HomeNotFoundError(homeId);
  }

  const roomDoc = await RoomModel.create({
    roomId: uuidv4(),
    homeId,
    name: room.name,
    type: room.type,
    size: room.size,
  });

  return buildRoomWithAppliances(
    {
      roomId: roomDoc.roomId,
      homeId: roomDoc.homeId,
      name: roomDoc.name,
      type: roomDoc.type,
      size: roomDoc.size,
    },
    []
  );
}

export async function updateRoom(
  homeId: string,
  roomId: string,
  updates: Partial<RoomInput>
): Promise<Room> {
  const updated = await RoomModel.findOneAndUpdate(
    { roomId, homeId },
    updates,
    { new: true }
  ).lean();

  if (!updated) {
    throw new RoomNotFoundError(roomId);
  }

  const appliances = await ApplianceModel.find({ roomId, homeId }).lean();

  return buildRoomWithAppliances(
    {
      roomId: updated.roomId,
      homeId: updated.homeId,
      name: updated.name,
      type: updated.type,
      size: updated.size,
    },
    appliances.map((doc) => ({
      applianceId: doc.applianceId,
      roomId: doc.roomId,
      homeId: doc.homeId,
      name: doc.name,
      type: doc.type,
      wattage: doc.wattage,
      dailyUsageHours: doc.dailyUsageHours,
      standbyWattage: doc.standbyWattage,
      usageHabit: doc.usageHabit,
      monthlyKwh: doc.monthlyKwh,
      monthlyCost: doc.monthlyCost,
    }))
  );
}

export async function deleteRoom(
  homeId: string,
  roomId: string
): Promise<void> {
  const room = await RoomModel.findOne({ roomId, homeId }).lean();
  if (!room) {
    throw new RoomNotFoundError(roomId);
  }

  await ApplianceModel.deleteMany({ roomId, homeId });
  await RoomModel.deleteOne({ roomId, homeId });

  const remainingAppliances = await ApplianceModel.find({ homeId }).lean();
  const totalKwh = remainingAppliances.reduce(
    (sum, a) => sum + a.monthlyKwh,
    ZERO_KWH
  );

  if (totalKwh <= ZERO_KWH) {
    return;
  }

  const totalCost = calculateMonthlyCost(totalKwh);

  for (const appliance of remainingAppliances) {
    const newCost = Math.round(
      (appliance.monthlyKwh / totalKwh) * totalCost
    );
    await ApplianceModel.updateOne(
      { applianceId: appliance.applianceId },
      { monthlyCost: newCost }
    );
  }
}

export class HomeNotFoundError extends Error {
  constructor(homeId: string) {
    super(`Home not found: ${homeId}`);
    this.name = 'HomeNotFoundError';
  }
}

export class RoomNotFoundError extends Error {
  constructor(roomId: string) {
    super(`Room not found: ${roomId}`);
    this.name = 'RoomNotFoundError';
  }
}

export class ApplianceNotFoundError extends Error {
  constructor(applianceId: string) {
    super(`Appliance not found: ${applianceId}`);
    this.name = 'ApplianceNotFoundError';
  }
}
