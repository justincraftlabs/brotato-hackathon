export const MAX_IMAGE_DIMENSION = 1024;
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";
export const ACCEPTED_CAMERA_TYPES = "image/*";

export const HEIC_MIME_TYPES = ['image/heic', 'image/heif'] as const;

export const IMAGE_LABELS = {
  WATTAGE_SUFFIX: "W",
} as const;

export const CONFIDENCE_THRESHOLD_HIGH = 0.8;
export const CONFIDENCE_THRESHOLD_MEDIUM = 0.5;

export const CONFIDENCE_LEVEL_HIGH = 'high' as const;
export const CONFIDENCE_LEVEL_MEDIUM = 'medium' as const;
export const CONFIDENCE_LEVEL_LOW = 'low' as const;

export const CANVAS_QUALITY = 0.85;
export const CANVAS_OUTPUT_TYPE = "image/jpeg";

export type SupportedMediaType = "image/jpeg" | "image/png" | "image/webp";

export const MEDIA_TYPE_JPEG: SupportedMediaType = "image/jpeg";
export const MEDIA_TYPE_PNG: SupportedMediaType = "image/png";
export const MEDIA_TYPE_WEBP: SupportedMediaType = "image/webp";
