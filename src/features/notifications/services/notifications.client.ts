import { bffRequest } from "@/lib/api/client";
import type { NotificationsPage } from "@/features/notifications/types/notification.types";

export async function fetchNotifications(page = 1, signal?: AbortSignal) {
  return bffRequest<{ ok: true } & NotificationsPage>({
    path: "notifications/list",
    method: "GET",
    params: { page, limit: 20 },
    signal,
  });
}

export async function fetchNotificationUnread(signal?: AbortSignal) {
  return bffRequest<{ ok: true; unreadCount: number }>({
    path: "notifications/unread-count",
    method: "GET",
    signal,
  });
}

export async function markNotificationReadRequest(notificationId: number) {
  return bffRequest<{ ok: true; unreadCount: number }>({
    path: "notifications/mark-read",
    method: "POST",
    data: { notificationId },
  });
}

export async function markAllNotificationsReadRequest() {
  return bffRequest<{ ok: true; unreadCount: number }>({
    path: "notifications/mark-all-read",
    method: "POST",
    data: {},
  });
}

export async function deleteNotificationRequest(notificationId: number) {
  return bffRequest<{ ok: true; unreadCount: number }>({
    path: "notifications/delete",
    method: "POST",
    data: { notificationId },
  });
}
