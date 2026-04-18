import { RoomSize } from '../types/home';

export const ROOM_SIZE_AREA_M2: Record<RoomSize, number> = {
  small: 10,
  medium: 20,
  large: 35,
};

export const BASELINE_ROOM_AREA_M2 = 20;
export const AREA_FACTOR_MIN = 0.5;
export const AREA_FACTOR_MAX = 2.0;

export const AREA_SENSITIVE_APPLIANCE_TYPES: ReadonlySet<string> = new Set([
  'cooling',
  'heating',
]);
