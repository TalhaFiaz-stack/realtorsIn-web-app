import { getValidatedSession } from "@/features/auth/services/auth.server";
import { sendChatImage } from "@/features/chat/services/chat.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  receiverId: z.coerce.number().int().positive(),
  imageUrls: z.array(z.string().trim().min(1).max(2000)).min(1).max(10),
  messageContent: z.string().trim().max(4000).optional(),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const input = schema.parse(await request.json());
    const session = await getValidatedSession();
    const message = await sendChatImage({
      ...input,
      currentUserId: session.member?.socialProfileId ?? null,
    });
    return jsonOk({ ok: true, message }, { status: 201 });
  } catch (error) {
    return handleBffError(error);
  }
}
