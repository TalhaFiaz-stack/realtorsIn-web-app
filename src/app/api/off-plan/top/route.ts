import { fetchOffPlanFeedSections } from "@/features/off-plan/services/off-plan.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

function coord(value: string | null, min: number, max: number): number | null {
  if (value == null || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}

/** GET /api/off-plan/top?lat=&lng= — home feed off-plan sections. */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const lat = coord(url.searchParams.get("lat"), -90, 90);
    const lng = coord(url.searchParams.get("lng"), -180, 180);
    const sections = await fetchOffPlanFeedSections(
      lat != null && lng != null ? { lat, lng } : null
    );
    return jsonOk({ ok: true, sections });
  } catch (error) {
    return handleBffError(error);
  }
}
