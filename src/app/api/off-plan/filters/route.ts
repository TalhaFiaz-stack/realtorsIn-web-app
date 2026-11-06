import { fetchOffPlanFiltersMeta } from "@/features/off-plan/services/off-plan.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const filters = await fetchOffPlanFiltersMeta();
    return jsonOk({ ok: true, filters });
  } catch (error) {
    return handleBffError(error);
  }
}
