import type { NotificationSettingItem } from "@/features/settings/types/settings.types";

type Raw = Record<string, unknown>;

function asRecord(value: unknown): Raw | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Raw)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function asBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function mapNotificationSettingsList(
  payload: unknown
): NotificationSettingItem[] {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const fromData = data?.notification_settings;
  const list = Array.isArray(fromData)
    ? fromData
    : Array.isArray(root?.notification_settings)
      ? root.notification_settings
      : [];

  return list
    .map((item) => {
      const row = asRecord(item);
      const key = asString(row?.key);
      if (!key) return null;
      return {
        key,
        title: asString(row?.title) ?? key,
        description: asString(row?.description) ?? "",
        value: asBool(row?.value),
      };
    })
    .filter((item): item is NotificationSettingItem => item != null);
}
