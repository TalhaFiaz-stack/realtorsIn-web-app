import type { QueryClient } from "@tanstack/react-query";
import { normalizeNavBadgeCount } from "@/lib/navigation/nav-badge";
import type {
  ConversationSummary,
  ConversationsPage,
} from "@/features/chat/types/chat.types";

type UnreadCache = {
  totalUnread: number;
  conversationsWithUnread?: number;
};

function reorderConversations(
  conversations: ConversationSummary[]
): ConversationSummary[] {
  return conversations.slice().sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const ta = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
    const tb = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
    return tb - ta;
  });
}

export function patchAllConversationQueries(
  queryClient: QueryClient,
  patch: (page: ConversationsPage | undefined) => ConversationsPage | undefined
): void {
  queryClient.setQueriesData<ConversationsPage>(
    { queryKey: ["chat", "conversations"] },
    patch
  );
}

export function patchConversationInCache(
  queryClient: QueryClient,
  conversationId: number,
  updater: (item: ConversationSummary) => ConversationSummary
): void {
  patchAllConversationQueries(queryClient, (page) => {
    if (!page) return page;
    let found = false;
    const conversations = page.conversations.map((item) => {
      if (item.id !== conversationId) return item;
      found = true;
      return updater(item);
    });
    if (!found) return page;
    return {
      ...page,
      conversations: reorderConversations(conversations),
    };
  });
}

export function clearConversationUnread(
  queryClient: QueryClient,
  conversationId: number
): number {
  let cleared = 0;
  patchConversationInCache(queryClient, conversationId, (item) => {
    cleared = item.unreadCount;
    if (item.unreadCount === 0) return item;
    return { ...item, unreadCount: 0 };
  });
  refreshChatUnreadCache(queryClient);
  return cleared;
}

export function bumpConversationUnread(
  queryClient: QueryClient,
  input: {
    conversationId: number;
    lastMessage: string;
    lastMessageAt: string | null;
  }
): void {
  let bumped = false;
  patchConversationInCache(queryClient, input.conversationId, (item) => {
    bumped = true;
    return {
      ...item,
      lastMessage: input.lastMessage,
      lastMessageAt: input.lastMessageAt ?? item.lastMessageAt,
      unreadCount: item.unreadCount + 1,
    };
  });
  if (bumped) {
    refreshChatUnreadCache(queryClient);
  }
}

export function updateConversationPreview(
  queryClient: QueryClient,
  input: {
    conversationId: number;
    lastMessage: string;
    lastMessageAt: string | null;
  }
): void {
  patchConversationInCache(queryClient, input.conversationId, (item) => ({
    ...item,
    lastMessage: input.lastMessage,
    lastMessageAt: input.lastMessageAt ?? item.lastMessageAt,
  }));
}

/** Sum unread from the default Inbox list when the full page is cached. */
export function syncChatUnreadFromInboxCaches(
  queryClient: QueryClient
): boolean {
  const page = queryClient.getQueryData<ConversationsPage>([
    "chat",
    "conversations",
    "",
  ]);
  if (!page || page.conversations.length < page.total) return false;

  const inbox = page.conversations.filter((item) => !item.isArchived);
  const totalUnread = inbox.reduce(
    (sum, item) => sum + Math.max(0, item.unreadCount),
    0
  );
  const conversationsWithUnread = inbox.filter(
    (item) => item.unreadCount > 0
  ).length;

  queryClient.setQueryData<UnreadCache>(["chat", "unread"], (current) => ({
    ...(current ?? {}),
    totalUnread: normalizeNavBadgeCount(totalUnread),
    conversationsWithUnread: normalizeNavBadgeCount(conversationsWithUnread),
  }));
  return true;
}

export function refreshChatUnreadCache(queryClient: QueryClient): void {
  const synced = syncChatUnreadFromInboxCaches(queryClient);
  if (!synced) {
    void queryClient.invalidateQueries({ queryKey: ["chat", "unread"] });
  }
}

export function patchConversationOnline(
  page: ConversationsPage | undefined,
  userId: number,
  isOnline: boolean
): ConversationsPage | undefined {
  if (!page) return page;
  let changed = false;
  const conversations = page.conversations.map((item) => {
    if (item.otherUser.id !== userId) return item;
    if (item.otherUser.isOnline === isOnline) return item;
    changed = true;
    return {
      ...item,
      otherUser: { ...item.otherUser, isOnline },
    };
  });
  return changed ? { ...page, conversations } : page;
}
