export const SIMULATOR_LABELS = {
  PAGE_TITLE: "Mô phỏng tiết kiệm",
  EMPTY_STATE_TITLE: "Chưa có dữ liệu",
  EMPTY_STATE_MESSAGE: "Hãy thiết lập nhà trước",
  EMPTY_STATE_CTA: "Thiết lập ngay",
  ERROR_TITLE: "Không thể tải dữ liệu",
  RETRY: "Thử lại",
  LOADING: "Đang tải dữ liệu...",
  KWH_SAVED: "kWh tiết kiệm",
  VND_SAVED: "Tiền tiết kiệm",
  CO2_SAVED: "CO\u2082 giảm",
  TREE_EQUIVALENT_SUFFIX: "cây/năm",
  CURRENT_LABEL: "Hiện tại",
  ADJUSTED_LABEL: "Sau điều chỉnh",
  MONTHLY_COST: "Chi phí/tháng",
  MONTHLY_CO2: "CO\u2082/tháng",
  RESET_BUTTON: "Đặt lại",
  DAILY_HOURS_LABEL: "Giờ sử dụng/ngày",
  TEMPERATURE_LABEL: "Nhiệt độ",
  HOURS_SUFFIX: "giờ",
  CELSIUS_SUFFIX: "\u00B0C",
  PER_MONTH_SUFFIX: "/tháng",
} as const;

export const SIMULATOR_SLIDER = {
  HOURS_MIN: 0,
  HOURS_MAX: 24,
  HOURS_STEP: 0.5,
  TEMP_MIN: 16,
  TEMP_MAX: 30,
  TEMP_STEP: 1,
} as const;

export const DEBOUNCE_DELAY_MS = 300;

export const COOLING_TYPE = "cooling";
export const HEATING_TYPE = "heating";

export const TEMPERATURE_ADJUSTABLE_TYPES = [COOLING_TYPE, HEATING_TYPE] as const;

export const DAYS_PER_MONTH = 30;
export const WATTS_TO_KW = 1000;

// Temperature adjustment physics constants
// Cooling: energy ∝ (T_ambient - T_set) / (T_ambient - T_baseline)
export const COOLING_AMBIENT_TEMP = 35;
export const COOLING_BASELINE_TEMP = 25;
export const DEFAULT_COOLING_TEMP = 25;

// Heating: energy ∝ (T_set - T_ambient) / (T_baseline - T_ambient)
export const HEATING_AMBIENT_TEMP = 25;
export const HEATING_BASELINE_TEMP = 45;
export const DEFAULT_HEATING_TEMP = 45;

export const TEMP_FACTOR_MIN = 0;
export const TEMP_FACTOR_MAX = 2;

export const COOLING_TEMP_SLIDER = { MIN: 16, MAX: 30, STEP: 1 } as const;
export const HEATING_TEMP_SLIDER = { MIN: 30, MAX: 60, STEP: 1 } as const;
