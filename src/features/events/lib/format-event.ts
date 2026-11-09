import { EVENT_VISIBILITY_LABELS } from "@/features/events/constants/events.constants";
import type { SocialEvent } from "@/features/events/types/event.types";

export function formatEventWhen(
  startAt: string | null | undefined,
  timezone?: string | null
): string {
  if (!startAt) return "";
  try {
    return new Date(startAt).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone || undefined,
    });
  } catch {
    return new Date(startAt).toLocaleString();
  }
}

function dayKey(iso: string, timezone?: string | null): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: timezone || undefined });
}

export function formatEventSchedule(
  startAt: string | null | undefined,
  endAt: string | null | undefined,
  timezone?: string | null
): string {
  if (!startAt) return "";
  const start = formatEventWhen(startAt, timezone);
  if (!endAt) return start;
  try {
    const sameDay = dayKey(startAt, timezone) === dayKey(endAt, timezone);
    // Multi-day events must show the end date too, not just a time.
    const end = sameDay
      ? new Date(endAt).toLocaleString(undefined, {
          hour: "numeric",
          minute: "2-digit",
          timeZone: timezone || undefined,
        })
      : formatEventWhen(endAt, timezone);
    return `${start} – ${end}`;
  } catch {
    return start;
  }
}

export function getEventLocationLabel(event: SocialEvent): string {
  if (event.eventType === "online") {
    return event.onlineUrl ? "Online event" : "Online";
  }
  const parts = [event.venueName, event.city, event.country].filter(Boolean);
  if (parts.length) return parts.join(", ");
  if (event.address) return event.address;
  return event.eventType === "hybrid" ? "Hybrid" : "";
}

export function formatVisibilityLabel(visibility: string | null | undefined) {
  if (!visibility) return "Public";
  return EVENT_VISIBILITY_LABELS[visibility] ?? visibility;
}

export function eventCoverUrl(event: SocialEvent): string | null {
  if (event.coverImageUrl) return event.coverImageUrl;
  const first = event.images[0]?.imageUrl;
  return first ?? null;
}
