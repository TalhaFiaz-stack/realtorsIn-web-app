"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SendHorizontal } from "lucide-react";
import { CommentListSkeleton } from "@/components/feed/comment-list-skeleton";
import {
  MentionTextField,
  type MentionComposerHandle,
} from "@/components/feed/mention-text-field";
import { PostCommentItem } from "@/components/feed/post-comment-item";
import { ErrorState } from "@/components/states/error-state";
import { InlineLoader } from "@/components/states/inline-loader";
import {
  Avatar,
  AvatarImage,
  AvatarPlaceholderFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  useCommentReaction,
  useCreateComment,
  useDeleteComment,
  usePostComments,
} from "@/features/feed/hooks/use-post-detail";
import { dismissAllReactionPickers } from "@/features/feed/lib/dismiss-reaction-pickers";
import { ensurePostDetailCache } from "@/features/feed/lib/patch-feed-caches";
import { ApiError } from "@/lib/api/errors";
import type { FeedPost } from "@/features/feed/types/post.types";
import { cn } from "@/lib/utils";

export function PostCommentsPanel({
  postId,
  enabled,
  viewerName,
  viewerAvatarUrl,
  seedPost,
  autoFocusComposer = false,
  className,
  listClassName,
}: {
  postId: number;
  enabled: boolean;
  viewerName: string;
  viewerAvatarUrl?: string | null;
  seedPost?: FeedPost | null;
  autoFocusComposer?: boolean;
  className?: string;
  listClassName?: string;
}) {
  const queryClient = useQueryClient();
  const commentsQuery = usePostComments(postId, enabled && postId > 0);
  const commentMutation = useCreateComment(postId);
  const reactionMutation = useCommentReaction(postId);
  const deleteCommentMutation = useDeleteComment(postId);

  const [draft, setDraft] = useState("");
  const mentionRef = useRef<MentionComposerHandle | null>(null);
  const composerWrapRef = useRef<HTMLDivElement | null>(null);
  const listSentinelRef = useRef<HTMLDivElement | null>(null);

  const comments = useMemo(
    () => commentsQuery.data?.pages.flatMap((page) => page.comments) ?? [],
    [commentsQuery.data]
  );

  useEffect(() => {
    if (!enabled) {
      setDraft("");
      mentionRef.current?.resetMentions();
      return;
    }
    dismissAllReactionPickers();
  }, [enabled, postId]);

  useEffect(() => {
    if (!enabled || postId <= 0 || !seedPost) return;
    ensurePostDetailCache(queryClient, postId, seedPost);
  }, [enabled, postId, seedPost, queryClient]);

  useEffect(() => {
    if (!enabled || !autoFocusComposer) return;
    const id = window.requestAnimationFrame(() => {
      composerWrapRef.current?.querySelector("textarea")?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [autoFocusComposer, enabled, postId]);

  useEffect(() => {
    const node = listSentinelRef.current;
    if (!node || !enabled) return;
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
      { rootMargin: "120px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [
    enabled,
    commentsQuery.hasNextPage,
    commentsQuery.isFetchingNextPage,
    commentsQuery.fetchNextPage,
  ]);

  function submitComment() {
    const text = draft.trim();
    if (!text || commentMutation.isPending || postId <= 0) return;
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

  const commentsLoading =
    commentsQuery.isPending ||
    (commentsQuery.isFetching && comments.length === 0);

  if (!enabled) return null;

  return (
    <div
      className={cn(
        "border-t border-border bg-muted/20 animate-in fade-in slide-in-from-top-1 duration-200",
        className
      )}
    >
      <div ref={composerWrapRef} className="px-3 py-3">
        <form
          className="flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            submitComment();
          }}
          onKeyDown={(event) => {
            // ⌘/Ctrl+Enter posts; plain Enter stays a newline (mentions use it).
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              submitComment();
            }
          }}
        >
          <Avatar className="mb-0.5 h-9 w-9 shrink-0">
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
              placeholder={`Add a comment…`}
              className="min-h-[40px] resize-none rounded-2xl border border-border bg-card px-3 py-2 text-sm shadow-none focus-visible:ring-1"
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
            className="mb-0.5 h-9 w-9 shrink-0 text-primary"
            disabled={commentMutation.isPending || draft.trim().length === 0}
            aria-label="Post comment"
          >
            {commentMutation.isPending ? (
              <InlineLoader />
            ) : (
              <SendHorizontal className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>

      <div
        className={cn(
          "space-y-3 overflow-x-visible overflow-y-auto px-3 pb-3",
          listClassName ?? "max-h-[min(22rem,45vh)]"
        )}
      >
        {commentsLoading ? (
          <CommentListSkeleton count={3} />
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
          <p className="py-2 text-center text-xs text-muted-foreground">
            No comments yet. Start the conversation.
          </p>
        ) : (
          <ul className="space-y-3">
            {comments.map((item) => (
              <PostCommentItem
                key={item.id}
                comment={item}
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
        <div ref={listSentinelRef} className="h-2" aria-hidden />
        {commentsQuery.isFetchingNextPage ? (
          <div className="flex justify-center py-2">
            <InlineLoader />
          </div>
        ) : null}
      </div>
    </div>
  );
}
