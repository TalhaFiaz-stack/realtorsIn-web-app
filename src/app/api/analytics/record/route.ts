import { z } from "zod";
import { handleBffError, jsonError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { socialApiRequest } from "@/lib/api/server-client";
import { getSessionToken } from "@/lib/auth/session";

/**
 * Member analytics (social `POST /api/analytics/record`). Only actions the web
 * app records are allowed here; project analytics go through /api/off-plan/track.
 */
const schema = z.object({
  actionType: z.enum(["post_detail_view"]),
  postId: z.coerce.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    if (!(await getSessionToken())) {
      return jsonError("Sign in required", 401, "UNAUTHORIZED");
    }
    const input = schema.parse(await request.json());
    await socialApiRequest<unknown>({
      path: "/api/analytics/record",
      method: "POST",
      auth: true,
      data: { action_type: input.actionType, post_id: input.postId },
    }).catch(() => null); // telemetry never fails the caller
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
