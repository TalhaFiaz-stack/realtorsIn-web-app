import { getChatUnreadCount } from "@/features/chat/services/chat.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const counts = await getChatUnreadCount();
    return jsonOk({ ok: true, ...counts });
  } catch (error) {
    return handleBffError(error);
  }
}
