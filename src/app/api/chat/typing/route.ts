import { emitChatTyping } from "@/features/chat/services/chat.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  conversationId: z.coerce.number().int().positive(),
  isTyping: z.boolean(),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const input = schema.parse(await request.json());
    await emitChatTyping(input);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
