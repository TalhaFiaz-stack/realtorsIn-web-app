import { z } from "zod";
import { socialApiRequest } from "@/lib/api/server-client";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

/** Campaign open tracking — same call mobile makes on notification tap. */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireCsrf(request);
    const { id: raw } = await context.params;
    const id = z.coerce.number().int().positive().parse(raw);
    await socialApiRequest<unknown>({
      path: `/api/notifications/push-read/${id}`,
      method: "POST",
      auth: true,
      data: {},
    }).catch(() => null); // tracking is best-effort
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
