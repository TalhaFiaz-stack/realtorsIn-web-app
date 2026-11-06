import { getUnreadNotificationCount } from "@/features/notifications/services/notifications.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const unreadCount = await getUnreadNotificationCount();
    return jsonOk({ ok: true, unreadCount });
  } catch (error) {
    return handleBffError(error);
  }
}
