"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SendHorizontal, X } from "lucide-react";
import { CommentListSkeleton } from "@/components/feed/comment-list-skeleton";
import { MentionTextField, type MentionComposerHandle } from "@/components/feed/mention-text-field";
import { PostCardActionBar } from "@/components/feed/post-card-action-bar";
import { PostCommentItem } from "@/components/feed/post-comment-item";
import { PostDescription } from "@/components/feed/post-description";
import { PostMedia } from "@/components/feed/post-media";
import {
  PostPropertyShareCard,
  PostPropertyUnavailableCard,
} from "@/components/feed/post-property-share-card";
import { PostProjectShareCard } from "@/components/feed/post-project-share-card";
import { PostRepostDialog } from "@/components/feed/post-repost-dialog";
import { PostSendDialog } from "@/components/feed/post-send-dialog";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { InlineLoader } from "@/components/states/inline-loader";
import {
  Avatar,
  AvatarImage,
  AvatarPlaceholderFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { PostReactionIcon } from "@/features/feed/constants/post-reaction-icons";
import {
  formatPostLikeSummary,
  getSummaryReactionTypes,
  type PostReactionType,
} from "@/features/feed/constants/post-reactions";
import { formatRelativeTime } from "@/features/feed/lib/map-post";
import { useDeleteRepost } from "@/features/feed/hooks/use-feed-post-actions";
import {
  useCommentReaction,
  useCreateComment,
  useDeleteComment,
  useDetailToggleLike,
  usePostComments,
  usePostDetail,
} from "@/features/feed/hooks/use-post-detail";
import { dismissAllReactionPickers } from "@/features/feed/lib/dismiss-reaction-pickers";
import { ensurePostDetailCache } from "@/features/feed/lib/patch-feed-caches";
import { ApiError } from "@/lib/api/errors";
import type { FeedPost } from "@/features/feed/types/post.types";
import { cn } from "@/lib/utils";

function PostPreview({
  post,
  onLike,
  onFocusComment,
  onRepost,
  onUndoRepost,
  onSend,
}: {
  post: FeedPost;
  onLike: (input: {
    reactionType?: PostReactionType | null;
    isTapToggle?: boolean;
  }) => void;
  onFocusComment: () => void;
  onRepost: () => void;
  onUndoRepost: () => void;
  onSend: () => void;
}) {
  const summaryTypes = getSummaryReactionTypes({
    reactionSummary: post.reactionSummary,
    likeStatus: post.isLiked,
    userReaction: post.userReaction,
    likeCount: post.likeCount,
  });
  const likeSummary = formatPostLikeSummary({
    likeCount: post.likeCount,
    likeStatus: post.isLiked,
    summaryReactionTypes: summaryTypes,
  });
  const showPostLikeSummary = Boolean(likeSummary);
  const hasPropertyBlock = post.isPropertyShare;
  const hasProjectBlock = Boolean(post.projectData) || post.isProjectShare;
  const hideRegularMedia = Boolean(post.propertyData);

  return (
    <div className="w-full border-b border-border pb-3">
      <div className="flex items-start gap-3 px-1 pt-1">
        <Avatar className="h-10 w-10 shrink-0">
          {post.avatarUrl ? <AvatarImage src={post.avatarUrl} alt="" /> : null}
          <AvatarPlaceholderFallback />
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{post.authorName}</p>
          {post.createdAt ? (
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(post.createdAt)}
            </p>
          ) : null}
        </div>
      </div>

      <PostDescription
        description={post.description}
        mentions={post.mentions}
        className="px-1"
      />

      {(hasPropertyBlock || hasProjectBlock) && (
        <p className="mt-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {hasPropertyBlock ? "Property share" : "Project share"}
        </p>
      )}

      {!hideRegularMedia && (post.images.length > 0 || post.videos.length > 0) ? (
        <div className="mt-2 overflow-hidden rounded-lg">
          <PostMedia post={post} />
        </div>
      ) : null}

      {hasPropertyBlock ? (
        post.propertyData ? (
          <div className="mt-2">
            <PostPropertyShareCard
              propertyData={post.propertyData}
              postImageUrls={post.images.map((image) => image.url)}
            />
          </div>
        ) : (
          <div className="mt-2">
            <PostPropertyUnavailableCard />
          </div>
        )
      ) : null}

      {post.projectData ? (
        <div className={cn(hasPropertyBlock ? "mt-0" : "mt-2")}>
          <PostProjectShareCard projectData={post.projectData} />
        </div>
      ) : null}

      <div className="mt-2 flex items-center justify-between gap-2 px-1 text-[13px] text-muted-foreground">
        {showPostLikeSummary ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex -space-x-1">
              {summaryTypes.map((type) => (
                <span
                  key={type}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-card ring-1 ring-border"
                >
                  <PostReactionIcon type={type} size={16} />
                </span>
              ))}
            </span>
            {likeSummary}
          </span>
        ) : (
          <span />
        )}
        {post.commentCount > 0 ? (
          <span>
            {post.commentCount} comment{post.commentCount === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      <div className="mt-1 border-t border-border px-0.5 pt-1">
        <PostCardActionBar
          post={post}
          pickerPortal
          onLike={onLike}
          onComment={onFocusComment}
          onRepost={onRepost}
          onUndoRepost={onUndoRepost}
          onSend={onSend}
        />
      </div>
    </div>
  );
}

export function PostCommentsDialog({
  postId,
  open,
  onOpenChange,
  viewerName,
  viewerAvatarUrl,
  seedPost,
}: {
  postId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewerName: string;
  viewerAvatarUrl?: string | null;
  /** Prefer feed cache while details load. */
  seedPost?: FeedPost | null;
}) {
  const activeId = postId ?? 0;
  const queryClient = useQueryClient();
  const postQuery = usePostDetail(activeId, open && activeId > 0);
  const commentsQuery = usePostComments(activeId, open && activeId > 0);
  const likeMutation = useDetailToggleLike(activeId);
  const commentMutation = useCreateComment(activeId);
  const reactionMutation = useCommentReaction(activeId);
  const deleteCommentMutation = useDeleteComment(activeId);
  const deleteRepostMutation = useDeleteRepost();

  const [draft, setDraft] = useState("");
  const [repostOpen, setRepostOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const mentionRef = useRef<MentionComposerHandle | null>(null);
  const composerWrapRef = useRef<HTMLDivElement | null>(null);
  const listSentinelRef = useRef<HTMLDivElement | null>(null);

  const post = postQuery.data ?? seedPost ?? null;
  const comments = useMemo(
    () => commentsQuery.data?.pages.flatMap((page) => page.comments) ?? [],
    [commentsQuery.data]
  );

  useEffect(() => {
    if (!open) {
      setDraft("");
      setRepostOpen(false);
      setSendOpen(false);
      mentionRef.current?.resetMentions();
      return;
    }
    dismissAllReactionPickers();
  }, [open, activeId]);

  useEffect(() => {
    if (!open || activeId <= 0 || !seedPost) return;
    ensurePostDetailCache(queryClient, activeId, seedPost);
  }, [open, activeId, seedPost, queryClient]);

  function focusCommentComposer() {
    composerWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const textarea = composerWrapRef.current?.querySelector("textarea");
    textarea?.focus();
  }

  useEffect(() => {
    const node = listSentinelRef.current;
    if (!node || !open) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          commentsQuery.hasNextPage &&
          !commentsQuery.isFetchingNextPage
        ) {
          void commentsQuery.fetchNextPage();
        }
      },
      { rootMargin: "160px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [
    open,
    commentsQuery.hasNextPage,
    commentsQuery.isFetchingNextPage,
    commentsQuery.fetchNextPage,
  ]);

  function submitComment() {
    const text = draft.trim();
    if (!text || commentMutation.isPending || activeId <= 0) return;
    const payload = mentionRef.current?.getMentionPayload() ?? {
      mentionedUserIds: [],
      mentionedUsers: [],
    };
    commentMutation.mutate(
      {
        comment: text,
        mentionedUserIds: payload.mentionedUserIds,
        mentionedUsers: payload.mentionedUsers,
      },
      {
        onSuccess: () => {
          setDraft("");
          mentionRef.current?.resetMentions();
        },
      }
    );
  }

  const title = post ? `${post.authorName}'s post` : "Post";

  const commentsLoading =
    commentsQuery.isPending ||
    (commentsQuery.isFetching && comments.length === 0);

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(92vh,880px)] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl"
      >
        <div className="relative flex shrink-0 items-center justify-center border-b border-border px-14 py-3.5">
          <DialogTitle className="truncate text-base font-bold">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            View the post and paginated comments. Type @ to mention a connection.
          </DialogDescription>
          <button
            type="button"
            className="absolute right-4 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-muted/80"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3">
          {postQuery.isLoading && !post ? (
            <FeedSkeleton count={1} />
          ) : postQuery.error && !post ? (
            <ErrorState
              title="Post unavailable"
              description={
                postQuery.error instanceof ApiError
                  ? postQuery.error.message
                  : "This post could not be loaded."
              }
              onRetry={() => void postQuery.refetch()}
            />
          ) : post ? (
            <PostPreview
              post={post}
              onLike={(input) => likeMutation.mutate(input)}
              onFocusComment={focusCommentComposer}
              onRepost={() => setRepostOpen(true)}
              onUndoRepost={() => deleteRepostMutation.mutate(activeId)}
              onSend={() => setSendOpen(true)}
            />
          ) : null}

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Comments</p>
            {commentsLoading ? (
              <CommentListSkeleton count={5} />
            ) : commentsQuery.error ? (
              <ErrorState
                title="Comments unavailable"
                description={
                  commentsQuery.error instanceof ApiError
                    ? commentsQuery.error.message
                    : "Try again"
                }
                onRetry={() => void commentsQuery.refetch()}
              />
            ) : comments.length === 0 ? (
              <EmptyState
                title="No comments yet"
                description="Be the first to add a thoughtful reply."
              />
            ) : (
              <ul className="space-y-3">
                {comments.map((item) => (
                  <PostCommentItem
                    key={item.id}
                    comment={item}
                    pickerPortal
                    deleting={
                      deleteCommentMutation.isPending &&
                      deleteCommentMutation.variables === item.id
                    }
                    onReact={(input) => reactionMutation.mutate(input)}
                    onDelete={(commentId) =>
                      deleteCommentMutation.mutate(commentId)
                    }
                  />
                ))}
              </ul>
            )}
            <div ref={listSentinelRef} className="h-4" aria-hidden />
            {commentsQuery.isFetchingNextPage ? (
              <div className="flex justify-center py-2">
                <InlineLoader />
              </div>
            ) : null}
          </div>
        </div>

        <div
          ref={composerWrapRef}
          className="shrink-0 border-t border-border bg-card px-3 py-3"
        >
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submitComment();
            }}
          >
            <Avatar className="mb-1 h-9 w-9 shrink-0">
              {viewerAvatarUrl ? (
                <AvatarImage src={viewerAvatarUrl} alt="" />
              ) : null}
              <AvatarPlaceholderFallback />
            </Avatar>
            <div className="min-w-0 flex-1">
              <MentionTextField
                value={draft}
                onChange={setDraft}
                composerRef={mentionRef}
                disabled={commentMutation.isPending}
                rows={2}
                placeholder={`Comment as ${viewerName || "you"}`}
                className="min-h-[44px] resize-none rounded-2xl border-0 bg-muted/70 px-3 py-2 text-sm shadow-none focus-visible:ring-1"
              />
              {commentMutation.error ? (
                <p className="mt-1 text-xs text-destructive" role="alert">
                  {commentMutation.error instanceof ApiError
                    ? commentMutation.error.message
                    : "Could not post comment"}
                </p>
              ) : null}
            </div>
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="mb-1 h-9 w-9 shrink-0 text-primary"
              disabled={commentMutation.isPending || draft.trim().length === 0}
              aria-label="Send comment"
            >
              {commentMutation.isPending ? (
                <InlineLoader />
              ) : (
                <SendHorizontal className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>

    <PostRepostDialog
      postId={activeId > 0 ? activeId : null}
      open={repostOpen}
      onOpenChange={setRepostOpen}
    />
    <PostSendDialog post={post} open={sendOpen} onOpenChange={setSendOpen} />
    </>
  );
}
