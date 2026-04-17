import {
  CANVAS_OUTPUT_TYPE,
  CANVAS_QUALITY,
  HEIC_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_IMAGE_DIMENSION,
  MEDIA_TYPE_JPEG,
  MEDIA_TYPE_PNG,
  MEDIA_TYPE_WEBP,
  type SupportedMediaType,
} from "./image-constants";

function isHeicFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  return (
    (HEIC_MIME_TYPES as readonly string[]).includes(file.type) ||
    lowerName.endsWith(".heic") ||
    lowerName.endsWith(".heif")
  );
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const blob = Array.isArray(result) ? result[0] : result;
  return new File([blob], file.name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg"), {
    type: MEDIA_TYPE_JPEG,
  });
}

export async function resizeImageToBase64(file: File): Promise<string> {
  const sourceFile = isHeicFile(file) ? await convertHeicToJpeg(file) : file;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const { width, height } = calculateResizedDimensions(
          img.width,
          img.height
        );

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(CANVAS_OUTPUT_TYPE, CANVAS_QUALITY);
        const DATA_URL_PREFIX_LENGTH = dataUrl.indexOf(",") + 1;
        const base64 = dataUrl.slice(DATA_URL_PREFIX_LENGTH);
        resolve(base64);
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(sourceFile);
  });
}

function calculateResizedDimensions(
  originalWidth: number,
  originalHeight: number
): { width: number; height: number } {
  if (
    originalWidth <= MAX_IMAGE_DIMENSION &&
    originalHeight <= MAX_IMAGE_DIMENSION
  ) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;

  if (originalWidth > originalHeight) {
    return {
      width: MAX_IMAGE_DIMENSION,
      height: Math.round(MAX_IMAGE_DIMENSION / aspectRatio),
    };
  }

  return {
    width: Math.round(MAX_IMAGE_DIMENSION * aspectRatio),
    height: MAX_IMAGE_DIMENSION,
  };
}

export function isFileSizeValid(file: File): boolean {
  return file.size <= MAX_FILE_SIZE_BYTES;
}

export function base64ToFile(base64: string, fileName: string = "image.jpg"): File {
  const byteString = atob(base64);
  const byteArray = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([byteArray], { type: MEDIA_TYPE_JPEG });
  return new File([blob], fileName, { type: MEDIA_TYPE_JPEG });
}

export function getMediaType(file: File): SupportedMediaType {
  if (file.type === MEDIA_TYPE_PNG) {
    return MEDIA_TYPE_PNG;
  }
  if (file.type === MEDIA_TYPE_WEBP) {
    return MEDIA_TYPE_WEBP;
  }
  return MEDIA_TYPE_JPEG;
}
