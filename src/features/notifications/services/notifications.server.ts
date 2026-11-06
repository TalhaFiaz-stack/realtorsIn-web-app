import "server-only";

import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";
import {
  backendMessage,
  isBackendSuccess,
  mapNotificationsPage,
} from "@/features/notifications/lib/map-notification";
import type { NotificationsPage } from "@/features/notifications/types/notification.types";

function formFields(fields: Record<string, string>): FormData {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  return form;
}

export async function listNotifications(input: {
  page: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<NotificationsPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/notifications",
    method: "GET",
    auth: true,
    params: {
      page: input.page,
      limit: input.limit ?? 20,
      ...(input.unreadOnly ? { unread_only: true } : {}),
    },
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load notifications"),
      502
    );
  }
  return mapNotificationsPage(payload);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const payload = await socialApiRequest<{
    status?: boolean | string;
    data?: { unread_count?: number };
  }>({
    path: "/api/notifications/unread/count",
    method: "GET",
    auth: true,
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load unread count"),
      502
    );
  }
  return Number(payload.data?.unread_count ?? 0);
}

export async function markNotificationRead(
  notificationId: number
): Promise<number> {
  const payload = await socialApiRequest<{
    status?: boolean | string;
    data?: { unread_count?: number };
  }>({
    path: "/api/notifications/mark-read",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFields({ notification_id: String(notificationId) }),
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to mark as read"),
      502
    );
  }
  return Number(payload.data?.unread_count ?? 0);
}

export async function markAllNotificationsRead(): Promise<number> {
  const payload = await socialApiRequest<{
    status?: boolean | string;
    data?: { unread_count?: number };
  }>({
    path: "/api/notifications/mark-all-read",
    method: "POST",
    auth: true,
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to mark all read"),
      502
    );
  }
  return Number(payload.data?.unread_count ?? 0);
}

export async function deleteNotification(
  notificationId: number
): Promise<number> {
  const payload = await socialApiRequest<{
    status?: boolean | string;
    data?: { unread_count?: number };
  }>({
    path: "/api/notifications/delete",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFields({ notification_id: String(notificationId) }),
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to delete notification"),
      502
    );
  }
  return Number(payload.data?.unread_count ?? 0);
}
