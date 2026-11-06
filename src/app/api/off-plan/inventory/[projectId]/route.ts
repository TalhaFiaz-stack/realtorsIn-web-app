import { parseOffPlanRouteId } from "@/features/off-plan/lib/parse-off-plan-route-id";
import { fetchOffPlanInventory } from "@/features/off-plan/services/off-plan.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId: raw } = await context.params;
    const projectId = parseOffPlanRouteId(raw);
    if (!projectId) {
      return handleBffError(new Error("Invalid project id"));
    }
    const units = await fetchOffPlanInventory(projectId);
    return jsonOk({ ok: true, units });
  } catch (error) {
    return handleBffError(error);
  }
}
