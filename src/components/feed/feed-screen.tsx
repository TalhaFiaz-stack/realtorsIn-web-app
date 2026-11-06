"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CreatePostDialog } from "@/components/feed/create-post-dialog";
import { FeedCreatePostCard } from "@/components/feed/feed-create-post-card";
import { FeedListRow } from "@/components/feed/feed-list-row";
import { StoriesRail } from "@/components/stories/stories-rail";
import { PostRepostDialog } from "@/components/feed/post-repost-dialog";
import { PostReactionsDialog } from "@/components/feed/post-reactions-dialog";
import { PostSendDialog } from "@/components/feed/post-send-dialog";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { ReportPostDialog } from "@/components/feed/report-post-dialog";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";
import { FeedPullToRefreshIndicator } from "@/components/feed/feed-pull-to-refresh-indicator";
import {
  feedErrorMessage,
  useFeed,
  useToggleLike,
  useToggleSave,
  type FeedQueryFilters,
} from "@/features/feed/hooks/use-feed";
import {
  feedSuggestionsQueryKey,
  useFeedSuggestions,
} from "@/features/feed/hooks/use-feed-suggestions";
import {
  isDefaultFeedFilters,
  mergeFeedWithSuggestions,
} from "@/features/feed/lib/merge-feed-with-suggestions";
import { useFeedPullRefresh } from "@/features/feed/hooks/use-feed-pull-refresh";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import {
  useDeletePost,
  useDeleteRepost,
  useHidePost,
  useNotInterested,
  usePinPost,
} from "@/features/feed/hooks/use-feed-post-actions";
import { ApiError } from "@/lib/api/errors";

function filtersFromSearchParams(
  searchParams: URLSearchParams,
): FeedQueryFilters {
  const feedType = searchParams.get("feedType");
  const propertyCategory = searchParams.get("propertyCategory");
  const transaction = searchParams.get("transaction");
  const inquiryType = searchParams.get("inquiryType");
  return {
    feedType:
      feedType === "off_plan" ||
      feedType === "properties" ||
      feedType === "inquiries" ||
      feedType === "video"
        ? feedType
        : undefined,
    propertyCategory:
      propertyCategory === "apartment" ||
      propertyCategory === "villa" ||
      propertyCategory === "townhouse" ||
      propertyCategory === "penthouse"
        ? propertyCategory
        : undefined,
    listingTransaction:
      transaction === "sale" || transaction === "rent"
        ? transaction
        : undefined,
    inquiryType:
      inquiryType === "buy" || inquiryType === "rent" ? inquiryType : undefined,
  };
}

export function FeedScreen({
  composerDisplayName,
  composerAvatarUrl,
  initialComposeOpen = false,
}: {
  composerDisplayName: string;
  composerAvatarUrl?: string | null;
  initialComposeOpen?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams],
  );
  const showFeedSuggestions = isDefaultFeedFilters(filters);
  const { bundle: suggestionBundle } = useFeedSuggestions(showFeedSuggestions);
  const {
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    refetch,
    fetchNextPage,
    isRefetching,
  } = useFeed(filters);
  const { refresh: pullRefreshFeed, isRefreshing: isPullRefreshing } =
    useFeedPullRefresh(filters);
  const refreshFeed = useCallback(async () => {
    await pullRefreshFeed();
    if (showFeedSuggestions) {
      void queryClient.invalidateQueries({ queryKey: feedSuggestionsQueryKey });
    }
  }, [pullRefreshFeed, queryClient, showFeedSuggestions]);
  const { pullDistance } = usePullToRefresh({
    onRefresh: refreshFeed,
    disabled: isLoading || isPullRefreshing,
  });
  const isFeedRefreshing = isPullRefreshing || isRefetching;
  const likeMutation = useToggleLike();
  const saveMutation = useToggleSave();
  const hideMutation = useHidePost();
  const notInterestedMutation = useNotInterested();
  const deleteMutation = useDeletePost();
  const deleteRepostMutation = useDeleteRepost();
  const pinMutation = usePinPost();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [reportPostId, setReportPostId] = useState<number | null>(null);
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<
    number | null
  >(null);
  const [repostPostId, setRepostPostId] = useState<number | null>(null);
  const [sendPostId, setSendPostId] = useState<number | null>(null);
  const [reactionsPostId, setReactionsPostId] = useState<number | null>(null);
  const [composeOpen, setComposeOpen] = useState(initialComposeOpen);
  const [composeAttach, setComposeAttach] = useState<"photo" | "video" | null>(
    null,
  );
  const toggleComments = useCallback((postId: number) => {
    setExpandedCommentsPostId((current) =>
      current === postId ? null : postId,
    );
  }, []);

  const sendPost = useMemo(
    () => posts.find((item) => item.id === sendPostId) ?? null,
    [sendPostId, posts],
  );
  const feedRows = useMemo(
    () =>
      showFeedSuggestions
        ? mergeFeedWithSuggestions(posts, suggestionBundle)
        : posts.map((post) => ({ kind: "post" as const, post })),
    [posts, showFeedSuggestions, suggestionBundle],
  );
  const savePostId =
    saveMutation.isPending && saveMutation.variables != null
      ? saveMutation.variables
      : undefined;

  function openCompose(attach?: "photo" | "video") {
    setComposeAttach(attach ?? null);
    setComposeOpen(true);
  }

  /** Keep loading until the feed has enough posts (event module sits after #3). */
  const MIN_POSTS_BEFORE_IDLE = 8;

  useEffect(() => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return;
    if (posts.length > 0 && posts.length < MIN_POSTS_BEFORE_IDLE) {
      void fetchNextPage();
    }
  }, [posts.length, hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  useEffect(() => {
    if (isLoading) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "320px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    posts.length,
    feedRows.length,
  ]);

  const composers = (
    <div className="space-y-3 px-4 md:px-0">
      <FeedCreatePostCard
        displayName={composerDisplayName}
        avatarUrl={composerAvatarUrl}
        onOpenCompose={openCompose}
        onRefresh={() => void refreshFeed()}
        refreshing={isFeedRefreshing}
      />
      <StoriesRail />
    </div>
  );

  const pullIndicator = (
    <FeedPullToRefreshIndicator
      pullDistance={pullDistance}
      isRefreshing={isPullRefreshing}
    />
  );

  const composeDialog = (
    <CreatePostDialog
      open={composeOpen}
      onOpenChange={(open) => {
        setComposeOpen(open);
        if (!open) setComposeAttach(null);
      }}
      displayName={composerDisplayName}
      avatarUrl={composerAvatarUrl}
      initialAttachType={composeAttach}
      onPublished={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />
  );

  if (isLoading) {
    return (
      <>
        {pullIndicator}
        <div className="space-y-3">
          {composers}
          <FeedSkeleton />
        </div>
        {composeDialog}
      </>
    );
  }

  if (error) {
    const sessionExpired =
      error instanceof ApiError && error.code === "SESSION_EXPIRED";
    return (
      <>
        {pullIndicator}
        <div className="space-y-4">
          {composers}
          <ErrorState
            title={sessionExpired ? "Session expired" : "Feed unavailable"}
            description={feedErrorMessage(error)}
            onRetry={sessionExpired ? undefined : () => void refetch()}
          />
          {sessionExpired ? (
            <div className="flex justify-center">
              <Button asChild>
                <Link href="/login?next=/feed">Sign in</Link>
              </Button>
            </div>
          ) : null}
        </div>
        {composeDialog}
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <>
        {pullIndicator}
        <div className="space-y-3">
          {composers}
          <div className="px-4 md:px-0">
            <EmptyState
              title="Your feed is quiet"
              description="Follow professionals and share your first update to bring this space to life."
              actionLabel="Create a post"
              onAction={() => openCompose()}
            />
          </div>
        </div>
        {composeDialog}
      </>
    );
  }

  return (
    <>
      {pullIndicator}
      <div className="space-y-3">
        {composers}
        <div className="space-y-3 px-4 md:px-0">
          {feedRows.map((row) => (
            <FeedListRow
              key={row.kind === "post" ? `post-${row.post.id}` : row.id}
              row={row}
              handlers={{
                saving: saveMutation.isPending,
                savePostId,
                onLike: (input) => likeMutation.mutate(input),
                onSave: (id) => saveMutation.mutate(id),
                onReport: setReportPostId,
                expandedCommentsPostId,
                commentsViewerName: composerDisplayName,
                commentsViewerAvatarUrl: composerAvatarUrl,
                onComment: toggleComments,
                onRepost: setRepostPostId,
                onSend: setSendPostId,
                onReactions: setReactionsPostId,
                onHide: (id) => hideMutation.mutate(id),
                onNotInterested: (id) => notInterestedMutation.mutate(id),
                onDelete: (id) => deleteMutation.mutate(id),
                onPin: (input) => pinMutation.mutate(input),
                onUndoRepost: (id) => deleteRepostMutation.mutate(id),
              }}
            />
          ))}
          {isFetchingNextPage ? (
            <FeedSkeleton count={1} className="space-y-0 px-0" />
          ) : null}
          <div
            ref={sentinelRef}
            className="h-4 w-full shrink-0 scroll-mt-4"
            aria-hidden
          />
        </div>
      </div>
      {!hasNextPage ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          You’re caught up
        </p>
      ) : null}

      <ReportPostDialog
        postId={reportPostId}
        open={reportPostId != null}
        onOpenChange={(open) => {
          if (!open) setReportPostId(null);
        }}
      />
      <PostRepostDialog
        postId={repostPostId}
        open={repostPostId != null}
        onOpenChange={(open) => {
          if (!open) setRepostPostId(null);
        }}
      />
      <PostSendDialog
        post={sendPost}
        open={sendPostId != null}
        onOpenChange={(open) => {
          if (!open) setSendPostId(null);
        }}
      />
      <PostReactionsDialog
        postId={reactionsPostId}
        open={reactionsPostId != null}
        onOpenChange={(open) => {
          if (!open) setReactionsPostId(null);
        }}
      />
      {composeDialog}
    </>
  );
}
