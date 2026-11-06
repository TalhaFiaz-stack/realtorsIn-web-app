"use client";

import { useChatRealtimeContext } from "@/features/chat/hooks/chat-realtime-context";

/**
 * Thread-scoped realtime view. Connection itself lives in ChatRealtimeProvider
 * (one SSE bridge for the whole authenticated shell).
 */
export function useChatRealtime(input: {
  conversationId: number;
  currentUserId?: number | null;
  enabled?: boolean;
}) {
  const realtime = useChatRealtimeContext();
  const enabled = input.enabled !== false;

  return {
    connected: enabled ? realtime.connected : false,
    error: enabled ? realtime.error : null,
    isPeerTyping: enabled
      ? realtime.isPeerTyping(input.conversationId)
      : false,
    isPeerOnline: false as boolean, // resolved by caller with otherUser.id
  };
}

export { useChatRealtimeContext };
