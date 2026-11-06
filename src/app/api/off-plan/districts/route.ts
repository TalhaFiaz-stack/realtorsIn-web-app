import { fetchOffPlanDistricts } from "@/features/off-plan/services/off-plan.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const districts = await fetchOffPlanDistricts();
    return jsonOk({ ok: true, districts });
  } catch (error) {
    return handleBffError(error);
  }
}
