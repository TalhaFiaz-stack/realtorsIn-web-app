"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import {
  useAppToastStore,
  type AppToastItem,
} from "@/lib/toast/app-toast.store";
import { defaultToastDescription } from "@/lib/toast/toast-default-description";
import { cn } from "@/lib/utils";

const AUTO_DISMISS_MS = 4500;

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: AppToastItem;
  onDismiss: (id: string) => void;
}) {
  const isSuccess = toast.variant === "success";
  const description =
    toast.description?.trim() ||
    defaultToastDescription(toast.variant, toast.title);

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-card p-3 shadow-lg",
        isSuccess ? "border-success/40" : "border-destructive/40"
      )}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isSuccess
            ? "bg-success/15 text-success"
            : "bg-destructive/10 text-destructive"
        )}
      >
        {isSuccess ? (
          <CheckCircle2 className="h-4 w-4" aria-hidden />
        ) : (
          <AlertCircle className="h-4 w-4" aria-hidden />
        )}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        <p className="mt-0.5 line-clamp-3 text-xs text-muted-foreground">
          {description}
        </p>
      </div>
      <button
        type="button"
        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AppToastHost() {
  const toasts = useAppToastStore((state) => state.toasts);
  const dismiss = useAppToastStore((state) => state.dismiss);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismiss(toast.id), AUTO_DISMISS_MS)
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [toasts, dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-[70] flex flex-col items-center gap-2 px-3 md:items-end md:pr-6"
      aria-live="polite"
      aria-relevant="additions"
    >
      <div className="flex w-full max-w-sm flex-col gap-2 md:w-[min(22rem,100%)]">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </div>
  );
}
