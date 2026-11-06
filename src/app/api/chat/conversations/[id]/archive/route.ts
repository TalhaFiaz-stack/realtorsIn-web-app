import { archiveConversation } from "@/features/chat/services/chat.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  isArchived: z.boolean(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireCsrf(request);
    const { id } = await context.params;
    const conversationId = z.coerce.number().int().positive().parse(id);
    const body = schema.parse(await request.json());
    await archiveConversation({
      conversationId,
      isArchived: body.isArchived,
    });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
