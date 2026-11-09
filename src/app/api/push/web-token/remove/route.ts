import { z } from "zod";
import { socialApiRequest } from "@/lib/api/server-client";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

const schema = z.object({ token: z.string().max(512).optional() });

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const { token } = schema.parse(await request.json().catch(() => ({})));
    await socialApiRequest<unknown>({
      path: "/api/push/web-token/remove",
      method: "POST",
      auth: true,
      data: token ? { token } : {},
    });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
