"use client";

import { useEffect, useRef } from "react";

type Options = {
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  isLoading?: boolean;
  fetchNextPage: () => void | Promise<unknown>;
  enabled?: boolean;
  rootMargin?: string;
  /** Re-bind when list length changes (new pages appended). */
  itemCount?: number;
};

/** Observes a sentinel and calls `fetchNextPage` when near the viewport (feed-style). */
export function useInfiniteScrollTrigger({
  hasNextPage,
  isFetchingNextPage,
  isLoading = false,
  fetchNextPage,
  enabled = true,
  rootMargin = "320px",
  itemCount = 0,
}: Options) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled || isLoading) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [
    enabled,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    rootMargin,
    itemCount,
  ]);

  return sentinelRef;
}
