"use client";

import { useCallback, useEffect, useState } from "react";
import {
  disableWebPush,
  enableWebPush,
  hasStoredWebPushToken,
  isWebPushSupported,
} from "@/features/push/services/web-push.client";
import { showAppToast } from "@/lib/toast/app-toast";

export type WebPushState =
  | "loading"
  | "unsupported"
  | "denied"
  | "off"
  | "on";

/** Settings toggle state for browser notifications. */
export function useWebPush() {
  const [state, setState] = useState<WebPushState>("loading");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!(await isWebPushSupported())) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    setState(
      Notification.permission === "granted" && hasStoredWebPushToken() ? "on" : "off"
    );
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const enable = useCallback(async () => {
    setBusy(true);
    try {
      const permission = await enableWebPush();
      if (permission === "denied") {
        showAppToast.error(
          "Notifications blocked",
          "Allow notifications for this site in your browser settings."
        );
      } else if (permission === "granted") {
        showAppToast.success("Browser notifications on");
      }
    } catch (error) {
      showAppToast.fromError(error, "Could not turn on notifications");
    } finally {
      setBusy(false);
      void refresh();
    }
  }, [refresh]);

  const disable = useCallback(async () => {
    setBusy(true);
    try {
      await disableWebPush();
      showAppToast.success("Browser notifications off");
    } finally {
      setBusy(false);
      void refresh();
    }
  }, [refresh]);

  return { state, busy, enable, disable };
}
