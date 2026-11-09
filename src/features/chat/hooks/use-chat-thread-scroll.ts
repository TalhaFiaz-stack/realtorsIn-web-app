"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/** Within this distance of the bottom the thread "sticks" to new messages. */
const STICKY_THRESHOLD_PX = 120;
/** Start loading older messages this close to the top. */
const LOAD_OLDER_THRESHOLD_PX = 160;
/** After older messages render, keep the anchor fixed while images settle. */
const ANCHOR_HOLD_MS = 1500;

type Anchor = {
  id: string;
  offset: number;
  pageCount: number;
  started: boolean;
  holdUntil: number;
};

/**
 * Chat thread scrolling:
 * - opens at the bottom instantly (no animated scroll from the top)
 * - stays pinned while images/cards finish loading (ResizeObserver)
 * - follows new messages only when the reader is already at the bottom
 * - keeps the reader's place when older messages are prepended, anchored to
 *   the first visible message (`data-message-id`), even while images load
 * - reports whether to show a "jump to latest" button
 */
export function useChatThreadScroll(input: {
  conversationId: number;
  /** Changes when the newest tail of the thread changes (not when loading older pages). */
  tailKey: string;
  /** True once the first page has rendered for this conversation. */
  ready: boolean;
  canLoadOlder: boolean;
  loadingOlder: boolean;
  /** Number of loaded pages — grows when an older page is prepended. */
  pageCount: number;
  loadOlder: () => Promise<unknown>;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);
  const initialisedRef = useRef<number | null>(null);
  const anchorRef = useRef<Anchor | null>(null);
  const [atBottom, setAtBottom] = useState(true);

  const pinNow = useCallback(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const applyAnchor = useCallback(() => {
    const el = scrollerRef.current;
    const anchor = anchorRef.current;
    if (!el || !anchor) return;
    const node = el.querySelector<HTMLElement>(
      `[data-message-id="${CSS.escape(anchor.id)}"]`
    );
    if (!node) return;
    const current = node.getBoundingClientRect().top - el.getBoundingClientRect().top;
    const delta = current - anchor.offset;
    if (Math.abs(delta) >= 1) el.scrollTop += delta;
  }, []);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth", force = false) => {
      const el = scrollerRef.current;
      if (!el) return;
      if (!force && !stickToBottomRef.current) return;
      stickToBottomRef.current = true;
      anchorRef.current = null;
      setAtBottom(true);
      el.scrollTo({ top: el.scrollHeight, behavior });
    },
    []
  );

  const { canLoadOlder, loadingOlder, loadOlder, pageCount } = input;
  const requestOlder = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || !canLoadOlder || loadingOlder) return;
    if (anchorRef.current && !anchorRef.current.started && anchorRef.current.holdUntil === 0) {
      return; // a request is already pending
    }
    const top = el.getBoundingClientRect().top;
    const nodes = el.querySelectorAll<HTMLElement>("[data-message-id]");
    let first: HTMLElement | null = null;
    for (const node of nodes) {
      if (node.getBoundingClientRect().bottom > top) {
        first = node;
        break;
      }
    }
    if (!first?.dataset.messageId) return;
    anchorRef.current = {
      id: first.dataset.messageId,
      offset: first.getBoundingClientRect().top - top,
      pageCount,
      started: false,
      holdUntil: 0,
    };
    void loadOlder().catch(() => {
      anchorRef.current = null;
    });
  }, [canLoadOlder, loadingOlder, loadOlder, pageCount]);

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const stuck = distance <= STICKY_THRESHOLD_PX;
    stickToBottomRef.current = stuck;
    setAtBottom((prev) => (prev === stuck ? prev : stuck));
    if (el.scrollTop <= LOAD_OLDER_THRESHOLD_PX) requestOlder();
  }, [requestOlder]);

  // The reader takes over: stop holding the anchor.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const release = () => {
      const anchor = anchorRef.current;
      if (anchor && anchor.holdUntil > 0) anchorRef.current = null;
    };
    el.addEventListener("wheel", release, { passive: true });
    el.addEventListener("touchstart", release, { passive: true });
    el.addEventListener("keydown", release);
    return () => {
      el.removeEventListener("wheel", release);
      el.removeEventListener("touchstart", release);
      el.removeEventListener("keydown", release);
    };
  }, [input.ready]);

  // New conversation → reset; first render with data → jump to bottom instantly.
  useLayoutEffect(() => {
    if (!input.ready) return;
    if (initialisedRef.current === input.conversationId) return;
    initialisedRef.current = input.conversationId;
    stickToBottomRef.current = true;
    anchorRef.current = null;
    setAtBottom(true);
    pinNow();
  }, [input.conversationId, input.ready, pinNow]);

  // Older page prepended → put the anchor message back where it was (before paint).
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || anchor.holdUntil > 0) return;
    if (input.loadingOlder) {
      anchor.started = true;
      return;
    }
    if (input.pageCount > anchor.pageCount) {
      applyAnchor();
      anchor.holdUntil = Date.now() + ANCHOR_HOLD_MS;
      window.setTimeout(() => {
        if (anchorRef.current === anchor) anchorRef.current = null;
      }, ANCHOR_HOLD_MS);
    } else if (anchor.started) {
      anchorRef.current = null; // finished without a new page
    }
  });

  // New tail message → follow it only if the reader is at the bottom.
  useLayoutEffect(() => {
    if (initialisedRef.current !== input.conversationId) return;
    if (stickToBottomRef.current) scrollToBottom("smooth");
  }, [input.tailKey, input.conversationId, scrollToBottom]);

  // Content height changes (late images, cards): keep the anchor or stay pinned.
  useEffect(() => {
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const anchor = anchorRef.current;
      if (anchor && anchor.holdUntil > Date.now()) {
        applyAnchor();
        return;
      }
      if (!anchor && stickToBottomRef.current) pinNow();
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [input.ready, pinNow, applyAnchor]);

  return {
    scrollerRef,
    contentRef,
    onScroll,
    scrollToBottom,
    atBottom,
  };
}
