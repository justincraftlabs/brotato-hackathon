export const ROOM_TYPES = [
  'living_room',
  'bedroom',
  'kitchen',
  'bathroom',
  'office',
  'dining_room',
  'garage',
  'laundry',
  'other',
] as const;

export const ROOM_SIZES = ['small', 'medium', 'large'] as const;

export type RoomType = (typeof ROOM_TYPES)[number];
export type RoomSize = (typeof ROOM_SIZES)[number];

export interface Appliance {
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
  imageUrl?: string;
  recognitionConfidence?: number;
}

export interface Room {
  roomId: string;
  homeId: string;
  name: string;
  type: RoomType;
  size: RoomSize;
  appliances: Appliance[];
}

export interface Home {
  homeId: string;
  rooms: Room[];
  createdAt: Date;
  updatedAt: Date;
}
