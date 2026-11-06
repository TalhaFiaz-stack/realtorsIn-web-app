import { sendChatMessage } from "@/features/chat/services/chat.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  receiverId: z.coerce.number().int().positive(),
  messageContent: z.string().trim().min(1).max(4000),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const input = schema.parse(await request.json());
    const message = await sendChatMessage(input);
    return jsonOk({ ok: true, message });
  } catch (error) {
    return handleBffError(error);
  }
}
