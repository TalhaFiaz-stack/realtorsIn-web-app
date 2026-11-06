"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const LISTINGS_OFF_PLAN_HREF = "/listings?tab=off-plan";

export function OffPlanDetailBackButton({
  className,
  variant = "hero",
}: {
  className?: string;
  /** `hero` = floating control on the gallery; `inline` = text row above content */
  variant?: "hero" | "inline";
}) {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (typeof window === "undefined") {
      router.push(LISTINGS_OFF_PLAN_HREF);
      return;
    }
    try {
      const ref = document.referrer;
      if (ref && new URL(ref).origin === window.location.origin) {
        router.back();
        return;
      }
    } catch {
      /* ignore bad referrer */
    }
    router.push(LISTINGS_OFF_PLAN_HREF);
  }, [router]);

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleBack}
        className={cn(
          "mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground",
          className
        )}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to listings
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={handleBack}
      className={cn(
        "absolute start-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/95 text-foreground shadow-md backdrop-blur transition hover:bg-card",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
    </button>
  );
}

/** Fallback for no-JS / middle-click open in new tab */
export function OffPlanDetailBackLink({ className }: { className?: string }) {
  return (
    <Link
      href={LISTINGS_OFF_PLAN_HREF}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:start-3 focus:top-3 focus:z-30",
        className
      )}
    >
      Back to listings
    </Link>
  );
}
