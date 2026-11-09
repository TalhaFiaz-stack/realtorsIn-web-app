"use client";

import { BellRing } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useWebPush } from "@/features/push/hooks/use-web-push";

const HINT: Record<string, string> = {
  loading: "Checking this browser…",
  unsupported:
    "This browser or site setup doesn't support push notifications.",
  denied:
    "Notifications are blocked. Allow them for this site in your browser settings.",
  off: "Get likes, comments, messages and announcements on this device.",
  on: "This browser receives RealtorsIn notifications.",
};

/** Browser push toggle (web token is separate from your phone's). */
export function BrowserNotificationsCard() {
  const { state, busy, enable, disable } = useWebPush();
  const checked = state === "on";
  const disabled = busy || state === "loading" || state === "unsupported" || state === "denied";

  return (
    <div className="mb-4 flex items-start gap-3 rounded-lg border border-border bg-card p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
        <BellRing className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Browser notifications</p>
        <p className="text-xs text-muted-foreground">{HINT[state]}</p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        aria-label="Browser notifications"
        onCheckedChange={(next) => void (next ? enable() : disable())}
      />
    </div>
  );
}
