import { reactToChatMessage } from "@/features/chat/services/chat.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({ emoji: z.string().min(1).max(16) });

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireCsrf(request);
    const { id } = await context.params;
    const messageId = z.coerce.number().int().positive().parse(id);
    const body = schema.parse(await request.json());
    await reactToChatMessage({ messageId, emoji: body.emoji });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
