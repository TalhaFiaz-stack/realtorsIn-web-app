import { markAllNotificationsRead } from "@/features/notifications/services/notifications.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const unreadCount = await markAllNotificationsRead();
    return jsonOk({ ok: true, unreadCount });
  } catch (error) {
    return handleBffError(error);
  }
}
