import { z } from "zod";
import { handleBffError, jsonError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { socialApiRequest } from "@/lib/api/server-client";
import { getSessionToken } from "@/lib/auth/session";

/** Social `POST /api/analytics/app-session` (mobile `useAppUsageTracker` parity). */
const schema = z.object({
  sessionStart: z.string().datetime(),
  sessionEnd: z.string().datetime(),
  durationSeconds: z.number().int().min(2).max(24 * 60 * 60),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    if (!(await getSessionToken())) {
      return jsonError("Sign in required", 401, "UNAUTHORIZED");
    }
    const input = schema.parse(await request.json());
    await socialApiRequest<unknown>({
      path: "/api/analytics/app-session",
      method: "POST",
      auth: true,
      data: {
        session_start: input.sessionStart,
        session_end: input.sessionEnd,
        duration_seconds: input.durationSeconds,
        platform: "web",
      },
    }).catch(() => null); // best-effort telemetry
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
