import { getValidatedSession } from "@/features/auth/services/auth.server";
import { sendChatProfileShare } from "@/features/chat/services/chat.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  receiverId: z.coerce.number().int().positive(),
  profileId: z.coerce.number().int().positive(),
  messageContent: z.string().trim().max(4000).optional(),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const input = schema.parse(await request.json());
    const session = await getValidatedSession();
    const message = await sendChatProfileShare({
      ...input,
      currentUserId: session.member?.socialProfileId ?? null,
    });
    return jsonOk({ ok: true, message }, { status: 201 });
  } catch (error) {
    return handleBffError(error);
  }
}
