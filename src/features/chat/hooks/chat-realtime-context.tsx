"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { mapMessage } from "@/features/chat/lib/map-chat";
import { appendMessage, type InfiniteMessages } from "@/features/chat/lib/thread-cache";
import { notifyChatMessageInBrowser } from "@/features/chat/lib/chat-browser-notify";
import { previewFromChatMessage } from "@/features/chat/lib/message-list-preview";
import { refreshChatUnreadCache } from "@/features/chat/lib/patch-conversations-cache";
import {
  bumpConversationUnread,
  clearConversationUnread,
  patchAllConversationQueries,
  patchConversationOnline,
  updateConversationPreview,
} from "@/features/chat/lib/patch-conversations-cache";
import { useChatToastStore } from "@/features/chat/store/chat-toast.store";
import type { ConversationsPage } from "@/features/chat/types/chat.types";

type ChatRealtimeContextValue = {
  connected: boolean;
  error: string | null;
  onlineUserIds: ReadonlySet<number>;
  isUserOnline: (userId: number | null | undefined) => boolean;
  isPeerTyping: (conversationId: number) => boolean;
  activeConversationId: number | null;
  setActiveConversationId: (id: number | null) => void;
};

const ChatRealtimeContext = createContext<ChatRealtimeContextValue | null>(
  null
);

export function ChatRealtimeProvider({
  currentUserId,
  children,
}: {
  currentUserId: number | null;
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const pushToast = useChatToastStore((state) => state.push);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(
    () => new Set()
  );
  const [typingByConversation, setTypingByConversation] = useState<
    Record<number, boolean>
  >({});
  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(null);
  const activeRef = useRef<number | null>(null);
  const currentUserRef = useRef(currentUserId);

  useEffect(() => {
    activeRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    currentUserRef.current = currentUserId;
  }, [currentUserId]);

  // Derive active conversation from URL when on /messages/[id]
  useEffect(() => {
    const match = pathname.match(/^\/messages\/(\d+)/);
    if (match) {
      const id = Number(match[1]);
      if (Number.isFinite(id)) setActiveConversationId(id);
      return;
    }
    if (!pathname.startsWith("/messages")) {
      setActiveConversationId(null);
    }
  }, [pathname]);

  const setOnline = useCallback(
    (userId: number, isOnline: boolean) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (isOnline) next.add(userId);
        else next.delete(userId);
        return next;
      });
      patchAllConversationQueries(queryClient, (current) =>
        patchConversationOnline(current, userId, isOnline)
      );
    },
    [queryClient]
  );

  useEffect(() => {
    if (currentUserId == null) return;
    let active = true;
    let source: EventSource | null = null;
    let retryTimer: number | null = null;
    let attempt = 0;

    const onStatus = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as { connected?: boolean };
        if (active) {
          setConnected(Boolean(data.connected));
          if (data.connected) setError(null);
        }
      } catch {
        // ignore
      }
    };

    const onSocketError = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as { message?: string };
        if (!active) return;
        // Transient connect_error while SSE reconnects — avoid sticky banner after shares.
        setError(data.message || "Reconnecting to chat…");
      } catch {
        if (active) setError("Reconnecting to chat…");
      }
    };

    const ingestMessage = (event: MessageEvent, forceOwn?: boolean) => {
      try {
        const payload = JSON.parse(event.data) as { message?: unknown };
        const mapped = mapMessage(
          payload.message ?? payload,
          currentUserRef.current,
          { forceOwn: forceOwn === true ? true : undefined }
        );
        if (!mapped) return;

        queryClient.setQueryData<InfiniteMessages>(
          ["chat", "messages", mapped.conversationId],
          (current) => appendMessage(current, mapped)
        );

        const viewing = activeRef.current === mapped.conversationId;
        const fromOther = !mapped.isOwn;
        const preview = previewFromChatMessage(mapped);

        if (fromOther) {
          if (viewing) {
            clearConversationUnread(queryClient, mapped.conversationId);
          } else {
            bumpConversationUnread(queryClient, {
              conversationId: mapped.conversationId,
              lastMessage: preview,
              lastMessageAt: mapped.createdAt,
            });
          }
        } else {
          updateConversationPreview(queryClient, {
            conversationId: mapped.conversationId,
            lastMessage: preview,
            lastMessageAt: mapped.createdAt,
          });
        }

        void queryClient.invalidateQueries({
          queryKey: ["chat", "conversations"],
        });
        refreshChatUnreadCache(queryClient);

        if (fromOther && !viewing) {
          void queryClient.invalidateQueries({ queryKey: ["notifications"] });

          const conversations = queryClient.getQueryData<ConversationsPage>([
            "chat",
            "conversations",
            "",
          ]);
          const peer = conversations?.conversations.find(
            (item) => item.id === mapped.conversationId
          )?.otherUser;
          const title = peer?.name ?? "New message";
          const body = previewFromChatMessage(mapped);

          pushToast({
            conversationId: mapped.conversationId,
            title,
            body,
            href: `/messages/${mapped.conversationId}`,
          });
          notifyChatMessageInBrowser({ title, body });
        }
      } catch {
        // ignore malformed
      }
    };

    const onTyping = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as {
          conversation_id?: number | string;
          user_id?: number | string;
          is_typing?: boolean;
        };
        const conversationId = Number(data.conversation_id);
        const userId = Number(data.user_id);
        if (!Number.isFinite(conversationId)) return;
        if (
          Number.isFinite(userId) &&
          currentUserRef.current != null &&
          userId === currentUserRef.current
        ) {
          return;
        }
        setTypingByConversation((prev) => ({
          ...prev,
          [conversationId]: Boolean(data.is_typing),
        }));
        if (data.is_typing) {
          window.setTimeout(() => {
            setTypingByConversation((prev) => {
              if (!prev[conversationId]) return prev;
              return { ...prev, [conversationId]: false };
            });
          }, 3500);
        }
      } catch {
        // ignore
      }
    };

    const onOnlineContacts = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as {
          online_users?: Array<{ user_id?: number | string }>;
        };
        const ids = new Set<number>();
        for (const row of data.online_users ?? []) {
          const id = Number(row.user_id);
          if (Number.isFinite(id)) ids.add(id);
        }
        if (active) setOnlineUserIds(ids);
        for (const id of ids) {
          patchAllConversationQueries(queryClient, (current) =>
            patchConversationOnline(current, id, true)
          );
        }
      } catch {
        // ignore
      }
    };

    const onUserOnline = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as { user_id?: number | string };
        const id = Number(data.user_id);
        if (Number.isFinite(id)) setOnline(id, true);
      } catch {
        // ignore
      }
    };

    const onUserOffline = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as { user_id?: number | string };
        const id = Number(data.user_id);
        if (Number.isFinite(id)) setOnline(id, false);
      } catch {
        // ignore
      }
    };

    const onListUpdate = () => {
      void queryClient.invalidateQueries({
        queryKey: ["chat", "conversations"],
      });
      void queryClient.invalidateQueries({ queryKey: ["chat", "unread"] });
    };

    const bindSource = (es: EventSource) => {
      es.addEventListener("socket_status", onStatus as EventListener);
      es.addEventListener("socket_error", onSocketError as EventListener);
      es.addEventListener("new_message", ((e: MessageEvent) =>
        ingestMessage(e)) as EventListener);
      es.addEventListener("message_sent", ((e: MessageEvent) =>
        ingestMessage(e, true)) as EventListener);
      es.addEventListener("conversation_list_update", onListUpdate);
      es.addEventListener("user_typing", onTyping as EventListener);
      es.addEventListener("online_contacts", onOnlineContacts as EventListener);
      es.addEventListener("user_online", onUserOnline as EventListener);
      es.addEventListener("user_offline", onUserOffline as EventListener);
      es.addEventListener("messages_read", onListUpdate);
    };

    const connect = () => {
      source?.close();
      source = new EventSource("/api/chat/stream");
      bindSource(source);

      source.onopen = () => {
        attempt = 0;
        if (active) setError(null);
      };

      source.onerror = () => {
        if (active) {
          setConnected(false);
          setError("Realtime disconnected — reconnecting…");
        }
        source?.close();
        if (!active) return;
        const delay = Math.min(30_000, 1000 * 2 ** Math.min(attempt, 5));
        attempt += 1;
        retryTimer = window.setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      active = false;
      if (retryTimer) window.clearTimeout(retryTimer);
      source?.close();
      setConnected(false);
    };
  }, [currentUserId, pushToast, queryClient, setOnline]);

  const value = useMemo<ChatRealtimeContextValue>(
    () => ({
      connected,
      error,
      onlineUserIds,
      isUserOnline: (userId) =>
        userId != null && Number.isFinite(userId)
          ? onlineUserIds.has(userId)
          : false,
      isPeerTyping: (conversationId) =>
        Boolean(typingByConversation[conversationId]),
      activeConversationId,
      setActiveConversationId,
    }),
    [
      connected,
      error,
      onlineUserIds,
      typingByConversation,
      activeConversationId,
    ]
  );

  return (
    <ChatRealtimeContext.Provider value={value}>
      {children}
    </ChatRealtimeContext.Provider>
  );
}

export function useChatRealtimeContext(): ChatRealtimeContextValue {
  const ctx = useContext(ChatRealtimeContext);
  if (!ctx) {
    return {
      connected: false,
      error: null,
      onlineUserIds: new Set(),
      isUserOnline: () => false,
      isPeerTyping: () => false,
      activeConversationId: null,
      setActiveConversationId: () => undefined,
    };
  }
  return ctx;
}
