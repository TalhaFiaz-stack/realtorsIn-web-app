"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MessageCircle, X } from "lucide-react";
import { useChatToastStore } from "@/features/chat/store/chat-toast.store";
import { cn } from "@/lib/utils";

export function ChatToastHost() {
  const toasts = useChatToastStore((state) => state.toasts);
  const dismiss = useChatToastStore((state) => state.dismiss);

  useEffect(() => {
    if (toasts.length === 0) return;
    const latest = toasts[toasts.length - 1];
    const timer = window.setTimeout(() => dismiss(latest.id), 4500);
    return () => window.clearTimeout(timer);
  }, [toasts, dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-20 right-3 z-[60] flex w-[min(22rem,calc(100vw-1.5rem))] flex-col gap-2 md:bottom-6"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-lg"
          )}
        >
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageCircle className="h-4 w-4" />
          </span>
          <Link
            href={toast.href}
            className="min-w-0 flex-1"
            onClick={() => dismiss(toast.id)}
          >
            <p className="truncate text-sm font-semibold text-foreground">
              {toast.title}
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {toast.body}
            </p>
          </Link>
          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Dismiss"
            onClick={() => dismiss(toast.id)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
