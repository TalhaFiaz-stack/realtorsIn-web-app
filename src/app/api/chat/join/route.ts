import {
  joinChatConversation,
  leaveChatConversation,
} from "@/features/chat/services/chat.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  conversationId: z.coerce.number().int().positive(),
  action: z.enum(["join", "leave"]).default("join"),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const input = schema.parse(await request.json());
    if (input.action === "leave") {
      await leaveChatConversation(input.conversationId);
    } else {
      await joinChatConversation(input.conversationId);
    }
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
