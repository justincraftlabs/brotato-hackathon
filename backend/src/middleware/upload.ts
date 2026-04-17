import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const UNSUPPORTED_FILE_TYPE_MESSAGE = 'Only JPEG, PNG, WebP, HEIC, and HEIF images are allowed';

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  const isAllowed = ALLOWED_MIME_TYPES.includes(
    file.mimetype as AllowedMimeType
  );

  if (!isAllowed) {
    cb(new Error(UNSUPPORTED_FILE_TYPE_MESSAGE));
    return;
  }

  cb(null, true);
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
});
