"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEventsPageRequest } from "@/features/events/services/events.client";
import { fetchJobsPageRequest } from "@/features/jobs/services/jobs.client";
import { fetchOffPlanFeedSectionsClient } from "@/features/off-plan/services/off-plan.client";
import type { FeedSuggestionModuleData } from "@/features/feed/lib/merge-feed-with-suggestions";
import {
  fetchContactSuggestions,
  fetchSuggestions,
} from "@/features/network/services/network.client";

export const feedSuggestionsQueryKey = ["feed", "suggestions"] as const;

const EMPTY_BUNDLE: FeedSuggestionModuleData = {
  contact_suggestions: [],
  connection_suggestions: [],
  job_suggestions: [],
  event_suggestions: [],
};

export function useFeedSuggestions(enabled: boolean) {
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!enabled || geo) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        /* job suggestions work without location */
      },
      { maximumAge: 600_000, timeout: 8_000 }
    );
  }, [enabled, geo]);

  const query = useQuery({
    queryKey: [...feedSuggestionsQueryKey, geo?.lat ?? "", geo?.lng ?? ""] as const,
    enabled,
    staleTime: 5 * 60_000,
    queryFn: async ({ signal }) => {
      const [contacts, connections, jobsPage, eventsPage] = await Promise.all([
        fetchContactSuggestions(1, signal).catch(() => ({ people: [] })),
        fetchSuggestions(1, signal).catch(() => ({ people: [] })),
        fetchJobsPageRequest(
          "discover",
          1,
          undefined,
          signal,
          geo ?? undefined
        ).catch(() => ({ jobs: [] as never[] })),
        fetchEventsPageRequest("upcoming", 1, {}, signal).catch(() => ({
          events: [] as never[],
        })),
      ]);

      return {
        contact_suggestions: contacts.people ?? [],
        connection_suggestions: connections.people ?? [],
        job_suggestions: (jobsPage.jobs ?? []).slice(0, 8),
        event_suggestions: (eventsPage.events ?? []).slice(0, 8),
      } satisfies FeedSuggestionModuleData;
    },
  });

  // Off-plan "top projects" rows load on their own so a slow social call
  // never holds them back (and vice versa). Same endpoint as mobile.
  const offPlanQuery = useQuery({
    queryKey: [...feedSuggestionsQueryKey, "offplan", geo?.lat ?? "", geo?.lng ?? ""] as const,
    enabled,
    staleTime: 10 * 60_000,
    queryFn: ({ signal }) =>
      fetchOffPlanFeedSectionsClient(geo, signal)
        .then((res) => res.sections ?? [])
        .catch(() => []),
  });

  const bundle = useMemo(
    () => ({
      ...(query.data ?? EMPTY_BUNDLE),
      offplan_sections: offPlanQuery.data ?? [],
    }),
    [query.data, offPlanQuery.data]
  );

  return { bundle, isLoading: query.isLoading, refetch: query.refetch };
}
