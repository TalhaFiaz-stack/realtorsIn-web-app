"use client";

import { useQuery } from "@tanstack/react-query";
import { useChatUnread } from "@/features/chat/hooks/use-chat";
import { fetchConversations } from "@/features/chat/services/chat.client";
import type { ConversationsPage } from "@/features/chat/types/chat.types";
import { useNotificationUnread } from "@/features/notifications/hooks/use-notifications";
import {
  navBadgeFromCount,
  normalizeNavBadgeCount,
} from "@/lib/navigation/nav-badge";

export type ShellNavBadges = {
  messaging: number | undefined;
  notifications: number | undefined;
};

function inboxUnreadFromConversations(
  page: ConversationsPage | undefined
): number | null {
  if (!page) return null;
  return page.conversations
    .filter((item) => !item.isArchived)
    .reduce((sum, item) => sum + Math.max(0, item.unreadCount), 0);
}

function resolveMessagingUnread(
  apiUnread: number,
  page: ConversationsPage | undefined
): number {
  if (!page || page.conversations.length < page.total) return apiUnread;
  return inboxUnreadFromConversations(page) ?? apiUnread;
}

/**
 * Unread counts for top nav + mobile bar.
 * Messaging aligns with the Inbox list when conversation cache is available.
 */
export function useShellNavBadges(): ShellNavBadges {
  const chatUnread = useChatUnread();
  const notificationUnread = useNotificationUnread();
  const { data: conversationsPage } = useQuery<ConversationsPage>({
    queryKey: ["chat", "conversations", ""],
    queryFn: ({ signal }) => fetchConversations(1, signal),
    enabled: false,
  });

  const apiUnread = normalizeNavBadgeCount(chatUnread.data?.totalUnread);
  const messaging = resolveMessagingUnread(apiUnread, conversationsPage);

  return {
    messaging: navBadgeFromCount(messaging),
    notifications: navBadgeFromCount(notificationUnread.data?.unreadCount),
  };
}
