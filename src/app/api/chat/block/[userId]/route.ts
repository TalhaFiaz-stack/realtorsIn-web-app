import { blockChatUser } from "@/features/chat/services/chat.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({ reason: z.string().trim().max(500).optional() });

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await requireCsrf(request);
    const { userId: raw } = await context.params;
    const userId = z.coerce.number().int().positive().parse(raw);
    const body = schema.parse(await request.json().catch(() => ({})));
    await blockChatUser({ userId, reason: body.reason || undefined });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
