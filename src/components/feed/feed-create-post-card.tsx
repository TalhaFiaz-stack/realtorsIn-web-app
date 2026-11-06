"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ImageIcon, RefreshCw, Video } from "lucide-react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

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
      className="rounded-[var(--radius)] border border-border bg-card px-4 py-3 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <Link href="/me" className="shrink-0" aria-label="Your profile">
          <Avatar className="h-10 w-10">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarPlaceholderFallback />
          </Avatar>
        </Link>

        <button
          type="button"
          onClick={() => onOpenCompose?.()}
          className="locale-text flex min-h-10 min-w-0 flex-1 items-center rounded-full bg-muted px-4 text-start text-sm text-muted-foreground transition-colors hover:bg-muted/80"
        >
          {t("Whats on your mind?")} {firstName}
        </button>

        <div className="hidden items-center gap-1 sm:flex">
          <button
            type="button"
            onClick={() => onOpenCompose?.("video")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-destructive transition-colors hover:bg-muted"
            aria-label="Create a video post"
            title="Video"
          >
            <Video className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onOpenCompose?.("photo")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-success transition-colors hover:bg-muted"
            aria-label="Add photo"
            title="Photo"
          >
            <ImageIcon className="h-5 w-5" />
          </button>
          {onRefresh ? (
            <button
              type="button"
              disabled={refreshing}
              onClick={() => onRefresh()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
              aria-label="Refresh feed"
              title="Refresh feed"
            >
              <RefreshCw
                className={cn("h-5 w-5", refreshing && "animate-spin")}
              />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
