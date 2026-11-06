import { fetchOffPlanPresentationContext } from "@/features/off-plan/services/off-plan-presentation.server";
import { handleBffError, jsonError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const context = await fetchOffPlanPresentationContext();
    if (!context) {
      return jsonError(
        "Sign in to generate offer links and PDFs",
        401,
        "UNAUTHORIZED"
      );
    }
    return jsonOk({ ok: true, context });
  } catch (error) {
    return handleBffError(error);
  }
}
