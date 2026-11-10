"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type {
  ChatUser,
  ConversationsPage,
} from "@/features/chat/types/chat.types";

/** Best-effort peer from the conversations list cache (for instant thread chrome). */
export function useConversationPeerFromCache(
  conversationId: number
): ChatUser | null {
  const queryClient = useQueryClient();

  return useMemo(() => {
    const seeded = queryClient.getQueryData<ChatUser>([
      "chat",
      "peer",
      conversationId,
    ]);
    const entries = queryClient.getQueriesData<ConversationsPage>({
      queryKey: ["chat", "conversations"],
    });
    for (const [, data] of entries) {
      const match = data?.conversations.find((c) => c.id === conversationId);
      if (match) return match.otherUser;
    }
    return seeded ?? null;
  }, [queryClient, conversationId]);
}
