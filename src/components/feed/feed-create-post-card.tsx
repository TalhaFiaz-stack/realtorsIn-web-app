"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ImageIcon, RefreshCw, Video } from "lucide-react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function FeedCreatePostCard({
  displayName,
  avatarUrl,
  onOpenCompose,
  onRefresh,
  refreshing,
}: {
  displayName: string;
  avatarUrl?: string | null;
  onOpenCompose?: (attach?: "photo" | "video") => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const { t } = useTranslation();
  const firstName = displayName.trim().split(/\s+/)[0] || "there";

  return (
    <section
      aria-label="Create a post"
      className="rounded-[var(--radius)] border border-border bg-card px-4 pb-2 pt-3 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <Link href="/me" className="shrink-0" aria-label="Your profile">
          <Avatar className="h-11 w-11">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarPlaceholderFallback />
          </Avatar>
        </Link>

        <button
          type="button"
          onClick={() => onOpenCompose?.()}
          className="locale-text flex h-11 min-w-0 flex-1 items-center rounded-full border border-border bg-background px-4 text-start text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60"
        >
          <span className="truncate">{t("What's on your mind, {{name}}?", { name: firstName })}</span>
        </button>
      </div>

      <div className="mt-2 flex items-center gap-1">
        <button
          type="button"
          onClick={() => onOpenCompose?.("photo")}
          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-foreground/80 transition-colors hover:bg-muted sm:flex-none sm:px-4"
        >
          <ImageIcon className="h-5 w-5 text-sky-500" aria-hidden />
          {t("Photo")}
        </button>
        <button
          type="button"
          onClick={() => onOpenCompose?.("video")}
          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-foreground/80 transition-colors hover:bg-muted sm:flex-none sm:px-4"
        >
          <Video className="h-5 w-5 text-emerald-500" aria-hidden />
          {t("Video")}
        </button>
        {onRefresh ? (
          <button
            type="button"
            disabled={refreshing}
            onClick={() => onRefresh()}
            className="ms-auto inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
            aria-label="Refresh feed"
            title="Refresh feed"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} aria-hidden />
            <span className="hidden sm:inline">{refreshing ? "Refreshing…" : "Refresh"}</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
