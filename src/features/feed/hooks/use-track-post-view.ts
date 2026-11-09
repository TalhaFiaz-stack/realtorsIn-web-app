"use client";

import { useEffect } from "react";
import { bffRequest } from "@/lib/api/client";

const recent = new Map<number, number>();
const DEDUPE_MS = 30_000;

/** Mobile parity: `recordAnalyticsApi('post_detail_view')` when a post detail opens. */
export function useTrackPostDetailView(postId: number | null | undefined) {
  useEffect(() => {
    if (!postId) return;
    const now = Date.now();
    const last = recent.get(postId);
    if (last != null && now - last < DEDUPE_MS) return;
    recent.set(postId, now);
    void bffRequest({
      path: "analytics/record",
      method: "POST",
      data: { actionType: "post_detail_view", postId },
    }).catch(() => {
      /* best-effort */
    });
  }, [postId]);
}
