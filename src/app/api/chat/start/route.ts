import { startConversation } from "@/features/chat/services/chat.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  receiverId: z.coerce.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const { receiverId } = schema.parse(await request.json());
    const result = await startConversation(receiverId);
    return jsonOk({ ok: true, ...result });
  } catch (error) {
    return handleBffError(error);
  }
}
