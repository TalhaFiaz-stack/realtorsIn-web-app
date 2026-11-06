"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { showAppToast } from "@/lib/toast/app-toast";
import {
  archiveConversationRequest,
  deleteConversationRequest,
  emitTypingRequest,
  fetchChatUnread,
  fetchConversations,
  fetchMessages,
  joinConversationSocketRequest,
  markReadRequest,
  muteConversationRequest,
  pinConversationRequest,
  sendDocumentRequest,
  sendImageRequest,
  sendMessageRequest,
  startConversationRequest,
  uploadChatFileRequest,
} from "@/features/chat/services/chat.client";
import { ApiError } from "@/lib/api/errors";
import { normalizeNavBadgeCount } from "@/lib/navigation/nav-badge";
import { useChatRealtimeContext } from "@/features/chat/hooks/chat-realtime-context";
import {
  clearConversationUnread,
  syncChatUnreadFromInboxCaches,
  updateConversationPreview,
} from "@/features/chat/lib/patch-conversations-cache";

/** Fallback poll when the Socket.IO bridge is disconnected. */
export const CHAT_POLL_MS = 20_000;

function canPoll() {
  if (typeof document === "undefined") return true;
  if (document.visibilityState === "hidden") return false;
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return false;
  }
  return true;
}

export function useChatUnread() {
  const realtime = useChatRealtimeContext();
  return useQuery({
    queryKey: ["chat", "unread"],
    queryFn: async ({ signal }) => {
      const result = await fetchChatUnread(signal);
      return {
        ...result,
        totalUnread: normalizeNavBadgeCount(result.totalUnread),
        conversationsWithUnread: normalizeNavBadgeCount(
          result.conversationsWithUnread
        ),
      };
    },
    // Live SSE invalidates this on new_message; poll only as fallback.
    refetchInterval: () =>
      realtime.connected || !canPoll() ? false : CHAT_POLL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useConversations(options?: {
  realtimeConnected?: boolean;
  search?: string;
}) {
  const realtime = useChatRealtimeContext();
  const live = options?.realtimeConnected ?? realtime.connected;
  const search = options?.search?.trim() || undefined;
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["chat", "conversations", search ?? ""],
    queryFn: async ({ signal }) => {
      const page = await fetchConversations(1, signal, search);
      if (!search) {
        syncChatUnreadFromInboxCaches(queryClient);
      }
      return page;
    },
    refetchInterval: live ? false : CHAT_POLL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useConversationActions() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
  };

  const pin = useMutation({
    mutationFn: pinConversationRequest,
    onSuccess: invalidate,
  });
  const mute = useMutation({
    mutationFn: muteConversationRequest,
    onSuccess: invalidate,
  });
  const archive = useMutation({
    mutationFn: archiveConversationRequest,
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: deleteConversationRequest,
    onSuccess: invalidate,
  });

  return { pin, mute, archive, remove };
}

export function useEmitTyping(conversationId: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const send = useCallback(
    async (isTyping: boolean) => {
      if (lastSentRef.current === isTyping && isTyping) return;
      lastSentRef.current = isTyping;
      try {
        await emitTypingRequest({ conversationId, isTyping });
      } catch {
        // Non-blocking — typing is best-effort.
      }
    },
    [conversationId]
  );

  useEffect(() => () => clearTimer(), [clearTimer]);

  return {
    onDraftChange(value: string) {
      const hasText = value.trim().length > 0;
      if (hasText) {
        void send(true);
        clearTimer();
        timerRef.current = setTimeout(() => {
          void send(false);
        }, 2800);
      } else {
        clearTimer();
        void send(false);
      }
    },
    stop() {
      clearTimer();
      void send(false);
    },
  };
}

export function useJoinConversationRoom(conversationId: number) {
  useEffect(() => {
    if (!conversationId) return;
    void joinConversationSocketRequest(conversationId, "join").catch(() => {
      // best-effort
    });
    return () => {
      void joinConversationSocketRequest(conversationId, "leave").catch(() => {
        // best-effort
      });
    };
  }, [conversationId]);
}

export function useMessages(
  conversationId: number,
  options?: { realtimeConnected?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ["chat", "messages", conversationId],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      fetchMessages(conversationId, pageParam, signal),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    refetchInterval: options?.realtimeConnected ? false : CHAT_POLL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => startConversationRequest(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
    onError: (error) =>
      showAppToast.fromError(error, "Could not open conversation"),
  });
}

export function useSendMessage(conversationId: number) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["chat", "messages", conversationId],
    });
    void queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
  };

  return useMutation({
    mutationFn: sendMessageRequest,
    onSuccess: (result, variables) => {
      updateConversationPreview(queryClient, {
        conversationId,
        lastMessage: result.message.content,
        lastMessageAt: result.message.createdAt,
      });
      invalidate();
    },
  });
}

export function useSendChatMedia(conversationId: number) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["chat", "messages", conversationId],
    });
    void queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
  };

  const sendImage = useMutation({
    mutationFn: async (input: {
      receiverId: number;
      files: File[];
      caption?: string;
    }) => {
      const uploaded = [];
      for (const file of input.files) {
        uploaded.push(await uploadChatFileRequest(file));
      }
      return sendImageRequest({
        receiverId: input.receiverId,
        imageUrls: uploaded.map((item) => item.fileUrl),
        messageContent: input.caption,
      });
    },
    onSuccess: invalidate,
  });

  const sendDocument = useMutation({
    mutationFn: async (input: {
      receiverId: number;
      file: File;
      caption?: string;
    }) => {
      const uploaded = await uploadChatFileRequest(input.file);
      return sendDocumentRequest({
        receiverId: input.receiverId,
        documentUrl: uploaded.fileUrl,
        documentName: uploaded.fileName,
        documentSize: uploaded.fileSize,
        messageContent: input.caption,
      });
    },
    onSuccess: invalidate,
  });

  return { sendImage, sendDocument };
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: number) => markReadRequest(conversationId),
    onMutate: (conversationId) => {
      clearConversationUnread(queryClient, conversationId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
      void queryClient.invalidateQueries({ queryKey: ["chat", "unread"] });
    },
  });
}

export function chatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
