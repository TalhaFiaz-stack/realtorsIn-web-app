import {
  MAX_STORY_UPLOAD_BYTES,
  STORY_IMAGE_TYPES,
  STORY_VIDEO_TYPES,
} from "@/features/stories/constants/story.constants";
import { createStoryMultipart } from "@/features/stories/services/stories.server";
import { storyCreateFieldsSchema } from "@/features/stories/validators/story.validators";
import {
  handleBffError,
  jsonError,
  jsonOk,
  requireCsrf,
} from "@/lib/auth/bff";
import { readFormData, UPLOAD_LIMITS } from "@/lib/api/read-form-data";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const incoming = await readFormData(request, UPLOAD_LIMITS.story);
    const media = incoming.get("media");
    if (!(media instanceof File) || media.size <= 0) {
      return jsonError("A photo or video is required", 400, "VALIDATION");
    }
    if (media.size > MAX_STORY_UPLOAD_BYTES) {
      return jsonError("File is too large (max 50MB)", 400, "VALIDATION");
    }

    const mime = media.type || "";
    const isImage = (STORY_IMAGE_TYPES as readonly string[]).includes(mime);
    const isVideo = (STORY_VIDEO_TYPES as readonly string[]).includes(mime);
    if (!isImage && !isVideo) {
      return jsonError("Unsupported media type", 400, "VALIDATION");
    }

    const fields = storyCreateFieldsSchema.parse({
      caption: String(incoming.get("caption") ?? ""),
      visibility: String(incoming.get("visibility") ?? "connections"),
      mediaType:
        String(incoming.get("media_type") ?? "") ||
        (isVideo ? "video" : "image"),
      durationMs: incoming.get("duration_ms")
        ? Number(incoming.get("duration_ms"))
        : undefined,
    });

    const outbound = new FormData();
    outbound.append("media", media, media.name || "story-media");
    outbound.append("media_type", fields.mediaType);
    outbound.append("visibility", fields.visibility);
    if (fields.caption) outbound.append("caption", fields.caption);
    if (fields.durationMs != null) {
      outbound.append("duration_ms", String(fields.durationMs));
    }

    const thumbnail = incoming.get("thumbnail");
    if (thumbnail instanceof File && thumbnail.size > 0) {
      outbound.append(
        "thumbnail",
        thumbnail,
        thumbnail.name || "story-thumb.jpg"
      );
    }

    const story = await createStoryMultipart(outbound);
    return jsonOk({ ok: true, story }, { status: 201 });
  } catch (error) {
    return handleBffError(error);
  }
}
