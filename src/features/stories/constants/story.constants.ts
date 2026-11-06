/** Mobile create flow always sends connections (no visibility picker). */
export const DEFAULT_STORY_VISIBILITY = "connections" as const;

export const DEFAULT_STORY_IMAGE_DURATION_MS = 5_000;
export const MAX_STORY_VIDEO_DURATION_MS = 30_000;
export const MAX_STORY_CAPTION_LENGTH = 500;
export const MAX_STORY_REPLY_LENGTH = 500;
export const MAX_STORY_UPLOAD_BYTES = 50 * 1024 * 1024;

export const STORY_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const STORY_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "video/x-matroska",
  "video/m4v",
] as const;
