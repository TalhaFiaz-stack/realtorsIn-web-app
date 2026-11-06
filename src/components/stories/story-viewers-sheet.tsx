"use client";

import { Heart, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  storiesErrorMessage,
  useStoryViewers,
} from "@/features/stories/hooks/use-stories";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function StoryViewersSheet({
  open,
  storyId,
  onClose,
}: {
  open: boolean;
  storyId: number | null;
  onClose: () => void;
}) {
  const query = useStoryViewers(storyId, open);

  if (!open) return null;

  const total = query.data?.total ?? 0;
  const reactionCount = query.data?.reactionCount ?? 0;
  const viewers = query.data?.viewers ?? [];

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close viewers"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Story viewers"
        className="relative z-10 flex max-h-[min(70vh,520px)] w-full max-w-md flex-col rounded-t-2xl border border-border bg-card shadow-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {query.isLoading
                ? "Loading viewers…"
                : `${total} view${total === 1 ? "" : "s"}`}
            </h2>
            {!query.isLoading && reactionCount > 0 ? (
              <p className="text-xs text-muted-foreground">
                {reactionCount} like{reactionCount === 1 ? "" : "s"}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {query.isLoading ? (
            <ul className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, index) => (
                <li key={index} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {query.error ? (
            <p className="px-4 py-6 text-sm text-destructive" role="alert">
              {storiesErrorMessage(query.error)}
            </p>
          ) : null}

          {!query.isLoading && !query.error && viewers.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No views yet. Check back later.
            </p>
          ) : null}

          {!query.isLoading && viewers.length > 0 ? (
            <ul className="divide-y divide-border">
              {viewers.map((viewer) => (
                <li
                  key={viewer.userId}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <Avatar className="h-11 w-11">
                    {viewer.avatarUrl ? (
                      <AvatarImage src={viewer.avatarUrl} alt="" />
                    ) : null}
                    <AvatarPlaceholderFallback />
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {viewer.name}
                    </p>
                    {viewer.userName ? (
                      <p className="truncate text-xs text-muted-foreground">
                        @{viewer.userName}
                      </p>
                    ) : null}
                  </div>
                  <Heart
                    className={cn(
                      "h-4 w-4 shrink-0",
                      viewer.hasReacted
                        ? "fill-rose-500 text-rose-500"
                        : "text-transparent"
                    )}
                    aria-hidden={!viewer.hasReacted}
                    aria-label={viewer.hasReacted ? "Liked" : undefined}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
