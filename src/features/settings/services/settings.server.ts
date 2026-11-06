import "server-only";

import { mapNotificationSettingsList } from "@/features/settings/lib/map-notification-settings";
import type {
  AccountDeletionPreview,
  NotificationSettingItem,
} from "@/features/settings/types/settings.types";
import {
  backendMessage,
  isBackendSuccess,
} from "@/features/profile/lib/map-profile";
import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";

function assertSuccess(payload: unknown, fallback: string) {
  if (!isBackendSuccess(payload)) {
    throw new ApiError("SERVER", backendMessage(payload, fallback), 502);
  }
  return payload;
}

export async function fetchNotificationSettings(): Promise<
  NotificationSettingItem[]
> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/social_profile/notification-settings",
    method: "GET",
    auth: true,
  });
  assertSuccess(payload, "Unable to load notification settings");
  const list = mapNotificationSettingsList(payload);
  if (list.length === 0) {
    throw new ApiError("SERVER", "No notification settings returned", 502);
  }
  return list;
}

export async function updateNotificationSettings(
  settings: { key: string; value: boolean }[]
): Promise<NotificationSettingItem[]> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/social_profile/notification-settings",
    method: "POST",
    auth: true,
    data: { settings },
  });
  assertSuccess(payload, "Unable to update notification settings");
  const list = mapNotificationSettingsList(payload);
  if (list.length === 0) {
    throw new ApiError("SERVER", "No notification settings returned", 502);
  }
  return list;
}

export async function updateSocialPassword(password: string) {
  const payload = await socialApiRequest<unknown>({
    path: "/api/social_profile/password",
    method: "POST",
    auth: true,
    data: { password },
  });
  assertSuccess(payload, "Unable to update password");
  return backendMessage(payload, "Password updated");
}

type Raw = Record<string, unknown>;

function asRecord(value: unknown): Raw | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Raw)
    : null;
}

function mapDeletionPreview(payload: unknown): AccountDeletionPreview {
  const root = asRecord(payload);
  const preview = asRecord(root?.preview) ?? root;
  if (!preview) {
    throw new ApiError("SERVER", "Invalid deletion preview", 502);
  }
  const user = asRecord(preview.user);
  const dataToBeDeleted = asRecord(preview.dataToBeDeleted) ?? {};
  const counts: Record<string, number> = {};
  for (const [key, value] of Object.entries(dataToBeDeleted)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      counts[key] = value;
    }
  }
  return {
    userId: Number(preview.userId) || 0,
    user: {
      name: String(user?.name ?? ""),
      email: user?.email != null ? String(user.email) : null,
      phone: user?.phone != null ? String(user.phone) : null,
      username: user?.username != null ? String(user.username) : null,
    },
    dataToBeDeleted: counts,
  };
}

export async function fetchAccountDeletionPreview(): Promise<AccountDeletionPreview> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/account/delete-preview",
    method: "GET",
    auth: true,
  });
  assertSuccess(payload, "Unable to load deletion preview");
  return mapDeletionPreview(payload);
}

export async function deleteAccountPermanently(confirmation: "DELETE") {
  const payload = await socialApiRequest<unknown>({
    path: "/api/account/delete",
    method: "DELETE",
    auth: true,
    data: { confirmation },
  });
  assertSuccess(payload, "Unable to delete account");
  return backendMessage(payload, "Account deleted");
}

export async function requestAccountDeletionGracePeriod() {
  const payload = await socialApiRequest<unknown>({
    path: "/api/account/request-deletion",
    method: "POST",
    auth: true,
    data: {},
  });
  assertSuccess(payload, "Unable to request account deletion");
  return backendMessage(payload, "Deletion requested");
}

export async function cancelAccountDeletionRequest() {
  const payload = await socialApiRequest<unknown>({
    path: "/api/account/cancel-deletion",
    method: "POST",
    auth: true,
    data: {},
  });
  assertSuccess(payload, "Unable to cancel deletion");
  return backendMessage(payload, "Deletion cancelled");
}
