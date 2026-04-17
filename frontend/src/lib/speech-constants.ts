export const SPEECH_LANG_VI = "vi-VN" as const;
export const SPEECH_LANG_EN = "en-US" as const;

export type SpeechLang = typeof SPEECH_LANG_VI | typeof SPEECH_LANG_EN;

export const SPEECH_ERROR_NOT_SUPPORTED = "Trinh duyet khong ho tro nhan dang giong noi";
export const SPEECH_ERROR_NO_SPEECH = "Khong nghe thay gi, vui long thu lai";
export const SPEECH_ERROR_ABORTED = "Nhan dang giong noi bi huy";
export const SPEECH_ERROR_NETWORK = "Loi mang, vui long thu lai";
export const SPEECH_ERROR_UNKNOWN = "Loi khong xac dinh";

export const VOICE_BUTTON_LABEL = "Nhan dang giong noi";
export const VOICE_LISTENING_LABEL = "Dang nghe...";
