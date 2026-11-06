import { parseOffPlanRouteId } from "@/features/off-plan/lib/parse-off-plan-route-id";
import { fetchOffPlanProjectDetail } from "@/features/off-plan/services/off-plan.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: raw } = await context.params;
    const id = parseOffPlanRouteId(raw);
    if (!id) {
      return handleBffError(new Error("Invalid project id"));
    }
    const project = await fetchOffPlanProjectDetail(id);
    return jsonOk({ ok: true, project });
  } catch (error) {
    return handleBffError(error);
  }
}
