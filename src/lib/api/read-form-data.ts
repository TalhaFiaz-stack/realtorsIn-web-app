import "server-only";

import { ApiError } from "@/lib/api/errors";

const MB = 1024 * 1024;

/** Request-size caps per upload route (comfortably above the client-side limits). */
export const UPLOAD_LIMITS = {
  post: 250 * MB,
  story: 60 * MB,
  chat: 55 * MB,
  profileSection: 60 * MB,
  brokerVerification: 25 * MB,
  profilePhoto: 15 * MB,
  listing: 30 * MB,
} as const;

/**
 * Reads multipart form data, but first rejects oversized bodies from the
 * Content-Length header — `request.formData()` buffers the whole body in
 * memory, so a huge upload could exhaust the server before any check ran.
 */
export async function readFormData(request: Request, maxBytes: number): Promise<FormData> {
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > maxBytes) {
    throw new ApiError(
      "VALIDATION",
      `Upload is too large (max ${Math.round(maxBytes / MB)} MB).`,
      413
    );
  }
  const form = await request.formData();
  let total = 0;
  for (const value of form.values()) {
    if (typeof value !== "string") total += value.size;
  }
  if (total > maxBytes) {
    throw new ApiError(
      "VALIDATION",
      `Upload is too large (max ${Math.round(maxBytes / MB)} MB).`,
      413
    );
  }
  return form;
}
