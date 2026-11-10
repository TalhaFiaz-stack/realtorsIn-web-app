import { MAX_EVENT_IMAGES } from "@/features/events/constants/events.constants";
import type { EventFormImage } from "@/features/events/types/event.types";

const SCALAR_FIELDS = [
  "title",
  "description",
  "event_type",
  "category",
  "visibility",
  "status",
  "start_at",
  "end_at",
  "timezone",
  "venue_name",
  "address",
  "city",
  "country",
  "latitude",
  "longitude",
  "online_url",
  "capacity",
  "contact_email",
  "contact_phone",
  "rem_campaign_hash",
] as const;

export type EventFormPayload = Record<string, string | number | boolean | undefined>;

export function appendEventScalars(form: FormData, payload: EventFormPayload) {
  for (const field of SCALAR_FIELDS) {
    if (field === "visibility") {
      form.append("visibility", String(payload.visibility || "public"));
      continue;
    }
    const value = payload[field];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      form.append(field, String(value));
    }
  }

  const remEnabled =
    payload.rem_lead_sync_enabled === true ||
    payload.rem_lead_sync_enabled === 1 ||
    payload.rem_lead_sync_enabled === "1";
  form.append("rem_lead_sync_enabled", remEnabled ? "1" : "0");
}

export function appendEventImages(
  form: FormData,
  images: EventFormImage[],
  newFiles: File[]
) {
  const retainedIds = images
    .filter((item) => item.id != null && !item.isLocal)
    .map((item) => Number(item.id))
    .filter((id) => Number.isFinite(id));

  form.append("retained_image_ids", JSON.stringify(retainedIds));

  const imageOrder: Array<{ id?: number; new?: boolean; uploadIndex?: number }> =
    [];
  let uploadIndex = 0;

  images.slice(0, MAX_EVENT_IMAGES).forEach((image) => {
    if (image.isLocal && image.file) {
      form.append(
        "images",
        image.file,
        image.file.name || `event-${uploadIndex + 1}.jpg`
      );
      imageOrder.push({ new: true, uploadIndex });
      uploadIndex += 1;
      return;
    }
    if (image.id != null) {
      imageOrder.push({ id: Number(image.id) });
    }
  });

  newFiles.forEach((file, index) => {
    if (uploadIndex >= MAX_EVENT_IMAGES) return;
    form.append("images", file, file.name || `event-new-${index + 1}.jpg`);
    imageOrder.push({ new: true, uploadIndex });
    uploadIndex += 1;
  });

  form.append("image_order", JSON.stringify(imageOrder));
}

/**
 * Location / link fields a format change can clear. On update the backend
 * keeps any field that isn't sent, so a cleared value must be sent as "".
 */
const CLEARABLE_ON_UPDATE = [
  "venue_name",
  "address",
  "city",
  "country",
  "latitude",
  "longitude",
  "online_url",
  "contact_email",
  "contact_phone",
] as const;

export function buildEventFormData(
  payload: EventFormPayload,
  images: EventFormImage[],
  newFiles: File[] = [],
  options: { isUpdate?: boolean } = {}
): FormData {
  const form = new FormData();
  appendEventScalars(form, payload);
  if (options.isUpdate) {
    for (const field of CLEARABLE_ON_UPDATE) {
      const value = payload[field as keyof EventFormPayload];
      if (value == null || String(value).trim() === "") form.append(field, "");
    }
  }
  appendEventImages(form, images, newFiles);
  return form;
}
