import type { RoomType } from "./types";
import type { Language } from "./translations";

export const ROOM_STEP_INDEX = 0;
export const APPLIANCE_STEP_INDEX = 1;
export const REVIEW_STEP_INDEX = 2;
export const TOTAL_STEPS = 3;

export const SLIDER_MIN = 0;
export const SLIDER_MAX = 24;
export const SLIDER_STEP = 0.5;
export const DEFAULT_STANDBY_WATTAGE = 0;
export const DEFAULT_DAILY_HOURS = 4;

export type ApplianceType =
  | "cooling"
  | "heating"
  | "lighting"
  | "kitchen"
  | "entertainment"
  | "office"
  | "laundry"
  | "other";

export interface AppliancePreset {
  name: Record<Language, string>;
  type: ApplianceType;
  wattage: number;
  dailyHours: number;
}

export const APPLIANCE_PRESETS: AppliancePreset[] = [
  { name: { vi: "Điều hòa", en: "Air conditioner" }, type: "cooling", wattage: 1500, dailyHours: 8 },
  { name: { vi: "Tủ lạnh", en: "Refrigerator" }, type: "kitchen", wattage: 150, dailyHours: 24 },
  { name: { vi: "Máy giặt", en: "Washing machine" }, type: "laundry", wattage: 500, dailyHours: 1 },
  { name: { vi: "Quạt", en: "Fan" }, type: "cooling", wattage: 60, dailyHours: 8 },
  { name: { vi: "Đèn LED", en: "LED light" }, type: "lighting", wattage: 10, dailyHours: 6 },
  { name: { vi: "Tivi", en: "TV" }, type: "entertainment", wattage: 120, dailyHours: 4 },
  { name: { vi: "Nồi cơm", en: "Rice cooker" }, type: "kitchen", wattage: 700, dailyHours: 1 },
  { name: { vi: "Bình nóng lạnh", en: "Water heater" }, type: "heating", wattage: 2500, dailyHours: 0.5 },
];

export const ROOM_TYPE_ICONS: Record<RoomType, string> = {
  bedroom: "Bed",
  living_room: "Sofa",
  kitchen: "CookingPot",
  bathroom: "Bath",
  office: "Monitor",
  other: "MoreHorizontal",
};

export const DASHBOARD_ROUTE = "/dashboard";
