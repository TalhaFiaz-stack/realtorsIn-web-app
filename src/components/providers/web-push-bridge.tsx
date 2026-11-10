"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  getWebMessaging,
  isWebPushOptedOut,
  isWebPushSupported,
  syncWebPushToken,
} from "@/features/push/services/web-push.client";
import { resolvePushPath } from "@/lib/push/resolve-push-path";
import { showAppToast } from "@/lib/toast/app-toast";
import { bffRequest } from "@/lib/api/client";

/**
 * Signed-in shell bridge for browser push:
 * - refreshes the FCM token when permission is already granted (never prompts)
 * - foreground messages → in-app toast + refresh notification badges
 * - service-worker click messages → client-side navigation
 */
export function WebPushBridge() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    const onSwMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; path?: string } | null;
      if (data?.type === "rin-push-navigate" && typeof data.path === "string") {
        if (data.path.startsWith("/")) router.push(data.path);
      }
    };
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", onSwMessage);
    }

    void (async () => {
      if (!(await isWebPushSupported())) return;
      // Mobile parity: once the browser allows notifications, register this
      // browser on every sign-in (logout clears the stored token) — unless
      // the member switched web push off in Settings.
      if (Notification.permission !== "granted" || isWebPushOptedOut()) return;
      try {
        await syncWebPushToken();
        const [{ onMessage }, messaging] = await Promise.all([
          import("firebase/messaging"),
          getWebMessaging(),
        ]);
        if (cancelled) return;
        unsubscribe = onMessage(messaging, (payload) => {
          const data = (payload.data ?? {}) as Record<string, string>;
          void queryClient.invalidateQueries({ queryKey: ["notifications"] });
          const title = data.title || "RealtorsIn";
          showAppToast.success(title, data.body || undefined);
          if (data.push_notification_id) {
            // Shown in-app = opened, same as a tap on mobile while foregrounded.
            void bffRequest({
              path: `notifications/push-read/${encodeURIComponent(data.push_notification_id)}`,
              method: "POST",
              data: {},
            }).catch(() => undefined);
          }
          // Keep the path warm for a quick follow-up click from the toast/badge.
          router.prefetch(resolvePushPath(data));
        });
      } catch {
        /* push is best-effort */
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", onSwMessage);
      }
    };
  }, [router, queryClient]);

  return null;
}
