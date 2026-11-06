import { offPlanTrackBodySchema } from "@/features/off-plan/validators/off-plan-track.validators";
import { recordOffPlanActivity } from "@/features/off-plan/services/off-plan-track.server";
import { handleBffError, jsonError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { getSessionToken } from "@/lib/auth/session";

/** Fire-and-forget project activity (mobile `trackEvents` + `recordAnalyticsApi`). */
export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const token = await getSessionToken();
    if (!token) {
      return jsonError("Sign in required", 401, "UNAUTHORIZED");
    }
    const parsed = offPlanTrackBodySchema.safeParse(await request.json());
    if (!parsed.success || (!parsed.data.eventType && !parsed.data.analyticsAction)) {
      return jsonError("Invalid tracking payload", 400, "VALIDATION");
    }
    await recordOffPlanActivity(parsed.data);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
