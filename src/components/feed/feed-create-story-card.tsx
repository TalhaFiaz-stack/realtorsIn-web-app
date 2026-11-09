"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

/**
 * Facebook-style create-story entry — blue + circle, no profile photo.
 */
export function FeedCreateStoryCard({
  href,
  onCreate,
}: {
  href?: string;
  onCreate?: () => void;
}) {
  const className =
    "flex w-full items-center gap-3 rounded-[var(--radius)] border border-border bg-card px-4 py-3 text-start shadow-sm transition-colors hover:bg-muted/30";

  const inner = (
    <>
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Plus className="h-6 w-6 stroke-[2.5]" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-foreground">Create story</p>
        <p className="text-sm text-muted-foreground">
          Share a photo or video or write something
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Create a story" className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onCreate}
      aria-label="Create a story"
      className={className}
    >
      {inner}
    </button>
  );
}
