"use client";

import { WifiOff } from "lucide-react";
import { RetryButton } from "@/components/states/retry-button";

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-10 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <WifiOff className="h-5 w-5 text-muted-foreground" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Connection problem</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Check your network and try again.
        </p>
      </div>
      {onRetry ? <RetryButton onRetry={onRetry} /> : null}
    </div>
  );
}
