import type {
  AppNotification,
  NotificationsPage,
} from "@/features/notifications/types/notification.types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function asNumber(value: unknown, fallback: number | null = null): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function isBackendSuccess(payload: unknown): boolean {
  const p = asRecord(payload);
  if (!p) return false;
  return p.status === true || p.status === "true";
}

export function backendMessage(payload: unknown, fallback: string): string {
  return asString(asRecord(payload)?.message) ?? fallback;
}

export function mapNotification(raw: unknown): AppNotification | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id);
  if (id == null) return null;
  const metadata = asRecord(row.metadata);
  const conversationId =
    asNumber(metadata?.conversation_id) ??
    asNumber(metadata?.conversationId);
  const storyId = asNumber(row.story_id) ?? asNumber(metadata?.story_id);
  const type = asString(row.type) ?? "unknown";
  let actionText = asString(row.action_text);
  if (!actionText && storyId != null && type === "comment") {
    actionText = "commented on your story";
  }
  return {
    id,
    type,
    fullName: asString(row.full_name),
    userName: asString(row.user_name),
    avatarUrl: asString(row.profile_image),
    actionText,
    createdAt: asString(row.created_at),
    isRead: asBool(row.is_read),
    postId: asNumber(row.post_id),
    storyId,
    connectionId: asNumber(row.connection_id),
    canAcceptConnection: asBool(row.can_accept_connection),
    conversationId,
  };
}

export function mapNotificationsPage(payload: unknown): NotificationsPage {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const list = Array.isArray(data?.data) ? data.data : [];
  const page = asNumber(data?.current_page, 1) ?? 1;
  const lastPage = asNumber(data?.last_page, page) ?? page;
  const next = asString(data?.next_page_url);
  return {
    notifications: list
      .map(mapNotification)
      .filter((n): n is AppNotification => Boolean(n)),
    page,
    perPage: asNumber(data?.per_page, 20) ?? 20,
    total: asNumber(data?.total, 0) ?? 0,
    lastPage,
    hasNextPage: Boolean(next) || page < lastPage,
  };
}
