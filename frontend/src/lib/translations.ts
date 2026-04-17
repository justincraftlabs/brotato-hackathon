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
  NAV_OVERVIEW: { vi: "Dashboard", en: "Dashboard" },
  NAV_CHAT: { vi: "Trợ lý", en: "Assistant" },
  NAV_SIMULATOR: { vi: "Mô phỏng", en: "Simulate" },
  NAV_SETUP: { vi: "Thiết lập", en: "Setup" },
  NAV_SUGGESTIONS: { vi: "Gợi ý", en: "Tips" },
  NAV_TIPS: { vi: "Gợi ý", en: "Tips" },
  NAV_ASSISTANT: { vi: "Trợ lý", en: "Assistant" },

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
  DASHBOARD_EVN_TIER_PRICE_SUFFIX: { vi: "/kWh", en: "/kWh" },
  DASHBOARD_EVN_TIER_NEXT_WARNING: {
    vi: "Còn {remaining} kWh nữa sẽ lên bậc {nextTier}",
    en: "{remaining} kWh until Tier {nextTier}",
  },
  DASHBOARD_CO2_TREE_EQUIVALENT: {
    vi: "Tương đương {count} cây xanh trưởng thành/năm",
    en: "Equivalent to {count} mature trees/year",
  },
  DASHBOARD_CO2_TREE_OVERFLOW: { vi: "+", en: "+" },
  DASHBOARD_MONTH_COMPARISON_UP: {
    vi: "{percent} so với trung bình cả nước",
    en: "{percent} vs national average",
  },
  DASHBOARD_MONTH_COMPARISON_DOWN: {
    vi: "{percent} so với trung bình cả nước",
    en: "{percent} vs national average",
  },
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
  CHAT_SEND_BUTTON: { vi: "Gửi", en: "Send" },

  // Simulator
  SIMULATOR_PAGE_TITLE: { vi: "Mô phỏng tiết kiệm", en: "Savings Simulator" },
  SIMULATOR_EMPTY_STATE_TITLE: { vi: "Chưa có dữ liệu", en: "No data yet" },
  SIMULATOR_EMPTY_STATE_MESSAGE: {
    vi: "Hãy thiết lập nhà trước",
    en: "Please set up your home first",
  },
  SIMULATOR_EMPTY_STATE_CTA: { vi: "Thiết lập ngay", en: "Set up now" },
  SIMULATOR_ERROR_TITLE: {
    vi: "Không thể tải dữ liệu",
    en: "Failed to load data",
  },
  SIMULATOR_RETRY: { vi: "Thử lại", en: "Retry" },
  SIMULATOR_LOADING: { vi: "Đang tải dữ liệu...", en: "Loading data..." },
  SIMULATOR_KWH_SAVED: { vi: "kWh tiết kiệm", en: "kWh saved" },
  SIMULATOR_VND_SAVED: { vi: "Tiền tiết kiệm", en: "Money saved" },
  SIMULATOR_CO2_SAVED: { vi: "CO\u2082 giảm", en: "CO\u2082 reduced" },
  SIMULATOR_TREE_EQUIVALENT_SUFFIX: { vi: "cây/năm", en: "trees/year" },
  SIMULATOR_CURRENT_LABEL: { vi: "Hiện tại", en: "Current" },
  SIMULATOR_ADJUSTED_LABEL: { vi: "Sau điều chỉnh", en: "After adjustment" },
  SIMULATOR_MONTHLY_COST: { vi: "Chi phí/tháng", en: "Cost/month" },
  SIMULATOR_MONTHLY_CO2: { vi: "CO\u2082/tháng", en: "CO\u2082/month" },
  SIMULATOR_RESET_BUTTON: { vi: "Đặt lại", en: "Reset" },
  SIMULATOR_DAILY_HOURS_LABEL: { vi: "Giờ sử dụng/ngày", en: "Hours/day" },
  SIMULATOR_TEMPERATURE_LABEL: { vi: "Nhiệt độ", en: "Temperature" },
  SIMULATOR_HOURS_SUFFIX: { vi: "giờ", en: "h" },
  SIMULATOR_PER_MONTH_SUFFIX: { vi: "/tháng", en: "/month" },

  // Voice
  VOICE_BUTTON_LABEL: { vi: "Nhận dạng giọng nói", en: "Voice input" },
  VOICE_LISTENING_LABEL: { vi: "Đang nghe...", en: "Listening..." },

  // General labels
  LABEL_DELETE: { vi: "Xóa", en: "Delete" },

  // Setup edit mode
  SETUP_EDIT_TITLE: { vi: "Quản lý thiết bị", en: "Manage Appliances" },
  SETUP_SELECT_ROOM: { vi: "Chọn phòng", en: "Select room" },
  SETUP_BACK_TO_ROOMS: {
    vi: "Quay lại danh sách phòng",
    en: "Back to rooms",
  },
  SETUP_DELETE_CONFIRM: {
    vi: "Xóa thiết bị này?",
    en: "Delete this appliance?",
  },
  SETUP_DELETING: { vi: "Đang xóa...", en: "Deleting..." },
  SETUP_APPLIANCE_COUNT: { vi: "thiết bị", en: "appliances" },
  SETUP_LOADING: { vi: "Đang tải...", en: "Loading..." },
  SETUP_ERROR: {
    vi: "Không thể tải dữ liệu",
    en: "Failed to load data",
  },
  SETUP_RETRY: { vi: "Thử lại", en: "Retry" },

  // Suggestions page
  SUGGESTIONS_PAGE_TITLE: { vi: "Gợi ý tiết kiệm", en: "Savings Tips" },
  SUGGESTIONS_ANALYZE_BUTTON: { vi: "Phân tích lại", en: "Re-analyze" },
  SUGGESTIONS_ANALYZE_FIRST_BUTTON: { vi: "Phân tích ngay", en: "Analyze now" },
  SUGGESTIONS_ANALYZING: { vi: "Đang phân tích...", en: "Analyzing..." },
  SUGGESTIONS_TOTAL_SAVINGS: {
    vi: "Tổng tiết kiệm ước tính/tháng",
    en: "Total estimated savings/month",
  },
  SUGGESTIONS_EMPTY_STATE_TITLE: { vi: "Chưa có gợi ý", en: "No suggestions yet" },
  SUGGESTIONS_EMPTY_STATE_MESSAGE: {
    vi: "Nhấn 'Phân tích ngay' để bắt đầu",
    en: "Click 'Analyze now' to get started",
  },
  SUGGESTIONS_ERROR_TITLE: {
    vi: "Không thể tải gợi ý",
    en: "Failed to load suggestions",
  },
  SUGGESTIONS_RETRY: { vi: "Thử lại", en: "Retry" },
  SUGGESTIONS_NO_HOME_TITLE: { vi: "Chưa có dữ liệu nhà", en: "No home data" },
  SUGGESTIONS_NO_HOME_MESSAGE: {
    vi: "Hãy thiết lập nhà trước",
    en: "Please set up your home first",
  },
  SUGGESTIONS_NO_HOME_CTA: { vi: "Thiết lập ngay", en: "Set up now" },
  SUGGESTIONS_PRIORITY_HIGH: { vi: "Ưu tiên cao", en: "High" },
  SUGGESTIONS_PRIORITY_MEDIUM: { vi: "Ưu tiên vừa", en: "Medium" },
  SUGGESTIONS_PRIORITY_LOW: { vi: "Ưu tiên thấp", en: "Low" },
  SUGGESTIONS_DIFFICULTY_EASY: { vi: "Dễ làm", en: "Easy" },
  SUGGESTIONS_DIFFICULTY_MEDIUM: { vi: "Vừa phải", en: "Moderate" },
  SUGGESTIONS_DIFFICULTY_HARD: { vi: "Khó", en: "Challenging" },
  SUGGESTIONS_SAVINGS_PER_MONTH: { vi: "tiết kiệm/tháng", en: "saved/month" },
  SUGGESTIONS_TIPS_SUFFIX: { vi: "gợi ý", en: "tips" },

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

  // Waste hotspot chart
  CHART_WASTE_TITLE: { vi: "Trọng điểm lãng phí", en: "Waste Hotspots" },
  CHART_WASTE_OTHER: { vi: "Khác", en: "Others" },

  // Savings forecast chart
  CHART_FORECAST_TITLE: { vi: "Dự báo tích lũy", en: "Savings Forecast" },
  CHART_FORECAST_10: { vi: "Tiết kiệm 10%", en: "Save 10%" },
  CHART_FORECAST_20: { vi: "Tiết kiệm 20%", en: "Save 20%" },
  CHART_FORECAST_30: { vi: "Tiết kiệm 30%", en: "Save 30%" },
  CHART_FORECAST_UNIT: { vi: "triệu đ", en: "M₫" },
  CHART_FORECAST_MONTH_SHORT: { vi: "T", en: "M" },
  CHART_FORECAST_YEAR_SHORT: { vi: "N", en: "Y" },
  CHART_FORECAST_5Y_HINT: {
    vi: "Sau 5 năm ở mức 20%:",
    en: "After 5 years at 20%:",
  },

  // Dashboard page
  DASHBOARD_PAGE_TITLE: { vi: "Dashboard", en: "Dashboard" },
  DASHBOARD_PAGE_SUBTITLE: {
    vi: "Quản lý và tối ưu năng lượng cho ngôi nhà của bạn",
    en: "Manage and optimize energy for your home",
  },
  DASHBOARD_SETUP_TITLE: {
    vi: "Thiết lập phòng & thiết bị",
    en: "Set up room & appliances",
  },
  DASHBOARD_SETUP_DESCRIPTION: {
    vi: "Thêm phòng và thiết bị để bắt đầu theo dõi năng lượng tiêu thụ.",
    en: "Add rooms and appliances to start tracking energy consumption.",
  },
  DASHBOARD_SETUP_CTA: { vi: "Bắt đầu thiết lập", en: "Get started" },
  STAT_THIS_MONTH: { vi: "tháng này", en: "this month" },

  // Tips page
  TIPS_PAGE_TITLE: { vi: "Gợi ý & Mô phỏng", en: "Tips & Simulator" },
  TIPS_PAGE_SUBTITLE: {
    vi: "Khám phá cách tiết kiệm năng lượng và mô phỏng chi phí",
    en: "Discover energy saving tips and simulate costs",
  },
  TIPS_TAB_SUGGESTIONS: { vi: "Gợi ý", en: "Suggestions" },
  TIPS_TAB_SIMULATOR: { vi: "Mô phỏng", en: "Simulator" },

  // Carbon waterfall chart
  CHART_CARBON_TITLE: { vi: "Dấu chân Carbon", en: "Carbon Footprint" },
  CHART_CARBON_CURRENT: { vi: "Hiện tại", en: "Current" },
  CHART_CARBON_OFF_PREFIX: { vi: "Tắt", en: "Off" },
  CHART_CARBON_REMAINING: { vi: "Còn lại", en: "Remaining" },
  CHART_CARBON_UNIT: { vi: "kg CO₂/tháng", en: "kg CO₂/mo" },
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
