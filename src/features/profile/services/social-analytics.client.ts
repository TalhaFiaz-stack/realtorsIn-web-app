import { bffRequest } from "@/lib/api/client";
import type { SocialAnalyticsDetail } from "@/features/profile/types/social-analytics.types";

export async function fetchSocialAnalyticsRequest(signal?: AbortSignal) {
  return bffRequest<{ ok: true; analytics: SocialAnalyticsDetail }>({
    path: "profile/analytics",
    method: "POST",
    data: {},
    signal,
  });
}
