"use client";

import { AlertTriangle } from "lucide-react";
import { RetryButton } from "@/components/states/retry-button";
import { cn } from "@/lib/utils";

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this content.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-10 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry ? <RetryButton onRetry={onRetry} /> : null}
    </div>
  );
}
