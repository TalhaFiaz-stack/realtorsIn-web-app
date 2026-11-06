import "server-only";

import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";
import { getSessionToken } from "@/lib/auth/session";
import {
  clearOffplanSessionCookie,
  getOffplanSessionToken,
  setOffplanSessionCookie,
} from "@/lib/auth/offplan-session";
import { extractNodeToken } from "@/features/auth/lib/map-member";

type OffplanProfileResponse = {
  status?: boolean | string;
  data?: Record<string, unknown>;
};

/**
 * REM off-plan and published listings expect the mobile `node_token` JWT.
 * Refresh it from SocialProfile when the HttpOnly cookie is missing (older sessions).
 */
type RemCatalogTokenOptions = {
  /** Ignore cached HttpOnly cookie (after upstream 401). */
  forceRefresh?: boolean;
};

export async function getRemCatalogBearerToken(
  options?: RemCatalogTokenOptions
): Promise<string> {
  if (!options?.forceRefresh) {
    const existing = await getOffplanSessionToken();
    if (existing) return existing;
  } else {
    await clearOffplanSessionCookie();
  }

  const session = await getSessionToken();
  if (!session) {
    throw new ApiError(
      "SESSION_EXPIRED",
      "Sign in again to browse listings.",
      401
    );
  }

  const payload = await socialApiRequest<OffplanProfileResponse>({
    path: "/api/social_profile/offplan_profile",
    method: "GET",
    auth: true,
  });

  const nodeToken = extractNodeToken(payload.data);
  if (!nodeToken) {
    throw new ApiError(
      "SESSION_EXPIRED",
      "Sign out and sign in again to refresh listing access.",
      401
    );
  }

  await setOffplanSessionCookie(nodeToken);
  return nodeToken;
}
