"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { PostCard } from "@/components/feed/post-card";
import { PostReactionsDialog } from "@/components/feed/post-reactions-dialog";
import { PostCommentsDialog } from "@/components/feed/post-comments-dialog";
import {
  ActivityFeedPostSkeleton,
  ActivityPostsShimmer,
} from "@/components/activities/activity-shimmers";
import { ErrorState } from "@/components/states/error-state";
import {
  removePostFromActivityPostsCache,
  refreshActivitySummary,
} from "@/features/activities/lib/activity-list-cache";
import {
  activityErrorMessage,
  useActivityPosts,
} from "@/features/activities/hooks/use-activities";
import type { ActivityPostsKind } from "@/features/activities/types/activity.types";
import { useToggleLike, useToggleSave } from "@/features/feed/hooks/use-feed";
import { useOwnProfile } from "@/features/profile/hooks/use-profile";

const EMPTY_COPY: Record<
  ActivityPostsKind,
  { title: string; description: string; Icon: typeof Bookmark }
> = {
  saved: {
    title: "No saved posts",
    description: "Save posts from the feed to find them later.",
    Icon: Bookmark,
  },
};

type ActivityPostsQuery = ReturnType<typeof useActivityPosts>;

export function ActivityPostsScreen({
  kind,
  query: queryProp,
}: {
  kind: ActivityPostsKind;
  query?: ActivityPostsQuery;
}) {
  const queryClient = useQueryClient();
  const fallbackQuery = useActivityPosts(kind);
  const query = queryProp ?? fallbackQuery;
  const { data: profile } = useOwnProfile();
  const likeMutation = useToggleLike();
  const saveMutation = useToggleSave();
  const [commentsPostId, setCommentsPostId] = useState<number | null>(null);
  const [reactionsPostId, setReactionsPostId] = useState<number | null>(null);
  const viewerName =
    profile?.fullName || profile?.name || profile?.userName || "Member";
  const viewerAvatarUrl = profile?.profileImage?.url ?? null;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const posts = useMemo(
    () => query.data?.pages.flatMap((p) => p.posts) ?? [],
    [query.data?.pages]
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !query.hasNextPage || query.isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void query.fetchNextPage();
        }
      },
      { rootMargin: "240px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [query]);

  if (query.isLoading) {
    return <ActivityPostsShimmer count={3} />;
  }

  if (query.isError) {
    return (
      <ErrorState
        title="Could not load posts"
        description={activityErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (posts.length === 0) {
    const copy = EMPTY_COPY[kind];
    const Icon = copy.Icon;
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center px-8 py-12 text-center">
        <Icon
          className="h-20 w-20 stroke-[1.25] text-muted-foreground/35"
          aria-hidden
        />
        <p className="mt-5 text-[22px] font-semibold text-foreground">
          {copy.title}
        </p>
        <p className="mt-2.5 text-sm text-muted-foreground">
          {copy.description}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            saving={
              saveMutation.isPending && saveMutation.variables === post.id
            }
            onLike={(input) =>
              likeMutation.mutate(input, {
                onSuccess: (result) => {
                  refreshActivitySummary(queryClient);
                },
              })
            }
            onSave={(id) =>
              saveMutation.mutate(id, {
                onSuccess: (result) => {
                  if (kind === "saved" && !result.isSaved) {
                    removePostFromActivityPostsCache(
                      queryClient,
                      "saved",
                      id
                    );
                  }
                  refreshActivitySummary(queryClient);
                },
              })
            }
            onReport={() => {}}
            onComment={setCommentsPostId}
            onReactions={setReactionsPostId}
            reactionPickerPortal
          />
        ))}
        {query.isFetchingNextPage ? <ActivityFeedPostSkeleton /> : null}
        <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      </div>
      <PostReactionsDialog
        postId={reactionsPostId}
        open={reactionsPostId != null}
        onOpenChange={(open) => {
          if (!open) setReactionsPostId(null);
        }}
      />
      <PostCommentsDialog
        postId={commentsPostId}
        open={commentsPostId != null}
        viewerName={viewerName}
        viewerAvatarUrl={viewerAvatarUrl}
        onOpenChange={(open) => {
          if (!open) setCommentsPostId(null);
        }}
      />
    </>
  );
}
