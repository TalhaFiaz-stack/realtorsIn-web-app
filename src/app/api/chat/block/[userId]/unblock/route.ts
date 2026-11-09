import { unblockChatUser } from "@/features/chat/services/chat.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await requireCsrf(request);
    const { userId: raw } = await context.params;
    const userId = z.coerce.number().int().positive().parse(raw);
    await unblockChatUser(userId);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
