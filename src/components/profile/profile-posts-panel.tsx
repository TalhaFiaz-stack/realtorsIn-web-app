"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PostCard } from "@/components/feed/post-card";
import { CreatePostDialog } from "@/components/feed/create-post-dialog";
import { FeedCreatePostCard } from "@/components/feed/feed-create-post-card";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { PostReactionsDialog } from "@/components/feed/post-reactions-dialog";
import { ReportPostDialog } from "@/components/feed/report-post-dialog";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { insertNewPostAtFeedTop } from "@/features/feed/lib/insert-new-post-into-feed";
import {
  profileErrorMessage,
  profilePostsQueryKey,
  useProfilePosts,
} from "@/features/profile/hooks/use-profile";
import { usePinPost } from "@/features/feed/hooks/use-feed-post-actions";
import {
  useToggleLike,
  useToggleSave,
} from "@/features/feed/hooks/use-feed";

export function ProfilePostsPanel({
  userProfileId,
  isOwn = false,
  composerDisplayName = "You",
  composerAvatarUrl,
}: {
  userProfileId: number;
  isOwn?: boolean;
  composerDisplayName?: string;
  composerAvatarUrl?: string | null;
}) {
  const queryClient = useQueryClient();
  const query = useProfilePosts(userProfileId);
  const likeMutation = useToggleLike();
  const saveMutation = useToggleSave();
  const pinMutation = usePinPost();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [reportPostId, setReportPostId] = useState<number | null>(null);
  const [reactionsPostId, setReactionsPostId] = useState<number | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const posts =
    query.data?.pages.flatMap((page) => page.posts) ?? [];

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          query.hasNextPage &&
          !query.isFetchingNextPage
        ) {
          void query.fetchNextPage();
        }
      },
      { rootMargin: "240px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [query]);

  const composer = isOwn ? (
    <>
      <FeedCreatePostCard
        displayName={composerDisplayName}
        avatarUrl={composerAvatarUrl}
        onOpenCompose={() => setComposeOpen(true)}
      />
      <CreatePostDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        displayName={composerDisplayName}
        avatarUrl={composerAvatarUrl}
        onPublished={(postId) => {
          void queryClient.invalidateQueries({
            queryKey: profilePostsQueryKey(userProfileId),
          });
          void insertNewPostAtFeedTop(queryClient, postId);
        }}
      />
    </>
  ) : null;

  if (query.isLoading) {
    return (
      <div className="space-y-3">
        {composer}
        <FeedSkeleton count={2} />
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="space-y-3">
        {composer}
        <ErrorState
          title="Posts unavailable"
          description={profileErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="space-y-3">
        {composer}
        <EmptyState
          title="No posts yet"
          description="Posts from this profile will show up here."
          actionLabel={isOwn ? "Create a post" : undefined}
          onAction={isOwn ? () => setComposeOpen(true) : undefined}
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {composer}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            reactionPickerPortal
            saving={
              saveMutation.isPending && saveMutation.variables === post.id
            }
            onLike={(input) => likeMutation.mutate(input)}
            onSave={(id) => saveMutation.mutate(id)}
            onReport={setReportPostId}
            onReactions={setReactionsPostId}
            onPin={
              isOwn
                ? (input) =>
                    pinMutation.mutate({
                      ...input,
                      profileUserId: userProfileId,
                    })
                : undefined
            }
          />
        ))}
        {query.isFetchingNextPage ? (
          <FeedSkeleton count={1} className="space-y-0 px-0" />
        ) : null}
        <div ref={sentinelRef} className="h-px w-full shrink-0" aria-hidden />
      </div>
      <ReportPostDialog
        postId={reportPostId}
        open={reportPostId != null}
        onOpenChange={(open) => {
          if (!open) setReportPostId(null);
        }}
      />
      <PostReactionsDialog
        postId={reactionsPostId}
        open={reactionsPostId != null}
        onOpenChange={(open) => {
          if (!open) setReactionsPostId(null);
        }}
      />
    </>
  );
}
