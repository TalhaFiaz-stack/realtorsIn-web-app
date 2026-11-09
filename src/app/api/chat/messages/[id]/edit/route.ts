import { editChatMessage } from "@/features/chat/services/chat.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({ content: z.string().trim().min(1).max(5000) });

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireCsrf(request);
    const { id } = await context.params;
    const messageId = z.coerce.number().int().positive().parse(id);
    const body = schema.parse(await request.json());
    await editChatMessage({ messageId, content: body.content });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
