import { sendStoryReply } from "@/features/chat/services/chat.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  receiverId: z.coerce.number().int().positive(),
  messageContent: z.string().trim().min(1).max(500),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireCsrf(request);
    const { id } = await context.params;
    const storyId = z.coerce.number().int().positive().parse(id);
    const body = schema.parse(await request.json());
    await sendStoryReply({
      receiverId: body.receiverId,
      storyId,
      messageContent: body.messageContent,
    });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
