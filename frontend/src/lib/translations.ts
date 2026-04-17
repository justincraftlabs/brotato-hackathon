import type { RoomSize, RoomType } from "./types";
import type { ApplianceType } from "./setup-constants";

export type Language = "vi" | "en";

export const TRANSLATIONS = {
  // Step labels
  STEP_ROOM_LABEL: { vi: "Phòng", en: "Rooms" },
  STEP_APPLIANCE_LABEL: { vi: "Thiết bị", en: "Appliances" },
  STEP_CONFIRM_LABEL: { vi: "Xác nhận", en: "Confirm" },

  // Buttons
  BUTTON_NEXT: { vi: "Tiếp theo", en: "Next" },
  BUTTON_BACK: { vi: "Quay lại", en: "Back" },
  BUTTON_CONFIRM: { vi: "Xác nhận", en: "Confirm" },
  BUTTON_ADD_APPLIANCE: { vi: "Thêm thiết bị", en: "Add appliance" },
  BUTTON_EDIT_APPLIANCE: { vi: "Sửa thiết bị", en: "Edit appliance" },
  BUTTON_CANCEL: { vi: "Hủy", en: "Cancel" },
  BUTTON_SAVE: { vi: "Lưu", en: "Save" },

  // Form labels
  LABEL_NAME: { vi: "Tên", en: "Name" },
  LABEL_TYPE: { vi: "Loại", en: "Type" },
  LABEL_WATTAGE: { vi: "Công suất (W)", en: "Wattage (W)" },
  LABEL_DAILY_HOURS: { vi: "Thời gian sử dụng/ngày", en: "Daily usage hours" },
  LABEL_STANDBY_WATTAGE: {
    vi: "Công suất chế độ chờ (W)",
    en: "Standby wattage (W)",
  },
  LABEL_USAGE_HABIT: { vi: "Thói quen sử dụng", en: "Usage habit" },
  LABEL_HOURS_SUFFIX: { vi: "giờ/ngày", en: "h/day" },
  LABEL_MONTHLY_KWH: { vi: "kWh/tháng", en: "kWh/month" },
  LABEL_MONTHLY_COST: { vi: "Chi phí/tháng", en: "Cost/month" },
  LABEL_TOTAL: { vi: "Tổng cộng", en: "Total" },
  LABEL_CO2: { vi: "CO₂ phát thải", en: "CO₂ emissions" },
  LABEL_KG_SUFFIX: { vi: "kg/tháng", en: "kg/month" },
  LABEL_ROOM_COUNT: { vi: "phòng", en: "rooms" },
  LABEL_APPLIANCE_COUNT: { vi: "thiết bị", en: "appliances" },
  LABEL_SELECT_ROOMS: {
    vi: "Chọn các phòng trong nhà bạn",
    en: "Select rooms in your home",
  },
  LABEL_SETUP_TITLE: { vi: "Thiết lập nhà của bạn", en: "Set up your home" },
  LABEL_AI_SUGGESTION_PREFIX: { vi: "AI gợi ý:", en: "AI suggestion:" },
  LABEL_QUICK_ADD: { vi: "Thêm nhanh", en: "Quick add" },
  LABEL_REVIEW_TITLE: { vi: "Xem lại thông tin", en: "Review information" },
  LABEL_SUBMITTING: { vi: "Đang thiết lập...", en: "Setting up..." },
  LABEL_NO_APPLIANCE_WARNING: {
    vi: "Mỗi phòng cần ít nhất 1 thiết bị",
    en: "Each room needs at least 1 appliance",
  },

  // Navigation
  NAV_OVERVIEW: { vi: "Tổng quan", en: "Overview" },
  NAV_CHAT: { vi: "Khoai Tây", en: "Potato" },
  NAV_SIMULATOR: { vi: "Mô phỏng", en: "Simulate" },
  NAV_SETUP: { vi: "Thiết lập", en: "Setup" },

  // App
  APP_DESCRIPTION_VI: {
    vi: "Ứng dụng phân tích và tối ưu hóa năng lượng cho gia đình Việt Nam. Giảm hóa đơn điện, bảo vệ môi trường.",
    en: "Energy analysis and optimization app for Vietnamese families. Reduce electricity bills, protect the environment.",
  },
  CTA_GET_STARTED: { vi: "Bắt đầu", en: "Get Started" },
  CTA_BACK_TO_DASHBOARD: {
    vi: "Quay lại Dashboard",
    en: "Back to Dashboard",
  },

  // Dashboard
  DASHBOARD_EMPTY_STATE_TITLE: { vi: "Chưa có dữ liệu", en: "No data yet" },
  DASHBOARD_EMPTY_STATE_MESSAGE: {
    vi: "Hãy thiết lập nhà trước",
    en: "Please set up your home first",
  },
  DASHBOARD_EMPTY_STATE_CTA: { vi: "Thiết lập ngay", en: "Set up now" },
  DASHBOARD_ERROR_TITLE: {
    vi: "Không thể tải dữ liệu",
    en: "Failed to load data",
  },
  DASHBOARD_RETRY: { vi: "Thử lại", en: "Retry" },
  DASHBOARD_TOTAL_KWH: { vi: "Tổng kWh", en: "Total kWh" },
  DASHBOARD_TOTAL_COST: { vi: "Chi phí", en: "Cost" },
  DASHBOARD_TOTAL_CO2: { vi: "CO₂", en: "CO₂" },
  DASHBOARD_EVN_TIER_PREFIX: { vi: "Bậc", en: "Tier" },
  DASHBOARD_EVN_TIER_MAX: { vi: "Bậc cao nhất", en: "Highest tier" },
  DASHBOARD_TOP_CONSUMERS_TITLE: {
    vi: "Thiết bị tiêu thụ nhiều",
    en: "Top consumers",
  },
  DASHBOARD_CO2_TREE_TITLE: {
    vi: "Lượng CO₂ thải ra",
    en: "CO₂ emissions",
  },
  DASHBOARD_CTA_VIEW_SUGGESTIONS: {
    vi: "Xem gợi ý tiết kiệm",
    en: "View saving tips",
  },
  DASHBOARD_CTA_SIMULATE: { vi: "Mô phỏng tiết kiệm", en: "Simulate savings" },
  DASHBOARD_ANOMALY_TITLE: {
    vi: "Cảnh báo bất thường",
    en: "Anomaly alert",
  },
  DASHBOARD_THIS_MONTH: { vi: "tháng này", en: "this month" },

  // Chat
  CHAT_EMPTY_STATE_TITLE: { vi: "Chưa có dữ liệu", en: "No data yet" },
  CHAT_EMPTY_STATE_MESSAGE: {
    vi: "Hãy thiết lập nhà trước",
    en: "Please set up your home first",
  },
  CHAT_EMPTY_STATE_CTA: { vi: "Thiết lập ngay", en: "Set up now" },
  CHAT_WELCOME_MESSAGE: {
    vi: "Chào bạn! Mình là Trợ Lý Khoai Tây 🥔 Bạn muốn hỏi gì về tiền điện nhà mình?",
    en: "Hello! I'm Potato Assistant 🥔 What would you like to ask about your home's electricity?",
  },
  CHAT_INPUT_PLACEHOLDER: { vi: "Hỏi Khoai Tây...", en: "Ask Potato..." },
  CHAT_RECOMMENDATIONS_TITLE: {
    vi: "Gợi ý tiết kiệm",
    en: "Saving tips",
  },
  CHAT_SAVINGS_LABEL: { vi: "Tiết kiệm", en: "Savings" },
  CHAT_ERROR_MESSAGE: {
    vi: "Có lỗi xảy ra, vui lòng thử lại.",
    en: "An error occurred, please try again.",
  },

  // Image recognition
  IMAGE_CAMERA_BUTTON: { vi: "Chụp ảnh thiết bị", en: "Take appliance photo" },
  IMAGE_PROCESSING: { vi: "Đang nhận dạng...", en: "Recognizing..." },
  IMAGE_USE_RESULT: { vi: "Sử dụng", en: "Use" },
  IMAGE_RETRY: { vi: "Thử lại", en: "Retry" },
  IMAGE_CONFIDENCE_HIGH: { vi: "Độ tin cậy cao", en: "High confidence" },
  IMAGE_CONFIDENCE_MEDIUM: {
    vi: "Độ tin cậy trung bình",
    en: "Medium confidence",
  },
  IMAGE_CONFIDENCE_LOW: { vi: "Độ tin cậy thấp", en: "Low confidence" },
  IMAGE_FILE_TOO_LARGE: {
    vi: "Ảnh quá lớn, tối đa 5MB",
    en: "Image too large, max 5MB",
  },
  IMAGE_ERROR_PROCESSING: {
    vi: "Không thể nhận dạng thiết bị",
    en: "Cannot recognize appliance",
  },
  IMAGE_BRAND_LABEL: { vi: "Hãng", en: "Brand" },
  IMAGE_MODEL_LABEL: { vi: "Mẫu", en: "Model" },
} as const;

type FlatTranslation = {
  [K in keyof typeof TRANSLATIONS]: (typeof TRANSLATIONS)[K] extends {
    vi: string;
    en: string;
  }
    ? string
    : never;
};

const ROOM_TYPE_LABELS_TRANSLATIONS: Record<
  RoomType,
  Record<Language, string>
> = {
  bedroom: { vi: "Phòng ngủ", en: "Bedroom" },
  living_room: { vi: "Phòng khách", en: "Living room" },
  kitchen: { vi: "Bếp", en: "Kitchen" },
  bathroom: { vi: "Phòng tắm", en: "Bathroom" },
  office: { vi: "Văn phòng", en: "Office" },
  other: { vi: "Khác", en: "Other" },
};

const ROOM_SIZE_LABELS_TRANSLATIONS: Record<
  RoomSize,
  Record<Language, string>
> = {
  small: { vi: "Nhỏ (< 15m²)", en: "Small (< 15m²)" },
  medium: { vi: "Vừa (15-25m²)", en: "Medium (15-25m²)" },
  large: { vi: "Lớn (> 25m²)", en: "Large (> 25m²)" },
};

const APPLIANCE_TYPE_LABELS_TRANSLATIONS: Record<
  ApplianceType,
  Record<Language, string>
> = {
  cooling: { vi: "Làm mát", en: "Cooling" },
  heating: { vi: "Làm nóng", en: "Heating" },
  lighting: { vi: "Chiếu sáng", en: "Lighting" },
  kitchen: { vi: "Nhà bếp", en: "Kitchen" },
  entertainment: { vi: "Giải trí", en: "Entertainment" },
  office: { vi: "Văn phòng", en: "Office" },
  laundry: { vi: "Giặt là", en: "Laundry" },
  other: { vi: "Khác", en: "Other" },
};

export interface Translations extends FlatTranslation {
  ROOM_TYPE_LABELS: Record<RoomType, string>;
  ROOM_SIZE_LABELS: Record<RoomSize, string>;
  APPLIANCE_TYPE_LABELS: Record<ApplianceType, string>;
}

export function getT(lang: Language): Translations {
  const flat = Object.fromEntries(
    Object.entries(TRANSLATIONS).map(([key, vals]) => [key, vals[lang]])
  ) as FlatTranslation;

  return {
    ...flat,
    ROOM_TYPE_LABELS: Object.fromEntries(
      Object.entries(ROOM_TYPE_LABELS_TRANSLATIONS).map(([k, v]) => [
        k,
        v[lang],
      ])
    ) as Record<RoomType, string>,
    ROOM_SIZE_LABELS: Object.fromEntries(
      Object.entries(ROOM_SIZE_LABELS_TRANSLATIONS).map(([k, v]) => [
        k,
        v[lang],
      ])
    ) as Record<RoomSize, string>,
    APPLIANCE_TYPE_LABELS: Object.fromEntries(
      Object.entries(APPLIANCE_TYPE_LABELS_TRANSLATIONS).map(([k, v]) => [
        k,
        v[lang],
      ])
    ) as Record<ApplianceType, string>,
  };
}
