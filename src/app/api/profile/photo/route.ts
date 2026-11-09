import { updateSocialPic } from "@/features/profile/services/profile-mutations.server";
import {
  handleBffError,
  jsonError,
  jsonOk,
  requireCsrf,
} from "@/lib/auth/bff";
import { readFormData, UPLOAD_LIMITS } from "@/lib/api/read-form-data";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const form = await readFormData(request, UPLOAD_LIMITS.profilePhoto);
    const socialProfileId = Number(form.get("socialProfileId"));
    const kindRaw = String(form.get("kind") ?? "profile");
    const kind =
      kindRaw === "cover" ? "cover" : kindRaw === "rera" ? "rera" : "profile";
    const fileKey =
      kind === "cover"
        ? "cover_image"
        : kind === "rera"
          ? "rera_image"
          : "profile_image";
    const file = form.get(fileKey);

    if (!Number.isFinite(socialProfileId) || socialProfileId <= 0) {
      return jsonError("Invalid profile id", 400, "VALIDATION");
    }
    if (!(file instanceof File) || !file.size) {
      return jsonError("Image is required", 400, "VALIDATION");
    }
    if (file.size > MAX_BYTES) {
      return jsonError("Image must be 10MB or smaller", 400, "VALIDATION");
    }
    if (file.type && !ALLOWED.has(file.type)) {
      return jsonError("Unsupported image type", 400, "VALIDATION");
    }

    await updateSocialPic({ socialProfileId, file, kind });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
