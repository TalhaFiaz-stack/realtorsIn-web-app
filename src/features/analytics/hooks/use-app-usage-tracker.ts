"use client";

import { useEffect } from "react";

const MIN_SECONDS = 2;

function send(start: Date, end: Date) {
  const durationSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
  if (durationSeconds < MIN_SECONDS) return;
  try {
    // keepalive lets the request finish while the tab hides or unloads.
    void fetch("/api/analytics/app-session", {
      method: "POST",
      credentials: "include",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionStart: start.toISOString(),
        sessionEnd: end.toISOString(),
        durationSeconds,
      }),
    }).catch(() => undefined);
  } catch {
    /* best-effort */
  }
}

/**
 * Mobile `useAppUsageTracker` parity: one session per visible stretch of the
 * tab, reported when the tab is hidden or closed.
 */
export function useAppUsageTracker() {
  useEffect(() => {
    let start: Date | null =
      document.visibilityState === "visible" ? new Date() : null;

    const end = () => {
      if (!start) return;
      const s = start;
      start = null;
      send(s, new Date());
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        if (!start) start = new Date();
      } else {
        end();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", end);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", end);
      end();
    };
  }, []);
}
