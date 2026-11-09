import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  createPostFieldsSchema,
  MAX_UPLOAD_BYTES,
} from "@/features/feed/validators/feed.validators";
import { createPostMultipart } from "@/features/feed/services/posts.server";
import {
  handleBffError,
  jsonError,
  jsonOk,
  requireCsrf,
} from "@/lib/auth/bff";
import { readFormData, UPLOAD_LIMITS } from "@/lib/api/read-form-data";

/** Shared inquiry + property listing string fields (mobile posts/store). */
const LISTING_STRING_FIELDS = [
  "attach_type",
  "title",
  "price_start",
  "price_end",
  "property_type",
  "type",
  "location",
  "bedrooms",
  "baths",
  "well_furnished",
  "area_start",
  "area_end",
  "public_notes",
  "city",
  "community",
  "sub_community",
  "lat_long",
  "building_id",
  "category",
  "availability",
  "listing_tag",
] as const;

function appendStringFields(
  incoming: FormData,
  outbound: FormData,
  keys: readonly string[]
) {
  for (const key of keys) {
    const value = incoming.get(key);
    if (typeof value === "string" && value.trim()) {
      outbound.append(key, value.trim());
    }
  }
}

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const incoming = await readFormData(request, UPLOAD_LIMITS.post);
    const fields = createPostFieldsSchema.parse({
      description: String(incoming.get("description") ?? ""),
      visibility: String(incoming.get("visibility") ?? "connections"),
      scheduledAt: incoming.get("scheduled_at")
        ? String(incoming.get("scheduled_at"))
        : undefined,
    });

    const outbound = new FormData();
    outbound.append("description", fields.description);
    outbound.append("visibility", fields.visibility);
    if (fields.scheduledAt) {
      outbound.append("scheduled_at", fields.scheduledAt);
    }

    const mentionedUserIds = incoming.get("mentioned_user_ids");
    if (typeof mentionedUserIds === "string" && mentionedUserIds.trim()) {
      outbound.append("mentioned_user_ids", mentionedUserIds.trim());
    }
    const mentionedUsers = incoming.get("mentioned_users");
    if (typeof mentionedUsers === "string" && mentionedUsers.trim()) {
      outbound.append("mentioned_users", mentionedUsers.trim());
    }

    const attachType = String(incoming.get("attach_type") ?? "").trim();
    const isInquiry = attachType === "inquiry";
    const isProperty = attachType === "property";

    appendStringFields(incoming, outbound, LISTING_STRING_FIELDS);

    let imageIndex = 0;
    let videoIndex = 0;
    let propertyImageIndex = 0;
    let hasMedia = false;
    let hasPropertyImages = false;

    for (const [key, value] of incoming.entries()) {
      if (!(value instanceof File)) continue;
      if (!value.size) continue;
      if (value.size > MAX_UPLOAD_BYTES) {
        return jsonError(
          "Each file must be 50MB or smaller",
          400,
          "VALIDATION"
        );
      }

      if (key.startsWith("property_images")) {
        if (
          !ALLOWED_IMAGE_TYPES.includes(
            value.type as (typeof ALLOWED_IMAGE_TYPES)[number]
          )
        ) {
          return jsonError("Unsupported image type", 400, "VALIDATION");
        }
        outbound.append(
          `property_images[${propertyImageIndex}]`,
          value,
          value.name
        );
        propertyImageIndex += 1;
        hasPropertyImages = true;
        continue;
      }

      if (key.startsWith("images") || value.type.startsWith("image/")) {
        if (
          !ALLOWED_IMAGE_TYPES.includes(
            value.type as (typeof ALLOWED_IMAGE_TYPES)[number]
          )
        ) {
          return jsonError("Unsupported image type", 400, "VALIDATION");
        }
        outbound.append(`images[${imageIndex}]`, value, value.name);
        imageIndex += 1;
        hasMedia = true;
        continue;
      }

      if (key.startsWith("videos") || value.type.startsWith("video/")) {
        if (
          !ALLOWED_VIDEO_TYPES.includes(
            value.type as (typeof ALLOWED_VIDEO_TYPES)[number]
          ) &&
          !value.type.startsWith("video/")
        ) {
          return jsonError("Unsupported video type", 400, "VALIDATION");
        }
        outbound.append(`videos[${videoIndex}]`, value, value.name);
        videoIndex += 1;
        hasMedia = true;
      }
    }

    if (isInquiry) {
      const title = String(incoming.get("title") ?? "").trim();
      const priceStart = String(incoming.get("price_start") ?? "").trim();
      const priceEnd = String(incoming.get("price_end") ?? "").trim();
      const propertyType = String(incoming.get("property_type") ?? "").trim();
      const type = String(incoming.get("type") ?? "").trim();
      const location = String(incoming.get("location") ?? "").trim();
      if (
        !title ||
        !priceStart ||
        !priceEnd ||
        !propertyType ||
        !type ||
        !location
      ) {
        return jsonError(
          "Complete required inquiry fields before publishing",
          400,
          "VALIDATION"
        );
      }
    } else if (isProperty) {
      const title = String(incoming.get("title") ?? "").trim();
      const propertyType = String(incoming.get("property_type") ?? "").trim();
      const category = String(incoming.get("category") ?? "").trim();
      const type = String(incoming.get("type") ?? "").trim();
      const location = String(incoming.get("location") ?? "").trim();
      const bedrooms = String(incoming.get("bedrooms") ?? "").trim();
      const baths = String(incoming.get("baths") ?? "").trim();
      const priceStart = String(incoming.get("price_start") ?? "").trim();
      const areaStart = String(incoming.get("area_start") ?? "").trim();
      if (
        !hasPropertyImages ||
        !title ||
        !propertyType ||
        !category ||
        !type ||
        !location ||
        bedrooms === "" ||
        baths === "" ||
        !priceStart ||
        !areaStart
      ) {
        return jsonError(
          "Complete required property fields and photos before publishing",
          400,
          "VALIDATION"
        );
      }
    } else if (!fields.description && !hasMedia) {
      return jsonError(
        "Add text or at least one image/video",
        400,
        "VALIDATION"
      );
    }

    const created = await createPostMultipart(outbound);
    return jsonOk(
      {
        ok: true,
        id: created.id,
        influencerChallenge: created.influencerChallenge,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleBffError(error);
  }
}
