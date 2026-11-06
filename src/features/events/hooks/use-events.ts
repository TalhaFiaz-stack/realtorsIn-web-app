"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchEventByIdRequest,
  fetchEventsPageRequest,
  recordEventViewRequest,
  rsvpEventRequest,
} from "@/features/events/services/events.client";
import type {
  EventsHubTab,
  EventsListFilters,
} from "@/features/events/types/event.types";
import { ApiError } from "@/lib/api/errors";
import { showAppToast } from "@/lib/toast/app-toast";

export function eventsQueryKey(
  tab: EventsHubTab,
  filters: EventsListFilters
) {
  return ["events", tab, filters] as const;
}

export function eventDetailQueryKey(id: number) {
  return ["events", "detail", id] as const;
}

export function eventsErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export function useEventsList(
  tab: EventsHubTab,
  filters: EventsListFilters
) {
  return useInfiniteQuery({
    queryKey: eventsQueryKey(tab, filters),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      fetchEventsPageRequest(tab, pageParam, filters, signal),
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    select: (data) => ({
      pages: data.pages,
      events: data.pages.flatMap((p) => p.events),
    }),
  });
}

export function useEventDetail(
  eventId: number,
  options?: { enabled?: boolean }
) {
  const idOk = Number.isFinite(eventId) && eventId > 0;
  return useQuery({
    queryKey: eventDetailQueryKey(eventId),
    queryFn: ({ signal }) => fetchEventByIdRequest(eventId, signal),
    select: (data) => data.event,
    enabled: (options?.enabled ?? true) && idOk,
  });
}

export function useEventRsvp(eventId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => rsvpEventRequest(eventId, status),
    onSuccess: (_data, status) => {
      void queryClient.invalidateQueries({ queryKey: ["events"] });
      void queryClient.invalidateQueries({
        queryKey: eventDetailQueryKey(eventId),
      });
      if (status === "going") {
        showAppToast.success("Registered", "You're registered for this event.");
      } else {
        showAppToast.success("Registration cancelled");
      }
    },
    onError: (error) => {
      showAppToast.fromError(error, "Could not update registration");
    },
  });
}

export function useRecordEventView(eventId: number) {
  return useMutation({
    mutationFn: () => recordEventViewRequest(eventId),
  });
}
