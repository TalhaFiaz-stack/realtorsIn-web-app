import { z } from "zod";
import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

const schema = z.object({ token: z.string().min(20).max(512) });

/** Save this browser's FCM token (backend `web_fcm_token`, never the phone slots). */
export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const { token } = schema.parse(await request.json());
    const payload = await socialApiRequest<{ status?: boolean; message?: string }>({
      path: "/api/push/web-token",
      method: "POST",
      auth: true,
      data: { token },
    });
    if (!payload?.status) {
      throw new ApiError("SERVER", payload?.message || "Unable to enable notifications", 502);
    }
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
