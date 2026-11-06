import { deleteNotification } from "@/features/notifications/services/notifications.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  notificationId: z.coerce.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const { notificationId } = schema.parse(await request.json());
    const unreadCount = await deleteNotification(notificationId);
    return jsonOk({ ok: true, unreadCount });
  } catch (error) {
    return handleBffError(error);
  }
}
