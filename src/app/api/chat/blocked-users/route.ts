import { listBlockedChatUsers } from "@/features/chat/services/chat.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const users = await listBlockedChatUsers();
    return jsonOk({ ok: true, users });
  } catch (error) {
    return handleBffError(error);
  }
}
