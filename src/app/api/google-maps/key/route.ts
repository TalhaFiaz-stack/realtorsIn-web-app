import { fetchGoogleMapsApiKey } from "@/features/maps/services/google-maps.server";
import { handleBffError, jsonError, jsonOk } from "@/lib/auth/bff";

/** Returns the admin-configured Maps JS key (same as mobile). Restrict key by HTTP referrer in GCP. */
export async function GET() {
  try {
    const googleMapsKey = await fetchGoogleMapsApiKey();
    if (!googleMapsKey) {
      return jsonError(
        "Sign in to load the map, or configure Google Maps in admin settings",
        401,
        "UNAUTHORIZED"
      );
    }
    return jsonOk({ ok: true, googleMapsKey });
  } catch (error) {
    return handleBffError(error);
  }
}
