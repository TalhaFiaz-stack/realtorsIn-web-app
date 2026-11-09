import { parseOffPlanRouteId } from "@/features/off-plan/lib/parse-off-plan-route-id";
import { fetchOffPlanUnitDetail } from "@/features/off-plan/services/off-plan-unit.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET(
  _request: Request,
  context: { params: Promise<{ unitId: string }> }
) {
  try {
    const { unitId: raw } = await context.params;
    const unitId = parseOffPlanRouteId(raw);
    if (!unitId) return handleBffError(new Error("Invalid unit id"));
    const unit = await fetchOffPlanUnitDetail(unitId);
    return jsonOk({ ok: true, unit });
  } catch (error) {
    return handleBffError(error);
  }
}
