"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSocialAnalyticsRequest } from "@/features/profile/services/social-analytics.client";
import { ApiError } from "@/lib/api/errors";

export function socialAnalyticsErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Unable to load analytics";
}

export function useSocialAnalytics() {
  return useQuery({
    queryKey: ["profile", "social-analytics"],
    queryFn: ({ signal }) => fetchSocialAnalyticsRequest(signal),
    select: (data) => data.analytics,
  });
}
