"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchEventAttendeesRequest } from "@/features/events/services/events.client";

export function useEventAttendees(
  eventId: number,
  status: "going" | "invited"
) {
  return useInfiniteQuery({
    queryKey: ["events", eventId, "attendees", status],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      fetchEventAttendeesRequest(eventId, status, pageParam, signal),
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    select: (data) => ({
      rows: data.pages.flatMap((p) => p.rows),
    }),
    enabled: Number.isFinite(eventId) && eventId > 0,
  });
}
