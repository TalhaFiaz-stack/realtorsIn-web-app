"use client";

import { useMemo, useState } from "react";
import { FeedCreateStoryCard } from "@/components/feed/feed-create-story-card";
import { CreateStoryDialog } from "@/components/stories/create-story-dialog";
import { StoryAvatar } from "@/components/stories/story-avatar";
import { StoryViewer } from "@/components/stories/story-viewer";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoriesFeed } from "@/features/stories/hooks/use-stories";
import { cn } from "@/lib/utils";

export function StoriesRail() {
  const feedQuery = useStoriesFeed();
  const [createOpen, setCreateOpen] = useState(false);
  const [viewerUserId, setViewerUserId] = useState<number | null>(null);

  const groups = feedQuery.data?.groups ?? [];
  const others = useMemo(
    () =>
      groups
        .filter((group) => !group.isOwn)
        .slice()
        .sort((a, b) => {
          if (a.hasUnseen && !b.hasUnseen) return -1;
          if (!a.hasUnseen && b.hasUnseen) return 1;
          return 0;
        }),
    [groups]
  );
  const own = groups.find((group) => group.isOwn) ?? null;
  const showRail =
    feedQuery.isLoading || Boolean(own) || others.length > 0;
  // The rail already starts with a "Create story" bubble — only show the big
  // promo card when there are no stories at all (rail hidden).
  const showPromo = !feedQuery.isLoading && !showRail;

  return (
    <>
      {showPromo || showRail ? (
        <div
          className={cn(
            "flex flex-col",
            showPromo && showRail && "gap-3"
          )}
        >
          {showPromo ? (
            <FeedCreateStoryCard onCreate={() => setCreateOpen(true)} />
          ) : null}

          {feedQuery.isLoading ? (
            <div className="flex gap-3 overflow-hidden px-1 py-1">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="flex w-[72px] flex-col items-center gap-1.5"
                >
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          ) : null}

          {!feedQuery.isLoading && (own || others.length > 0) ? (
            <div
              className="locale-scroll-ltr flex gap-2 overflow-x-auto px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Stories"
            >
              <StoryAvatar
                name="Create story"
                isCreate
                onClick={() => setCreateOpen(true)}
              />
              {own ? (
                <StoryAvatar
                  name="Your story"
                  avatarUrl={own.avatarUrl}
                  hasUnseen={own.hasUnseen}
                  stories={own.stories}
                  onClick={() => setViewerUserId(own.userId)}
                />
              ) : null}
              {others.map((group) => (
                <StoryAvatar
                  key={group.userId}
                  name={group.name}
                  avatarUrl={group.avatarUrl}
                  hasUnseen={group.hasUnseen}
                  stories={group.stories}
                  onClick={() => setViewerUserId(group.userId)}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <CreateStoryDialog open={createOpen} onOpenChange={setCreateOpen} />
      <StoryViewer
        open={viewerUserId != null}
        groups={groups}
        startUserId={viewerUserId}
        onClose={() => setViewerUserId(null)}
      />
    </>
  );
}
