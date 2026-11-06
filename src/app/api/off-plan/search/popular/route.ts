import { fetchOffPlanPopularSearch } from "@/features/off-plan/services/off-plan-search.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const sections = await fetchOffPlanPopularSearch(20);
    return jsonOk({ ok: true, sections });
  } catch (error) {
    return handleBffError(error);
  }
}
