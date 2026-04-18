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
  LABEL_WATTAGE_SHORT: { vi: "Công suất", en: "Wattage" },
  LABEL_HOURS_PER_DAY: { vi: "Giờ/ngày", en: "Hours/day" },
  LABEL_APPLIANCE: { vi: "Thiết bị", en: "Appliance" },
  LABEL_ROOM: { vi: "Phòng", en: "Room" },
  LABEL_ROOM_SIZE: { vi: "Kích thước", en: "Size" },
  LABEL_MONTHLY_ELECTRICITY: { vi: "Điện/tháng", en: "Electricity/mo" },
  LABEL_MONTHLY_CO2: { vi: "CO₂/tháng", en: "CO₂/mo" },
  LABEL_STANDBY_POWER: { vi: "Điện chờ", en: "Standby" },
  LABEL_ROOM_COUNT_TITLE: { vi: "Số phòng", en: "Rooms" },
  LABEL_SUB_CONSUMPTION: { vi: "tiêu thụ", en: "usage" },
  LABEL_SUB_EMISSION: { vi: "phát thải", en: "emissions" },
  LABEL_SUB_STANDBY: { vi: "standby", en: "standby" },
  LABEL_SUB_ROOMS: { vi: "phòng", en: "rooms" },
  PLACEHOLDER_APPLIANCE_NAME: {
    vi: "VD: Điều hòa Daikin",
    en: "e.g. Daikin AC",
  },
  PLACEHOLDER_USAGE_HABIT: {
    vi: "VD: Bật từ 9h tối đến 6h sáng",
    en: "e.g. On from 9 PM to 6 AM",
  },
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
  LABEL_SETUP_SUBTITLE: {
    vi: "Thêm phòng và thiết bị để bắt đầu phân tích năng lượng",
    en: "Add rooms and appliances to start energy analysis",
  },
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
  NAV_SCHEDULES: { vi: "Lịch", en: "Schedules" },
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
  DASHBOARD_EVN_TIER_DIALOG_TITLE: {
    vi: "Biểu giá điện sinh hoạt 2026",
    en: "2026 Residential Electricity Rates",
  },
  DASHBOARD_EVN_TIER_DIALOG_SUBTITLE: {
    vi: "Chưa bao gồm 10% thuế GTGT",
    en: "Excluding 10% VAT",
  },
  DASHBOARD_EVN_TIER_DIALOG_COL_TIER: { vi: "Bậc", en: "Tier" },
  DASHBOARD_EVN_TIER_DIALOG_COL_USAGE: { vi: "Mức sử dụng", en: "Usage range" },
  DASHBOARD_EVN_TIER_DIALOG_COL_PRICE: { vi: "Đơn giá (đ/kWh)", en: "Rate (₫/kWh)" },
  DASHBOARD_EVN_TIER_DIALOG_VAT_NOTE: {
    vi: "* Chưa bao gồm 10% thuế GTGT (VAT). Nguồn: EVN 2026.",
    en: "* Prices exclude 10% VAT. Source: EVN 2026.",
  },
  DASHBOARD_EVN_TIER_DIALOG_CURRENT_BADGE: { vi: "Của bạn", en: "Your tier" },
  DASHBOARD_EVN_TIER_DIALOG_INCREASE: { vi: "Tăng", en: "Increase" },
  DASHBOARD_EVN_TIER_HOVER_PROMPT: {
    vi: "Nhấn vào bậc để xem chi tiết biểu giá",
    en: "Click a tier for full rate details",
  },
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
  CHAT_NEW_CONVERSATION: { vi: "Cuộc trò chuyện mới", en: "New conversation" },
  SUGGESTIONS_TRY_SIMULATOR: { vi: "Thử Simulator →", en: "Try Simulator →" },
  SUGGESTIONS_IOT_SECTION_TITLE: { vi: "Tự động hóa tiết kiệm điện", en: "Automate energy savings" },

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
  SETUP_EDIT_TITLE: { vi: "Quản lý nhà", en: "Manage Home" },
  SETUP_SELECT_ROOM: { vi: "Chọn phòng để quản lý thiết bị", en: "Select room to manage appliances" },
  SETUP_ADD_ROOM: { vi: "Thêm phòng", en: "Add room" },
  SETUP_EDIT_ROOM: { vi: "Sửa phòng", en: "Edit room" },
  SETUP_DELETE_ROOM_CONFIRM: {
    vi: "Xóa phòng này và tất cả thiết bị trong đó?",
    en: "Delete this room and all its appliances?",
  },
  SETUP_DELETING_ROOM: { vi: "Đang xóa phòng...", en: "Deleting room..." },
  SETUP_ROOM_SIZE_LABEL: { vi: "Kích thước", en: "Size" },
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

  // Room energy heatmap
  CHART_HEATMAP_TITLE: { vi: "Bản đồ nhiệt theo phòng", en: "Room Energy Heatmap" },
  CHART_HEATMAP_SUBTITLE: { vi: "Phòng nào đang tiêu thụ nhiều nhất?", en: "Which room consumes the most?" },
  CHART_HEATMAP_INFO_TITLE: { vi: "Bản đồ nhiệt theo phòng", en: "Room Energy Heatmap" },
  CHART_HEATMAP_INFO_SUBTITLE: { vi: "Cách đọc bản đồ nhiệt điện năng", en: "How to read the energy heatmap" },
  CHART_HEATMAP_INFO_SIZE_LABEL: { vi: "Kích thước ô", en: "Cell size" },
  CHART_HEATMAP_INFO_SIZE_DESC: { vi: "Ô càng lớn = tiêu thụ kWh càng nhiều trong tháng", en: "Larger cell = higher monthly kWh consumption" },
  CHART_HEATMAP_INFO_COLOR_LABEL: { vi: "Màu sắc", en: "Color scale" },
  CHART_HEATMAP_INFO_COLOR_DESC: { vi: "Đỏ/cam = tiêu thụ cao nhất → xanh lá = thấp nhất", en: "Red/orange = highest → green = lowest consumption" },
  CHART_HEATMAP_INFO_TIP: { vi: "Hover vào từng ô để xem kWh, chi phí và số thiết bị trong phòng đó.", en: "Hover each cell to see kWh, cost, and appliance count for that room." },
  CHART_HEATMAP_INFO_FOOTER: { vi: "Dữ liệu dựa trên ước tính tiêu thụ hàng tháng của từng thiết bị.", en: "Data based on monthly consumption estimates per appliance." },

  // Monthly bill projection
  CHART_BILL_TITLE: { vi: "Dự báo hóa đơn tháng này", en: "Monthly Bill Forecast" },
  CHART_BILL_PROJECTED_LABEL: { vi: "Dự kiến cuối tháng", en: "Projected end of month" },
  CHART_BILL_DAY_PREFIX: { vi: "Ngày", en: "Day" },
  CHART_BILL_USED_LABEL: { vi: "Đã dùng", en: "Used" },
  CHART_BILL_FORECAST_LABEL: { vi: "Dự báo", en: "Forecast" },
  CHART_BILL_SUMMARY: { vi: "Ngày {today}/{total} · {cost} đã dùng · còn {days} ngày", en: "Day {today}/{total} · {cost} used · {days} days left" },
  CHART_BILL_INFO_TITLE: { vi: "Dự báo hóa đơn tháng này", en: "Monthly Bill Forecast" },
  CHART_BILL_INFO_SUBTITLE: { vi: "Cách tính dự báo chi phí điện", en: "How the bill forecast is calculated" },
  CHART_BILL_INFO_ACTUAL_LABEL: { vi: "Đường xanh — Đã chi", en: "Green line — Actual spend" },
  CHART_BILL_INFO_ACTUAL_DESC: { vi: "Chi phí điện tích lũy từ đầu tháng đến hôm nay", en: "Cumulative electricity cost from the start of the month to today" },
  CHART_BILL_INFO_FORECAST_LABEL: { vi: "Đường cam đứt — Dự báo", en: "Dashed amber — Forecast" },
  CHART_BILL_INFO_FORECAST_DESC: { vi: "Ước tính dựa trên tốc độ tiêu dùng hiện tại nếu không thay đổi thói quen", en: "Estimate based on current daily rate if habits remain unchanged" },
  CHART_BILL_INFO_TIP: { vi: "Giảm sử dụng ngay hôm nay sẽ kéo đường dự báo xuống đáng kể.", en: "Reducing usage today will noticeably lower the forecast line." },
  CHART_BILL_INFO_FOOTER: { vi: "Dự báo giả định tốc độ tiêu thụ đều đặn. Thực tế có thể dao động.", en: "Forecast assumes a constant consumption rate. Actual may vary." },

  // Waste hotspot chart
  CHART_WASTE_TITLE: { vi: "Trọng điểm lãng phí", en: "Waste Hotspots" },
  CHART_WASTE_OTHER: { vi: "Khác", en: "Others" },
  CHART_WASTE_EVN_TIERS_LABEL: { vi: "Điện bậc thang EVN", en: "EVN Tiered Pricing" },

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

  // EVN dong per kWh unit
  CHART_EVN_DONG_PER_KWH: { vi: "đ/kWh", en: "₫/kWh" },

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
  DASHBOARD_PREVIEW_SECTION_LABEL: { vi: "Xem trước dữ liệu năng lượng", en: "Energy data preview" },
  DASHBOARD_PREVIEW_ELECTRICITY: { vi: "Điện (kWh)", en: "Electricity (kWh)" },
  DASHBOARD_PREVIEW_CO2_KG: { vi: "CO₂ (kg)", en: "CO₂ (kg)" },
  DASHBOARD_PREVIEW_ADD_ROOM: { vi: "+ Thêm phòng", en: "+ Add room" },
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

  // TopConsumers info dialog
  CHART_CONSUMERS_INFO_TITLE: { vi: "Thiết bị tiêu thụ nhiều nhất", en: "Top Energy Consumers" },
  CHART_CONSUMERS_INFO_SUBTITLE: { vi: "Top 5 theo kWh tiêu thụ/tháng", en: "Top 5 by monthly kWh" },
  CHART_CONSUMERS_INFO_NORMAL: { vi: "Bình thường", en: "Normal" },
  CHART_CONSUMERS_INFO_NORMAL_DESC: { vi: "≤ 20% tổng tiêu thụ", en: "≤ 20% of total" },
  CHART_CONSUMERS_INFO_HIGH: { vi: "Tiêu thụ cao", en: "High usage" },
  CHART_CONSUMERS_INFO_HIGH_DESC: { vi: "> 20% tổng tiêu thụ", en: "> 20% of total" },
  CHART_CONSUMERS_INFO_TIP: {
    vi: "Điều hòa & máy nước nóng thường chiếm 60–70% hóa đơn điện. Giảm nhiệt độ 1°C → tiết kiệm ~6%.",
    en: "AC & water heaters typically account for 60–70% of your bill. Lower temp by 1°C → save ~6%.",
  },
  CHART_CONSUMERS_INFO_FOOTER: { vi: "Dựa trên thói quen sử dụng đã cấu hình", en: "Based on your configured usage habits" },

  // WasteHotspot info dialog
  CHART_WASTE_INFO_TITLE: { vi: "Chi phí điện theo thiết bị", en: "Electricity Cost by Appliance" },
  CHART_WASTE_INFO_SUBTITLE: { vi: "Phân bổ tỷ lệ chi phí/tháng", en: "Monthly cost breakdown" },
  CHART_WASTE_INFO_CENTER_HINT: { vi: "Số ở giữa = % chi phí của thiết bị đắt nhất", en: "Center % = cost share of the biggest spender" },
  CHART_WASTE_INFO_TIER_NOTE: { vi: "Dùng nhiều điện → bậc cao hơn → giá/kWh đắt hơn", en: "Higher usage → higher tier → more expensive per kWh" },
  CHART_WASTE_INFO_TIER_RANGE: { vi: "Bậc 1: 1.984 đ/kWh → Bậc 6: 3.967 đ/kWh (×2)", en: "Tier 1: ₫1,984/kWh → Tier 6: ₫3,967/kWh (×2)" },
  CHART_WASTE_INFO_FOOTER: { vi: "Giá theo biểu giá EVN 2026, chưa gồm 10% VAT", en: "EVN 2026 rates, excl. 10% VAT" },

  // SavingsForecast info dialog
  CHART_FORECAST_INFO_TITLE: { vi: "Kịch bản tiết kiệm", en: "Savings Scenarios" },
  CHART_FORECAST_INFO_SUBTITLE: { vi: "3 mức độ tối ưu thực tế", en: "3 realistic optimization levels" },
  CHART_FORECAST_INFO_ROW_10_LABEL: { vi: "Tiết kiệm 10%", en: "Save 10%" },
  CHART_FORECAST_INFO_ROW_10_DESC: { vi: "Tắt điện khi ra khỏi phòng, chỉnh điều hòa 25–26°C", en: "Turn off lights when leaving, set AC to 25–26°C" },
  CHART_FORECAST_INFO_ROW_20_LABEL: { vi: "Tiết kiệm 20%", en: "Save 20%" },
  CHART_FORECAST_INFO_ROW_20_DESC: { vi: "Nâng cấp bóng đèn LED, dùng chế độ eco và hẹn giờ", en: "Upgrade to LED lighting, use eco modes and timers" },
  CHART_FORECAST_INFO_ROW_30_LABEL: { vi: "Tiết kiệm 30%", en: "Save 30%" },
  CHART_FORECAST_INFO_ROW_30_DESC: { vi: "Thay điều hòa/tủ lạnh cũ bằng loại tiết kiệm điện 5 sao", en: "Replace old AC/fridge with 5-star energy-efficient models" },
  CHART_FORECAST_INFO_FOOTER: { vi: "Dự báo dựa trên chi phí hiện tại, không tính trượt giá điện", en: "Forecast based on current costs, excluding energy price inflation" },

  // MonthComparison info dialog
  CHART_COMPARISON_INFO_TITLE: { vi: "Trung bình tiêu thụ điện toàn quốc", en: "National Electricity Average" },
  CHART_COMPARISON_INFO_SUBTITLE: { vi: "Mức điện điển hình tại Việt Nam", en: "Typical usage in Vietnam" },
  CHART_COMPARISON_INFO_HH_SMALL: { vi: "Hộ 1–2 người", en: "1–2 person HH" },
  CHART_COMPARISON_INFO_HH_MEDIUM: { vi: "Hộ 3–4 người", en: "3–4 person HH" },
  CHART_COMPARISON_INFO_HH_LARGE: { vi: "Hộ 5+ người", en: "5+ person HH" },
  CHART_COMPARISON_INFO_HH_AVG_LABEL: { vi: "(trung bình quốc gia)", en: "(national avg)" },
  CHART_COMPARISON_INFO_FOOTER: { vi: "Nguồn: EVN & Tổng cục Thống kê Việt Nam 2024", en: "Source: EVN & General Statistics Office Vietnam 2024" },
  CHART_COMPARISON_COLOR_GREEN: { vi: "Xanh = dưới mức trung bình (tốt)", en: "Green = below average (good)" },
  CHART_COMPARISON_COLOR_RED: { vi: "Đỏ = trên mức trung bình", en: "Red = above average" },

  // Co2TreeVisual info dialog
  CHART_CO2_INFO_TITLE: { vi: "Cách tính CO₂ phát thải", en: "CO₂ Emission Calculation" },
  CHART_CO2_INFO_SUBTITLE: { vi: "Từ tiêu thụ điện sinh hoạt tại Việt Nam", en: "From residential electricity in Vietnam" },
  CHART_CO2_INFO_FACTOR_LABEL: { vi: "Hệ số phát thải lưới điện", en: "Grid emission factor" },
  CHART_CO2_INFO_FACTOR_VALUE: { vi: "0.913 kg CO₂/kWh", en: "0.913 kg CO₂/kWh" },
  CHART_CO2_INFO_TREE_LABEL: { vi: "1 cây xanh trưởng thành hấp thụ", en: "1 mature tree absorbs" },
  CHART_CO2_INFO_TREE_VALUE: { vi: "~20 kg CO₂/năm", en: "~20 kg CO₂/year" },
  CHART_CO2_INFO_FORMULA_LABEL: { vi: "Công thức quy đổi", en: "Conversion formula" },
  CHART_CO2_INFO_FORMULA_VALUE: { vi: "kWh × 0.913 ÷ 20 = số cây", en: "kWh × 0.913 ÷ 20 = trees" },
  CHART_CO2_INFO_FOOTER: { vi: "Hệ số phát thải lưới điện VN. Nguồn: Bộ TN&MT 2023", en: "Vietnam grid emission factor. Source: MONRE 2023" },

  // CarbonWaterfall info dialog
  CHART_CARBON_INFO_TITLE: { vi: "Dấu chân Carbon chi tiết", en: "Carbon Footprint Details" },
  CHART_CARBON_INFO_SUBTITLE: { vi: "CO₂ phát thải từ từng thiết bị/tháng", en: "CO₂ emitted per appliance per month" },
  CHART_CARBON_INFO_SCALE_HINT: { vi: "Đỏ → phát thải nhiều nhất · Xanh → ít nhất", en: "Red = highest emitters · Green = lowest" },
  CHART_CARBON_INFO_CONTEXT: { vi: "Hộ gia đình VN thải TB ~150 kg CO₂/tháng từ điện", en: "Avg. Vietnamese household emits ~150 kg CO₂/month" },
  CHART_CARBON_INFO_FOOTER: { vi: "0.913 kg CO₂/kWh — lưới điện Việt Nam. Nguồn: Bộ TN&MT 2023", en: "0.913 kg CO₂/kWh — Vietnam grid. Source: MONRE 2023" },

  // Vampire / standby power
  VAMPIRE_CARD_TITLE: { vi: "Điện năng tiêu thụ vô hình", en: "Vampire Power (Standby)" },
  VAMPIRE_CARD_SUBTITLE: { vi: "Điện bị hút âm thầm khi thiết bị ở chế độ chờ (standby)", en: "Silent drain while devices are in standby" },
  VAMPIRE_TOTAL_KWH: { vi: "Điện chờ/tháng", en: "Standby/month" },
  VAMPIRE_TOTAL_COST: { vi: "Lãng phí/tháng", en: "Wasted/month" },
  VAMPIRE_PERCENT_SUFFIX: { vi: "% tổng điện", en: "% of total" },
  VAMPIRE_TOP_TITLE: { vi: "Thiết bị hút điện ngầm", en: "Top vampire appliances" },
  VAMPIRE_UNPLUG_TIP: { vi: "Rút phích khi không dùng", en: "Unplug when not in use" },
  VAMPIRE_EMPTY: { vi: "Không phát hiện điện tiêu thụ vô hình", en: "No standby drain detected" },
  VAMPIRE_BADGE: { vi: "Vô hình", en: "Standby" },
  VAMPIRE_STANDBY_WATTAGE: { vi: "Chờ", en: "Standby" },

  // Simulator standby
  SIMULATOR_STANDBY_OFF_LABEL: { vi: "Rút phích khi không dùng", en: "Unplug when not in use" },
  SIMULATOR_STANDBY_KWH_LABEL: { vi: "Điện chờ", en: "Standby drain" },
  SIMULATOR_ADJUST_SECTION: { vi: "Điều chỉnh thiết bị", en: "Adjust Appliances" },
  SIMULATOR_COMPARISON_SECTION: { vi: "So sánh kết quả", en: "Comparison" },

  // Vampire info dialog
  VAMPIRE_ACTIVE_LABEL: { vi: "Hoạt động", en: "Active" },
  VAMPIRE_INVISIBLE_LABEL: { vi: "Vô hình", en: "Standby" },
  VAMPIRE_INFO_WHY_TITLE: { vi: "Tại sao quan trọng?", en: "Why does this matter?" },
  VAMPIRE_INFO_STAT_1: { vi: "10% điện năng của hộ gia đình trung bình bị tiêu thụ âm thầm bởi thiết bị ở chế độ chờ.", en: "10% of an average household's electricity is silently consumed by standby devices." },
  VAMPIRE_INFO_STAT_2: { vi: "1 Watt chờ = 9 kWh/năm — một thiết bị nhỏ cũng đang hút điện 24/7.", en: "1 Watt standby = 9 kWh/year — even a small device drains power 24/7." },
  VAMPIRE_INFO_STAT_3: { vi: "Rút phích hoặc dùng ổ điện có công tắc để loại bỏ hoàn toàn điện ma.", en: "Unplug or use a switched power strip to eliminate phantom power completely." },
  VAMPIRE_INFO_SAVE_INLINE: { vi: "— tiết kiệm ngay", en: "— save instantly" },
  VAMPIRE_INFO_PER_MONTH: { vi: "/tháng", en: "/month" },
  VAMPIRE_INFO_FOOTER_NOTE: { vi: "Tính dựa trên công suất chờ đã cấu hình, hoạt động liên tục 24/7.", en: "Based on configured standby wattage, running continuously 24/7." },

  // IoT shared dialog
  IOT_DIALOG_PHASE_HEADER: { vi: "🚧 Tính năng IoT — Phase 2", en: "🚧 IoT Feature — Phase 2" },
  IOT_DIALOG_REQUIREMENT: { vi: "Tính năng này yêu cầu tích hợp thiết bị Smart Plug / IoT Gateway vào hệ thống.", en: "This feature requires Smart Plug / IoT Gateway device integration." },
  IOT_DIALOG_ROADMAP: { vi: "🗓️ Lộ trình: Chúng tôi đang lên kế hoạch tích hợp IoT trong Phase 2 — cho phép E-LUMI-NATE điều khiển trực tiếp ổ cắm thông minh, lên lịch tắt thiết bị, và giám sát tiêu thụ theo thời gian thực.", en: "🗓️ Roadmap: IoT integration is planned for Phase 2 — enabling E-LUMI-NATE to control smart plugs, schedule shutdowns, and monitor consumption in real-time." },
  IOT_DIALOG_INTERIM_TIP: { vi: "💡 Hiện tại: Làm theo gợi ý thủ công từ AI để rút phích hoặc bật/tắt đúng giờ — tiết kiệm tương đương!", en: "💡 For now: Follow AI manual tips to unplug or switch on schedule — equivalent savings!" },
  IOT_DIALOG_GOT_IT: { vi: "Đã hiểu", en: "Got it" },
  IOT_PHASE_LABEL: { vi: "Phase 2", en: "Phase 2" },

  // IotActionCard
  IOT_CARD_TITLE: { vi: "Tự động hóa với IoT", en: "Automate with IoT" },
  IOT_CARD_SUBTITLE: { vi: "Muốn app tự động điều khiển thiết bị để loại bỏ điện vô hình?", en: "Want the app to automatically control devices to eliminate vampire power?" },
  IOT_ACTION_1_LABEL: { vi: "Tắt standby tự động", en: "Auto standby cutoff" },
  IOT_ACTION_1_DESC: { vi: "Smart plug cắt điện khi không dùng >30 phút", en: "Smart plug cuts power when idle >30 min" },
  IOT_ACTION_2_LABEL: { vi: "Lên lịch cắt điện đêm", en: "Schedule night cutoff" },
  IOT_ACTION_2_DESC: { vi: "Tự động tắt 23:00, bật lại 6:00 sáng", en: "Auto off at 23:00, back on at 6:00 AM" },
  IOT_ACTION_3_LABEL: { vi: "Điều khiển từ xa", en: "Remote control" },
  IOT_ACTION_3_DESC: { vi: "Tắt tất cả standby chỉ với 1 nút", en: "Turn off all standby with one button" },

  // IotSuggestionsPanel
  IOT_PANEL_TITLE: { vi: "Tự động hóa IoT", en: "IoT Automation" },
  IOT_PANEL_SUBTITLE: { vi: "Điều khiển thiết bị thông minh", en: "Smart device control" },
  IOT_PANEL_EST_SAVINGS: { vi: "Tiết kiệm thêm ước tính", en: "Estimated additional savings" },
  IOT_PANEL_AUTOMATION_COUNT: { vi: "automation", en: "automations" },
  IOT_PANEL_APPLY_ALL: { vi: "Áp dụng tất cả", en: "Apply all" },
  IOT_PANEL_LOADING: { vi: "Đang phân tích thiết bị...", en: "Analyzing devices..." },
  IOT_PANEL_NO_HOME: { vi: "Thiết lập nhà để xem gợi ý IoT", en: "Set up your home to see IoT suggestions" },
  IOT_PANEL_NO_SUGGESTIONS: { vi: "Không tìm thấy cơ hội tự động hóa phù hợp", en: "No automation opportunities found" },
  IOT_CARD_APPLY_BUTTON: { vi: "Áp dụng →", en: "Apply →" },
  IOT_ACTION_META_SMART_PLUG: { vi: "Smart Plug", en: "Smart Plug" },
  IOT_ACTION_META_SCHEDULE: { vi: "Lên lịch", en: "Schedule" },
  IOT_ACTION_META_TEMPERATURE: { vi: "Điều nhiệt", en: "Thermostat" },
  IOT_ACTION_META_SLEEP: { vi: "Chế độ ngủ", en: "Sleep Mode" },
  IOT_ACTION_META_PRESENCE: { vi: "Hiện diện", en: "Presence" },
  IOT_SUGGESTION_STANDBY_TITLE: { vi: "Ngắt standby tự động", en: "Auto standby cutoff" },
  IOT_SUGGESTION_STANDBY_DETAIL: { vi: "Smart plug tắt nguồn sau 30 phút không hoạt động, loại bỏ {W}W điện vô hình liên tục.", en: "Smart plug cuts power after 30 min idle, eliminating {W}W of constant vampire drain." },
  IOT_SUGGESTION_AC_TITLE: { vi: "Điều nhiệt thông minh", en: "Smart thermostat" },
  IOT_SUGGESTION_AC_DETAIL: { vi: "Tự tăng lên 27°C khi không có người, hạ về 24°C trước 30 phút bạn về nhà.", en: "Auto-raise to 27°C when unoccupied, lower to 24°C 30 min before you return." },
  IOT_SUGGESTION_HEATER_TITLE: { vi: "Lên lịch giờ thấp điểm", en: "Off-peak schedule" },
  IOT_SUGGESTION_HEATER_DETAIL: { vi: "Tự bật lúc 22:00–6:00 khi giá điện EVN thấp, tiết kiệm đáng kể mỗi tháng.", en: "Auto-run 22:00–6:00 during low EVN tariff hours, significant monthly savings." },
  IOT_SUGGESTION_SLEEP_TITLE: { vi: "Chế độ ngủ tự động", en: "Auto sleep mode" },
  IOT_SUGGESTION_SLEEP_DETAIL: { vi: "Tự tắt lúc 23:30, ngăn thiết bị chạy suốt đêm khi bạn đã ngủ.", en: "Auto-off at 23:30, preventing devices from running all night while you sleep." },
  IOT_SUGGESTION_PRESENCE_TITLE: { vi: "Tắt khi rời khỏi nhà", en: "Off when you leave" },
  IOT_SUGGESTION_PRESENCE_DETAIL: { vi: "Cảm biến hiện diện tự ngắt điện ngay khi bạn ra ngoài, không cần nhớ tắt tay.", en: "Presence sensor auto-cuts power when you leave — no need to remember." },
  IOT_APPLY_ALL_REQUIREMENT: { vi: "Áp dụng hàng loạt yêu cầu tích hợp IoT Gateway với tất cả thiết bị Smart Plug trong nhà.", en: "Batch application requires IoT Gateway integration with all Smart Plug devices at home." },
  IOT_APPLY_ALL_INTERIM_TIP: { vi: "💡 Trong khi chờ Phase 2: thực hiện thủ công từng gợi ý để đạt mức tiết kiệm tương đương ngay hôm nay!", en: "💡 While waiting for Phase 2: manually follow each tip for equivalent savings today!" },

  // EfficiencyGauge
  EFFICIENCY_INFO_TITLE: { vi: "Chỉ số Eco Score", en: "Eco Score" },
  EFFICIENCY_INFO_SUBTITLE: { vi: "Cách tính điểm hiệu suất năng lượng", en: "How the energy efficiency score is calculated" },
  EFFICIENCY_INFO_RANK_LABEL: { vi: "Xếp hạng", en: "Rank" },
  EFFICIENCY_INFO_SCORE_LABEL: { vi: "Điểm", en: "Score" },
  EFFICIENCY_INFO_ROW_PLATINUM: { vi: "💎 Khoai Bạch Kim", en: "💎 Platinum Potato" },
  EFFICIENCY_INFO_ROW_GOLD: { vi: "⭐ Khoai Vàng", en: "⭐ Gold Potato" },
  EFFICIENCY_INFO_ROW_SPROUTING: { vi: "🌱 Khoai Nảy Mầm", en: "🌱 Sprouting Potato" },
  EFFICIENCY_INFO_ROW_RAW: { vi: "🥔 Khoai Thô", en: "🥔 Raw Potato" },
  EFFICIENCY_INFO_SCORE_81: { vi: "81–100", en: "81–100" },
  EFFICIENCY_INFO_SCORE_61: { vi: "61–80", en: "61–80" },
  EFFICIENCY_INFO_SCORE_41: { vi: "41–60", en: "41–60" },
  EFFICIENCY_INFO_SCORE_0: { vi: "0–40", en: "0–40" },
  EFFICIENCY_INFO_FORMULA: { vi: "Điểm = điểm nền theo bậc EVN ± điều chỉnh so với hộ trung bình", en: "Score = EVN tier base ± adjustment vs. average household" },
  EFFICIENCY_INFO_FOOTER: { vi: "Hộ trung bình Việt Nam dùng ~165 kWh/tháng (nguồn: EVN 2024).", en: "Average Vietnamese household uses ~165 kWh/month (source: EVN 2024)." },
  EFFICIENCY_ECO_SCORE_LABEL: { vi: "Eco Score", en: "Eco Score" },
  EFFICIENCY_EVN_TIER_LABEL: { vi: "Bậc EVN", en: "EVN Tier" },
  EFFICIENCY_EVN_TIER_VALUE: { vi: "Bậc {tier}", en: "Tier {tier}" },
  EFFICIENCY_COMPARE_LABEL: { vi: "So hộ TB", en: "vs Avg HH" },
  EFFICIENCY_RANK_PLATINUM: { vi: "Khoai Bạch Kim", en: "Platinum Potato" },
  EFFICIENCY_RANK_GOLD: { vi: "Khoai Vàng", en: "Gold Potato" },
  EFFICIENCY_RANK_SPROUTING: { vi: "Khoai Nảy Mầm", en: "Sprouting Potato" },
  EFFICIENCY_RANK_RAW: { vi: "Khoai Thô", en: "Raw Potato" },
  EFFICIENCY_HINT_LOW: { vi: "Giảm standby để lên hạng 🌱", en: "Reduce standby to rank up 🌱" },
  EFFICIENCY_HINT_MED: { vi: "Gần tới Khoai Vàng rồi! ⭐", en: "Almost at Gold Potato! ⭐" },
  EFFICIENCY_HINT_HIGH: { vi: "Hướng tới Bạch Kim! 💎", en: "Aiming for Platinum! 💎" },
  EFFICIENCY_HINT_MAX: { vi: "Bạn đang ở đỉnh cao! 🎉", en: "You're at the top! 🎉" },
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
