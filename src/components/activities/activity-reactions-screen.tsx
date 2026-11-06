"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Heart } from "lucide-react";
import { ActivityLikedTextPostCard } from "@/components/activities/activity-liked-text-post-card";
import { ActivityReactionsFilters } from "@/components/activities/activity-reactions-filters";
import {
  ActivityFeedPostSkeleton,
  ActivityPostsShimmer,
} from "@/components/activities/activity-shimmers";
import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  refreshActivitySummary,
  removePostsFromReactionsCache,
} from "@/features/activities/lib/activity-list-cache";
import {
  activityErrorMessage,
  useActivityReactions,
} from "@/features/activities/hooks/use-activities";
import { unlikeActivityPostsRequest } from "@/features/activities/services/activities.client";
import type { ActivityReactionsFilter } from "@/features/activities/types/reactions.types";
import type { FeedPost } from "@/features/feed/types/post.types";
import { RemoteImg } from "@/components/shared/remote-img";
import { cn } from "@/lib/utils";

function splitPosts(posts: FeedPost[]) {
  const imagePosts = posts.filter((p) => p.images.length > 0);
  const textPosts = posts.filter((p) => p.images.length === 0);
  return { imagePosts, textPosts };
}

function PhotoGridCell({
  post,
  selectMode,
  selected,
  onToggleSelect,
}: {
  post: FeedPost;
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  const url = post.images[0]?.url;
  const inner = url ? (
    <RemoteImg
      src={url}
      alt=""
      wrapperClassName="aspect-square w-full"
      className="aspect-square h-full w-full object-cover"
    />
  ) : (
    <div className="flex aspect-square w-full items-center justify-center bg-muted text-xs text-muted-foreground">
      No image
    </div>
  );

  if (selectMode) {
    return (
      <button
        type="button"
        className={cn(
          "relative overflow-hidden rounded-sm",
          selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
        onClick={onToggleSelect}
      >
        {inner}
        <span
          className={cn(
            "absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded border bg-background/90",
            selected && "border-primary bg-primary text-primary-foreground"
          )}
        >
          {selected ? <Check className="h-3 w-3" /> : null}
        </span>
      </button>
    );
  }

  return (
    <Link
      href={`/posts/${post.id}`}
      className="block overflow-hidden rounded-sm"
    >
      {inner}
    </Link>
  );
}

type ReactionsQuery = ReturnType<typeof useActivityReactions>;

export function ActivityReactionsScreen({
  filter,
  onFilterChange,
  selectMode,
  onSelectModeChange,
  query: queryProp,
  canSelect = true,
}: {
  filter: ActivityReactionsFilter;
  onFilterChange: (f: ActivityReactionsFilter) => void;
  selectMode: boolean;
  onSelectModeChange: (v: boolean) => void;
  query?: ReactionsQuery;
  canSelect?: boolean;
}) {
  const queryClient = useQueryClient();
  const fallbackQuery = useActivityReactions(filter);
  const query = queryProp ?? fallbackQuery;
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const posts = useMemo(
    () => query.data?.pages.flatMap((p) => p.posts) ?? [],
    [query.data?.pages]
  );
  const { imagePosts, textPosts } = useMemo(
    () => splitPosts(posts),
    [posts]
  );

  const unlikeMutation = useMutation({
    mutationFn: (ids: number[]) => unlikeActivityPostsRequest(ids),
    onSuccess: (_data, ids) => {
      removePostsFromReactionsCache(queryClient, ids);
      refreshActivitySummary(queryClient);
      setSelectedIds([]);
      onSelectModeChange(false);
    },
  });

  useEffect(() => {
    setSelectedIds([]);
  }, [filter, selectMode]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !query.hasNextPage || query.isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void query.fetchNextPage();
      },
      { rootMargin: "240px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [query]);

  function toggleSelect(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelectMode() {
    onSelectModeChange(!selectMode);
  }

  if (query.isLoading) {
    return (
      <div className="space-y-3">
        <ActivityReactionsFilters
          value={filter}
          onChange={onFilterChange}
          disabled
          selectMode={selectMode}
          onSelectModeToggle={toggleSelectMode}
          selectActionDisabled
        />
        {filter === "photos" ? (
          <div className="grid grid-cols-3 gap-0.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-sm" />
            ))}
          </div>
        ) : (
          <ActivityPostsShimmer count={3} />
        )}
      </div>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        title="Could not load reactions"
        description={activityErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <div className="relative space-y-4 pb-20">
      <ActivityReactionsFilters
        value={filter}
        onChange={onFilterChange}
        disabled={query.isFetching || selectMode}
        selectMode={selectMode}
        onSelectModeToggle={toggleSelectMode}
        selectActionDisabled={!canSelect}
      />

      {posts.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center px-8 py-12 text-center">
          <Heart
            className="h-20 w-20 stroke-[1.25] text-muted-foreground/35"
            aria-hidden
          />
          <p className="mt-5 text-[22px] font-semibold text-foreground">
            No reactions yet
          </p>
          <p className="mt-2.5 text-sm text-muted-foreground">
            Posts you&apos;ve reacted to will appear here
          </p>
        </div>
      ) : (
        <>
          {filter !== "text" && imagePosts.length > 0 ? (
            <section>
              <header className="mb-2 flex items-center justify-between px-0.5">
                <h2 className="text-lg font-bold text-foreground">Photos</h2>
                <span className="text-sm text-muted-foreground">
                  {imagePosts.length} posts
                </span>
              </header>
              <div className="grid grid-cols-3 gap-0.5">
                {imagePosts.map((post) => (
                  <PhotoGridCell
                    key={post.id}
                    post={post}
                    selectMode={selectMode}
                    selected={selectedIds.includes(post.id)}
                    onToggleSelect={() => toggleSelect(post.id)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {filter !== "photos" && textPosts.length > 0 ? (
            <section>
              <header className="mb-2 flex items-center justify-between px-0.5">
                <h2 className="text-lg font-bold text-foreground">Posts</h2>
                <span className="text-sm text-muted-foreground">
                  {textPosts.length} posts
                </span>
              </header>
              <div className="space-y-3">
                {textPosts.map((post) => (
                  <ActivityLikedTextPostCard
                    key={post.id}
                    post={post}
                    selectMode={selectMode}
                    selected={selectedIds.includes(post.id)}
                    onToggleSelect={() => toggleSelect(post.id)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {query.isFetchingNextPage ? <ActivityFeedPostSkeleton /> : null}
          <div ref={sentinelRef} className="h-px w-full" aria-hidden />
        </>
      )}

      {selectMode && selectedIds.length > 0 ? (
        <div className="fixed bottom-6 left-1/2 z-40 w-full max-w-sm -translate-x-1/2 px-4">
          <Button
            type="button"
            className="w-full shadow-lg"
            disabled={unlikeMutation.isPending}
            onClick={() => unlikeMutation.mutate(selectedIds)}
          >
            {unlikeMutation.isPending
              ? "Removing…"
              : `(${selectedIds.length}) Unlike`}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
