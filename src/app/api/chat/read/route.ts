import { markMessagesRead } from "@/features/chat/services/chat.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  conversationId: z.coerce.number().int().positive(),
  messageIds: z.array(z.coerce.number().int().positive()).optional(),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const input = schema.parse(await request.json());
    await markMessagesRead(input);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
