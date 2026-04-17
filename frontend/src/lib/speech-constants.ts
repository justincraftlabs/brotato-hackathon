export const SPEECH_LANG_VI = "vi-VN" as const;
export const SPEECH_LANG_EN = "en-US" as const;

export type SpeechLang = typeof SPEECH_LANG_VI | typeof SPEECH_LANG_EN;

export const SPEECH_ERROR_NOT_SUPPORTED = "Trình duyệt không hỗ trợ nhận dạng giọng nói";
export const SPEECH_ERROR_NO_SPEECH = "Không nghe thấy gì, vui lòng thử lại";
export const SPEECH_ERROR_ABORTED = "Nhận dạng giọng nói bị hủy";
export const SPEECH_ERROR_NETWORK = "Lỗi mạng, vui lòng thử lại";
export const SPEECH_ERROR_UNKNOWN = "Lỗi không xác định";
