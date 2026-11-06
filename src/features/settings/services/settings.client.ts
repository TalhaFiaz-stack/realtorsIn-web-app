import { bffRequest } from "@/lib/api/client";
import type {
  AccountDeletionPreviewResponse,
  NotificationSettingItem,
} from "@/features/settings/types/settings.types";

export async function fetchNotificationSettingsRequest(signal?: AbortSignal) {
  return bffRequest<{ ok: true; settings: NotificationSettingItem[] }>({
    path: "settings/notification-settings",
    method: "GET",
    signal,
  });
}

export async function patchNotificationSettingRequest(input: {
  key: string;
  value: boolean;
}) {
  return bffRequest<{ ok: true; settings: NotificationSettingItem[] }>({
    path: "settings/notification-settings",
    method: "POST",
    data: input,
  });
}

export async function batchNotificationSettingsRequest(
  settings: { key: string; value: boolean }[]
) {
  return bffRequest<{ ok: true; settings: NotificationSettingItem[] }>({
    path: "settings/notification-settings",
    method: "POST",
    data: { settings },
  });
}

export async function updatePasswordRequest(password: string) {
  return bffRequest<{ ok: true; message: string }>({
    path: "settings/password",
    method: "POST",
    data: { password },
  });
}

export async function fetchDeletionPreviewRequest(signal?: AbortSignal) {
  return bffRequest<AccountDeletionPreviewResponse>({
    path: "settings/account/delete-preview",
    method: "GET",
    signal,
  });
}

export async function deleteAccountRequest() {
  return bffRequest<{ ok: true; message: string }>({
    path: "settings/account/delete",
    method: "POST",
    data: { confirmation: "DELETE" },
  });
}

export async function requestDeletionGracePeriodRequest() {
  return bffRequest<{ ok: true; message: string }>({
    path: "settings/account/request-deletion",
    method: "POST",
    data: {},
  });
}

export async function cancelDeletionRequestRequest() {
  return bffRequest<{ ok: true; message: string }>({
    path: "settings/account/cancel-deletion",
    method: "POST",
    data: {},
  });
}
