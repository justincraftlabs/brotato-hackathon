import type { RoomSize, RoomType } from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const CO2_EMISSION_FACTOR = 0.913;
export const CO2_PER_TREE_PER_YEAR = 20;

export interface EvnTier {
  tier: number;
  minKwh: number;
  maxKwh: number;
  pricePerKwh: number;
}

export const EVN_TIERS: EvnTier[] = [
  { tier: 1, minKwh: 0, maxKwh: 50, pricePerKwh: 1893 },
  { tier: 2, minKwh: 50, maxKwh: 100, pricePerKwh: 1956 },
  { tier: 3, minKwh: 100, maxKwh: 200, pricePerKwh: 2271 },
  { tier: 4, minKwh: 200, maxKwh: 300, pricePerKwh: 2860 },
  { tier: 5, minKwh: 300, maxKwh: 400, pricePerKwh: 3197 },
  { tier: 6, minKwh: 400, maxKwh: Infinity, pricePerKwh: 3302 },
];

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  bedroom: "Phòng ngủ",
  living_room: "Phòng khách",
  kitchen: "Bếp",
  bathroom: "Phòng tắm",
  office: "Văn phòng",
  other: "Khác",
};

export const ROOM_SIZE_LABELS: Record<RoomSize, string> = {
  small: "Nhỏ (< 15m²)",
  medium: "Vừa (15-25m²)",
  large: "Lớn (> 25m²)",
};

export const LOCAL_STORAGE_HOME_ID_KEY = "homeId";

export const NAV_ROUTES = {
  HOME: "/",
  SETUP: "/setup",
  DASHBOARD: "/dashboard",
  CHAT: "/chat",
  SIMULATOR: "/simulator",
} as const;

export const NAV_LABELS = {
  OVERVIEW: "Tổng quan",
  CHAT: "Khoai Tây",
  SIMULATOR: "Mô phỏng",
  SETUP: "Thiết lập",
} as const;

export const APP_TITLE = "E-LUMI-NATE";
export const APP_DESCRIPTION = "Illuminate the waste. Eliminate the bill.";
export const APP_DESCRIPTION_VI =
  "Ứng dụng phân tích và tối ưu hóa năng lượng cho gia đình Việt Nam. Giảm hóa đơn điện, bảo vệ môi trường.";
export const CTA_GET_STARTED = "Bắt đầu";
export const CTA_BACK_TO_DASHBOARD = "Quay lại Dashboard";

export const DASHBOARD_LABELS = {
  EMPTY_STATE_TITLE: "Chưa có dữ liệu",
  EMPTY_STATE_MESSAGE: "Hãy thiết lập nhà trước",
  EMPTY_STATE_CTA: "Thiết lập ngay",
  ERROR_TITLE: "Không thể tải dữ liệu",
  RETRY: "Thử lại",
  TOTAL_KWH: "Tổng kWh",
  TOTAL_COST: "Chi phí",
  TOTAL_CO2: "CO₂",
  EVN_TIER_PREFIX: "Bậc",
  EVN_TIER_PRICE_SUFFIX: "/kWh",
  EVN_TIER_NEXT_WARNING: "Còn {remaining} kWh nữa sẽ lên bậc {nextTier}",
  EVN_TIER_MAX: "Bậc cao nhất",
  TOP_CONSUMERS_TITLE: "Thiết bị tiêu thụ nhiều",
  MONTH_COMPARISON_UP: "{percent} so với trung bình cả nước",
  MONTH_COMPARISON_DOWN: "{percent} so với trung bình cả nước",
  CO2_TREE_TITLE: "Lượng CO₂ thải ra",
  CO2_TREE_EQUIVALENT: "Tương đương {count} cây xanh trưởng thành/năm",
  CO2_TREE_OVERFLOW: "+",
  CTA_VIEW_SUGGESTIONS: "Xem gợi ý tiết kiệm",
  CTA_SIMULATE: "Mô phỏng tiết kiệm",
  ANOMALY_TITLE: "Cảnh báo bất thường",
  THIS_MONTH: "tháng này",
} as const;

export const CHAT_LABELS = {
  EMPTY_STATE_TITLE: "Chưa có dữ liệu",
  EMPTY_STATE_MESSAGE: "Hãy thiết lập nhà trước",
  EMPTY_STATE_CTA: "Thiết lập ngay",
  WELCOME_MESSAGE:
    "Chào bạn! Mình là Trợ Lý Khoai Tây 🥔 Bạn muốn hỏi gì về tiền điện nhà mình?",
  INPUT_PLACEHOLDER: "Hỏi Khoai Tây...",
  RECOMMENDATIONS_TITLE: "Gợi ý tiết kiệm",
  SAVINGS_LABEL: "Tiết kiệm",
  STREAM_DONE_MARKER: "[DONE]",
  STREAM_ERROR_MARKER: "[ERROR]",
  SESSION_HEADER: "X-Session-Id",
  TYPING_INDICATOR: "...",
  POTATO_AVATAR: "🥔",
  ERROR_MESSAGE: "Có lỗi xảy ra, vui lòng thử lại.",
  SEND_BUTTON: "Gửi",
} as const;

export const HIGH_CONSUMER_THRESHOLD_PERCENT = 20;
export const MAX_TREE_ICONS = 10;
export const TOP_CONSUMERS_CHART_HEIGHT = 200;
export const RECOMMENDATION_CARD_HEIGHT = 120;
export const RECOMMENDATION_CARD_WIDTH = 200;
export const CHAT_BUBBLE_MAX_WIDTH_PERCENT = 80;
