import "server-only";

import { socialApiRequest } from "@/lib/api/server-client";
import { getSessionToken } from "@/lib/auth/session";
import { isBackendSuccess } from "@/features/auth/lib/map-member";
import { ApiError } from "@/lib/api/errors";

type GoogleMapsKeyResponse = {
  status?: boolean | string;
  message?: string;
  data?: { google_maps_key?: string };
};

/** Same source as mobile `GET google-maps/key` on SocialProfileREM. */
export async function fetchGoogleMapsApiKey(): Promise<string | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const payload = await socialApiRequest<GoogleMapsKeyResponse>({
    path: "/api/google-maps/key",
    method: "GET",
    auth: true,
  });

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      typeof payload.message === "string"
        ? payload.message
        : "Unable to load Google Maps key",
      502
    );
  }

  const key = payload.data?.google_maps_key?.trim();
  return key || null;
}
