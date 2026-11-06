"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

const STICKY_THRESHOLD_PX = 96;

export function useChatThreadScroll(input: {
  conversationId: number;
  /** Changes when the newest tail of the thread changes (not when loading older pages). */
  tailKey: string;
  peerTyping: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);
  const programmaticScrollRef = useRef(false);
  const openedConversationRef = useRef<number | null>(null);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth", force = false) => {
      const el = scrollerRef.current;
      if (!el) return;
      if (!force && !stickToBottomRef.current) return;

      programmaticScrollRef.current = true;
      el.scrollTo({ top: el.scrollHeight, behavior });

      window.setTimeout(() => {
        programmaticScrollRef.current = false;
        if (force) stickToBottomRef.current = true;
      }, behavior === "smooth" ? 320 : 0);
    },
    []
  );

  const onScroll = useCallback(() => {
    if (programmaticScrollRef.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distance <= STICKY_THRESHOLD_PX;
  }, []);

  useLayoutEffect(() => {
    if (openedConversationRef.current !== input.conversationId) {
      openedConversationRef.current = input.conversationId;
      stickToBottomRef.current = true;
      scrollToBottom("auto", true);
    }
  }, [input.conversationId, scrollToBottom]);

  useLayoutEffect(() => {
    scrollToBottom("smooth");
  }, [input.tailKey, input.peerTyping, scrollToBottom]);

  return {
    scrollerRef,
    onScroll,
    scrollToBottom,
  };
}
