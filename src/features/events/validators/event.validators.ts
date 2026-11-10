import { z } from "zod";
import {
  EVENT_CATEGORIES,
  EVENT_TYPES,
  EVENT_VISIBILITY,
} from "@/features/events/constants/events.constants";

/** Same patterns and messages as mobile `validators/event.validator.js`. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;
const REM_CAMPAIGN_HASH_RE = /^[a-f0-9]{16,128}$/i;

const typeValues: readonly string[] = EVENT_TYPES.map((t) => t.value);
const visibilityValues: readonly string[] = EVENT_VISIBILITY.map((v) => v.value);
const categoryValues: readonly string[] = EVENT_CATEGORIES;

const text = z.string().optional();
const trimmed = (value: string | undefined) => String(value ?? "").trim();

export type EventFormSchemaOptions = {
  /** Creating (not editing): the start must be in the future. */
  requireFutureStart?: boolean;
  /** Places search is available: the location must be picked from suggestions. */
  requirePickedLocation?: boolean;
};

export function createEventFormSchema({
  requireFutureStart = false,
  requirePickedLocation = false,
}: EventFormSchemaOptions = {}) {
  return z
    .object({
      title: text,
      description: text,
      category: text,
      event_type: text,
      visibility: text,
      start_at: text,
      end_at: text,
      timezone: text,
      venue_name: text,
      address: text,
      city: text,
      country: text,
      latitude: text,
      longitude: text,
      online_url: text,
      capacity: text,
      contact_email: text,
      contact_phone: text,
      rem_lead_sync_enabled: z.boolean().optional(),
      rem_campaign_hash: text,
    })
    .superRefine((data, ctx) => {
      const issue = (path: string, message: string) =>
        ctx.addIssue({ code: "custom", message, path: [path] });

      const title = trimmed(data.title);
      if (!title) issue("title", "Title is required");
      else if (title.length < 3) issue("title", "Title must be at least 3 characters");
      else if (title.length > 120) issue("title", "Title cannot exceed 120 characters");

      const description = trimmed(data.description);
      if (!description) issue("description", "Description is required");
      else if (description.length < 10) issue("description", "Description must be at least 10 characters");
      else if (description.length > 5000) issue("description", "Description cannot exceed 5000 characters");

      if (!data.category || !categoryValues.includes(data.category)) {
        issue("category", "Please select a valid category");
      }
      if (!data.event_type || !typeValues.includes(data.event_type)) {
        issue("event_type", "Please select an event type");
      }

      const start = data.start_at ? new Date(data.start_at) : null;
      const end = data.end_at ? new Date(data.end_at) : null;
      const startOk = start != null && !Number.isNaN(start.getTime());
      const endOk = end != null && !Number.isNaN(end.getTime());
      if (!data.start_at) issue("start_at", "Start date/time is required");
      else if (!startOk) issue("start_at", "Start date/time is invalid");
      else if (requireFutureStart && start.getTime() < Date.now() - 60_000) {
        issue("start_at", "Start must be in the future");
      }
      if (!data.end_at) issue("end_at", "End date/time is required");
      else if (!endOk) issue("end_at", "End date/time is invalid");
      else if (startOk && !(end > start)) issue("end_at", "End must be after start");

      if (!trimmed(data.timezone)) issue("timezone", "Time zone is required");

      const needsLocation = data.event_type === "in_person" || data.event_type === "hybrid";
      const needsOnline = data.event_type === "online" || data.event_type === "hybrid";

      if (needsLocation) {
        const address = trimmed(data.address);
        const venue = trimmed(data.venue_name);
        const city = trimmed(data.city);
        if (!address) issue("address", "Event location is required");
        else if (address.length > 500) issue("address", "Address cannot exceed 500 characters");
        else if (requirePickedLocation && (!trimmed(data.latitude) || !trimmed(data.longitude))) {
          issue("address", "Please select event location from the suggestions list");
        }
        if (venue.length > 200) issue("venue_name", "Venue name cannot exceed 200 characters");
        if (!city) issue("city", "City is required");
        else if (city.length > 100) issue("city", "City cannot exceed 100 characters");
      }

      if (needsOnline) {
        const url = trimmed(data.online_url);
        if (!url) issue("online_url", "Meeting link is required");
        else if (!URL_RE.test(url)) issue("online_url", "Enter a valid link starting with http:// or https://");
        else if (url.length > 500) issue("online_url", "Meeting link cannot exceed 500 characters");
      }

      if (data.visibility && !visibilityValues.includes(data.visibility)) {
        issue("visibility", "Please select a valid visibility");
      }

      const capacityRaw = trimmed(data.capacity);
      if (capacityRaw) {
        const capacity = Number(capacityRaw);
        if (!Number.isInteger(capacity) || capacity < 1) {
          issue("capacity", "Capacity must be a whole number of at least 1");
        } else if (capacity > 100000) {
          issue("capacity", "Capacity is too large");
        }
      }

      const email = trimmed(data.contact_email);
      if (email && !EMAIL_RE.test(email)) issue("contact_email", "Enter a valid email address");
      else if (email.length > 200) issue("contact_email", "Email cannot exceed 200 characters");

      const phone = trimmed(data.contact_phone);
      if (phone && !PHONE_RE.test(phone)) issue("contact_phone", "Enter a valid phone number");
      else if (phone.length > 40) issue("contact_phone", "Phone cannot exceed 40 characters");

      if (data.rem_lead_sync_enabled) {
        const hash = trimmed(data.rem_campaign_hash);
        if (!hash) {
          issue("rem_campaign_hash", "REM campaign hash is required when sync is on");
        } else if (!REM_CAMPAIGN_HASH_RE.test(hash)) {
          issue("rem_campaign_hash", "Enter a valid REM campaign hash (from /api/create-lead/...)");
        }
      }
    });
}

export const eventFormSchema = createEventFormSchema();

export type EventFormInput = z.infer<typeof eventFormSchema>;
export type EventFormErrors = Partial<Record<string, string>>;

/** First message per field, in form order. */
export function eventFormErrors(error: z.ZodError): EventFormErrors {
  const out: EventFormErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
