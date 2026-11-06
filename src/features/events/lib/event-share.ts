import {
  formatEventSchedule,
  getEventLocationLabel,
} from "@/features/events/lib/format-event";
import type { SocialEvent } from "@/features/events/types/event.types";

export function buildEventPublicUrl(eventId: number, origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/events/${eventId}`;
}

export function buildEventShareMessage(event: SocialEvent, url: string): string {
  const when = formatEventSchedule(
    event.startAt,
    event.endAt,
    event.timezone
  );
  const place = getEventLocationLabel(event);
  const lines = [event.title];
  if (when) lines.push(when);
  if (place) lines.push(place);
  lines.push("", url.trim());
  return lines.filter(Boolean).join("\n");
}
