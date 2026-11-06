import { deleteConversation } from "@/features/chat/services/chat.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireCsrf(_request);
    const { id } = await context.params;
    const conversationId = z.coerce.number().int().positive().parse(id);
    await deleteConversation(conversationId);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
