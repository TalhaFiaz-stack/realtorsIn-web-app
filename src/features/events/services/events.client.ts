import { bffRequest } from "@/lib/api/client";
import type {
  EventsHubTab,
  EventsListFilters,
  EventsListPage,
  SocialEvent,
} from "@/features/events/types/event.types";

export async function fetchEventsPageRequest(
  tab: EventsHubTab,
  page: number,
  filters: EventsListFilters,
  signal?: AbortSignal
) {
  return bffRequest<{ ok: true } & EventsListPage>({
    path: "events",
    method: "GET",
    signal,
    params: {
      tab,
      page,
      ...(filters.q ? { q: filters.q } : {}),
      ...(filters.startDate ? { startDate: filters.startDate } : {}),
      ...(filters.endDate ? { endDate: filters.endDate } : {}),
    },
  });
}

export async function fetchEventByIdRequest(id: number, signal?: AbortSignal) {
  return bffRequest<{ ok: true; event: SocialEvent }>({
    path: `events/${id}`,
    method: "GET",
    signal,
  });
}

export async function rsvpEventRequest(eventId: number, status: string) {
  return bffRequest<{ ok: true; data?: unknown }>({
    path: `events/${eventId}/rsvp`,
    method: "POST",
    data: { status },
  });
}

export async function recordEventViewRequest(eventId: number) {
  return bffRequest<{ ok: true }>({
    path: `events/${eventId}/view`,
    method: "POST",
    data: {},
  });
}

export async function createEventRequest(form: FormData) {
  return bffRequest<{ ok: true; event: SocialEvent }>({
    path: "events/create",
    method: "POST",
    data: form,
    timeoutMs: 120_000,
  });
}

export async function updateEventRequest(eventId: number, form: FormData) {
  return bffRequest<{ ok: true; event: SocialEvent }>({
    path: `events/${eventId}/update`,
    method: "POST",
    data: form,
    timeoutMs: 120_000,
  });
}

export async function publishEventRequest(eventId: number) {
  return bffRequest<{ ok: true; event: SocialEvent }>({
    path: `events/${eventId}/publish`,
    method: "POST",
    data: {},
  });
}

export async function cancelEventRequest(eventId: number, cancelNote?: string) {
  return bffRequest<{ ok: true; event: SocialEvent }>({
    path: `events/${eventId}/cancel`,
    method: "POST",
    data: { cancel_note: cancelNote ?? null },
  });
}

export async function deleteEventRequest(eventId: number) {
  return bffRequest<{ ok: true }>({
    path: `events/${eventId}/delete`,
    method: "POST",
    data: {},
  });
}

export async function inviteToEventRequest(
  eventId: number,
  inviteeIds: number[]
) {
  return bffRequest<{ ok: true }>({
    path: `events/${eventId}/invite`,
    method: "POST",
    data: { invitee_ids: inviteeIds },
  });
}

export async function fetchEventAttendeesRequest(
  eventId: number,
  status: "going" | "invited",
  page: number,
  signal?: AbortSignal
) {
  return bffRequest<{ ok: true } & import("@/features/events/lib/map-event-attendees").EventAttendeesPage>({
    path: `events/${eventId}/attendees`,
    method: "GET",
    signal,
    params: { status, page },
  });
}
