"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeedPullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  threshold = 72,
}: {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}) {
  if (pullDistance <= 0 && !isRefreshing) return null;

  const progress = Math.min(1, pullDistance / threshold);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-30 flex justify-center md:hidden"
      style={{ top: "calc(3.5rem + env(safe-area-inset-top, 0px))" }}
      aria-hidden={!isRefreshing}
      aria-live="polite"
      aria-busy={isRefreshing}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-transform duration-150",
          isRefreshing && "scale-100"
        )}
        style={{
          transform: `translateY(${Math.min(pullDistance, 48)}px) scale(${0.85 + progress * 0.15})`,
          opacity: isRefreshing ? 1 : 0.35 + progress * 0.65,
        }}
      >
        <Loader2
          className={cn(
            "h-5 w-5 text-primary",
            isRefreshing && "animate-spin"
          )}
          style={{
            transform: isRefreshing ? undefined : `rotate(${progress * 320}deg)`,
          }}
        />
      </div>
    </div>
  );
}
