"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeedSuggestionSection({
  title,
  showAllHref,
  onDismiss,
  children,
  className,
}: {
  title: string;
  showAllHref?: string;
  onDismiss?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_2px_7px_rgba(15,23,42,0.04)] dark:shadow-none",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-3.5">
        <h2 className="locale-text text-sm font-semibold text-foreground">
          {title}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          {showAllHref ? (
            <Link
              href={showAllHref}
              className="locale-text text-xs font-semibold text-primary hover:underline"
            >
              See all
            </Link>
          ) : null}
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`Dismiss ${title}`}
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          ) : null}
        </div>
      </div>
      <div className="locale-scroll-ltr -mx-0.5 flex items-stretch gap-2.5 overflow-x-auto px-3 pb-3 pt-0.5 snap-x snap-mandatory scrollbar-thin sm:px-3.5">
        {children}
      </div>
    </section>
  );
}
