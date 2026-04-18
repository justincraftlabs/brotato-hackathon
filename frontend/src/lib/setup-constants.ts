import type { RoomType } from "./types";
import type { Language } from "./translations";

export const STEP_ROOM_LABEL = "Phòng";
export const STEP_APPLIANCE_LABEL = "Thiết bị";
export const STEP_CONFIRM_LABEL = "Xác nhận";

export const STEP_LABELS = [
  STEP_ROOM_LABEL,
  STEP_APPLIANCE_LABEL,
  STEP_CONFIRM_LABEL,
] as const;

export const BUTTON_NEXT = "Tiếp theo";
export const BUTTON_BACK = "Quay lại";
export const BUTTON_CONFIRM = "Xác nhận";
export const BUTTON_ADD_APPLIANCE = "Thêm thiết bị";
export const BUTTON_EDIT_APPLIANCE = "Sửa thiết bị";
export const BUTTON_CANCEL = "Hủy";
export const BUTTON_SAVE = "Lưu";

export const LABEL_NAME = "Tên";
export const LABEL_TYPE = "Loại";
export const LABEL_WATTAGE = "Công suất (W)";
export const LABEL_DAILY_HOURS = "Thời gian sử dụng/ngày";
export const LABEL_STANDBY_WATTAGE = "Công suất chế độ chờ (W)";
export const LABEL_USAGE_HABIT = "Thói quen sử dụng";
export const LABEL_HOURS_SUFFIX = "giờ/ngày";
export const LABEL_MONTHLY_KWH = "kWh/tháng";
export const LABEL_MONTHLY_COST = "Chi phí/tháng";
export const LABEL_TOTAL = "Tổng cộng";
export const LABEL_CO2 = "CO₂ phát thải";
export const LABEL_KG_SUFFIX = "kg/tháng";
export const LABEL_ROOM_COUNT = "phòng";
export const LABEL_APPLIANCE_COUNT = "thiết bị";
export const LABEL_SELECT_ROOMS = "Chọn các phòng trong nhà bạn";
export const LABEL_SETUP_TITLE = "Thiết lập nhà của bạn";
export const LABEL_AI_SUGGESTION_PREFIX = "AI gợi ý:";
export const LABEL_QUICK_ADD = "Thêm nhanh";
export const LABEL_REVIEW_TITLE = "Xem lại thông tin";
export const LABEL_SUBMITTING = "Đang thiết lập...";
export const LABEL_NO_APPLIANCE_WARNING = "Mỗi phòng cần ít nhất 1 thiết bị";

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

export const APPLIANCE_TYPE_LABELS: Record<ApplianceType, string> = {
  cooling: "Làm mát",
  heating: "Làm nóng",
  lighting: "Chiếu sáng",
  kitchen: "Nhà bếp",
  entertainment: "Giải trí",
  office: "Văn phòng",
  laundry: "Giặt là",
  other: "Khác",
};

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
