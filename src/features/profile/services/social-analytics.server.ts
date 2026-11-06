import "server-only";

import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";
import {
  isSocialAnalyticsSuccess,
  mapSocialAnalyticsDetail,
  socialAnalyticsMessage,
} from "@/features/profile/lib/map-social-analytics";
import type { SocialAnalyticsDetail } from "@/features/profile/types/social-analytics.types";

export async function fetchSocialAnalytics(): Promise<SocialAnalyticsDetail> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/social_analytics",
    method: "POST",
    auth: true,
    data: {},
  });

  if (!isSocialAnalyticsSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      socialAnalyticsMessage(payload, "Unable to load analytics"),
      502
    );
  }

  const detail = mapSocialAnalyticsDetail(payload);
  if (!detail) {
    throw new ApiError("SERVER", "Invalid analytics response", 502);
  }
  return detail;
}
