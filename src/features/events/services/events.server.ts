import "server-only";

import { mapEvent, mapEventsPage } from "@/features/events/lib/map-events";
import type {
  EventsHubTab,
  EventsListFilters,
  EventsListPage,
  SocialEvent,
} from "@/features/events/types/event.types";
import {
  backendMessage,
  isBackendSuccess,
} from "@/features/profile/lib/map-profile";
import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";

function assertSuccess(payload: unknown, fallback: string) {
  if (!isBackendSuccess(payload)) {
    throw new ApiError("SERVER", backendMessage(payload, fallback), 502);
  }
}

function listParams(page: number, filters: EventsListFilters) {
  return {
    page,
    limit: 20,
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.startDate ? { start_date: filters.startDate } : {}),
    ...(filters.endDate ? { end_date: filters.endDate } : {}),
    ...(filters.past ? { past: "true" } : {}),
  };
}

function pathForTab(tab: EventsHubTab): string {
  switch (tab) {
    case "upcoming":
      return "/api/events";
    case "hosting":
      return "/api/events/me/hosting";
    case "going":
      return "/api/events/me/going";
    case "invited":
      return "/api/events/me/invited";
    case "past":
      return "/api/events/me/going";
    default:
      return "/api/events";
  }
}

export async function fetchEventsPage(
  tab: EventsHubTab,
  page: number,
  filters: EventsListFilters = {}
): Promise<EventsListPage> {
  const merged: EventsListFilters =
    tab === "past" ? { ...filters, past: true } : filters;
  const payload = await socialApiRequest<unknown>({
    path: pathForTab(tab),
    method: "GET",
    auth: true,
    params: listParams(page, merged),
  });
  assertSuccess(payload, "Unable to load events");
  return mapEventsPage(payload);
}

export async function fetchEventById(eventId: number): Promise<SocialEvent> {
  const payload = await socialApiRequest<unknown>({
    path: `/api/events/${eventId}`,
    method: "GET",
    auth: true,
  });
  assertSuccess(payload, "Unable to load event");
  const body = payload as Record<string, unknown>;
  const event = mapEvent(body.data ?? body.event ?? body);
  if (!event) {
    throw new ApiError("SERVER", "Event not found", 404);
  }
  return event;
}

export async function rsvpEvent(eventId: number, status: string) {
  const payload = await socialApiRequest<unknown>({
    path: `/api/events/${eventId}/rsvp`,
    method: "POST",
    auth: true,
    data: { status },
  });
  assertSuccess(payload, "Unable to update RSVP");
  return payload;
}

export async function recordEventView(eventId: number) {
  await socialApiRequest<unknown>({
    path: `/api/events/${eventId}/view`,
    method: "POST",
    auth: true,
    data: {},
  });
}

export async function createEventMultipart(form: FormData) {
  const payload = await socialApiRequest<unknown>({
    path: "/api/events",
    method: "POST",
    auth: true,
    data: form,
    isFormData: true,
    timeoutMs: 120_000,
  });
  assertSuccess(payload, "Unable to create event");
  const body = payload as Record<string, unknown>;
  const event = mapEvent(body.data);
  if (!event) throw new ApiError("SERVER", "Invalid event response", 502);
  return event;
}

export async function updateEventMultipart(eventId: number, form: FormData) {
  const payload = await socialApiRequest<unknown>({
    path: `/api/events/${eventId}/update`,
    method: "POST",
    auth: true,
    data: form,
    isFormData: true,
    timeoutMs: 120_000,
  });
  assertSuccess(payload, "Unable to update event");
  const body = payload as Record<string, unknown>;
  const event = mapEvent(body.data);
  if (!event) throw new ApiError("SERVER", "Invalid event response", 502);
  return event;
}

export async function publishEvent(eventId: number) {
  const payload = await socialApiRequest<unknown>({
    path: `/api/events/${eventId}/publish`,
    method: "POST",
    auth: true,
    data: {},
  });
  assertSuccess(payload, "Unable to publish event");
  return mapEvent((payload as Record<string, unknown>).data);
}

export async function cancelEvent(eventId: number, cancelNote?: string) {
  const payload = await socialApiRequest<unknown>({
    path: `/api/events/${eventId}/cancel`,
    method: "POST",
    auth: true,
    data: { cancel_note: cancelNote?.trim() || null },
  });
  assertSuccess(payload, "Unable to cancel event");
  return mapEvent((payload as Record<string, unknown>).data);
}

export async function deleteEvent(eventId: number) {
  const payload = await socialApiRequest<unknown>({
    path: `/api/events/${eventId}/delete`,
    method: "POST",
    auth: true,
    data: {},
  });
  assertSuccess(payload, "Unable to delete event");
}

export async function inviteToEvent(eventId: number, inviteeIds: number[]) {
  const payload = await socialApiRequest<unknown>({
    path: `/api/events/${eventId}/invite`,
    method: "POST",
    auth: true,
    data: { invitee_ids: inviteeIds },
  });
  assertSuccess(payload, "Unable to send invites");
  return payload;
}

export async function fetchEventAttendeesPage(
  eventId: number,
  status: "going" | "invited",
  page: number
) {
  const payload = await socialApiRequest<unknown>({
    path: `/api/events/${eventId}/attendees`,
    method: "GET",
    auth: true,
    params: { status, page, limit: 30 },
  });
  assertSuccess(payload, "Unable to load attendees");
  return payload;
}
