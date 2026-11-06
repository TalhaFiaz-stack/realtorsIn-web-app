"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/feed/post-card";
import { PostCommentItem } from "@/components/feed/post-comment-item";
import { PostCommentsDialog } from "@/components/feed/post-comments-dialog";
import { PostRepostDialog } from "@/components/feed/post-repost-dialog";
import { PostReactionsDialog } from "@/components/feed/post-reactions-dialog";
import { PostSendDialog } from "@/components/feed/post-send-dialog";
import {
  MentionTextField,
  type MentionComposerHandle,
} from "@/components/feed/mention-text-field";
import { CommentListSkeleton } from "@/components/feed/comment-list-skeleton";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { ReportPostDialog } from "@/components/feed/report-post-dialog";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import { Button } from "@/components/ui/button";
import { InlineLoader } from "@/components/states/inline-loader";
import {
  useHidePost,
  useNotInterested,
} from "@/features/feed/hooks/use-feed-post-actions";
import {
  useCommentReaction,
  useCreateComment,
  useDeleteComment,
  useDetailToggleLike,
  useDetailToggleSave,
  usePostComments,
  usePostDetail,
} from "@/features/feed/hooks/use-post-detail";
import { ApiError } from "@/lib/api/errors";

export function PostDetailScreen({
  postId,
  viewerName = "you",
  viewerAvatarUrl,
}: {
  postId: number;
  viewerName?: string;
  viewerAvatarUrl?: string | null;
}) {
  const router = useRouter();
  const [reportOpen, setReportOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [repostOpen, setRepostOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const mentionRef = useRef<MentionComposerHandle | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const postQuery = usePostDetail(postId);
  const commentsQuery = usePostComments(postId);
  const likeMutation = useDetailToggleLike(postId);
  const saveMutation = useDetailToggleSave(postId);
  const commentMutation = useCreateComment(postId);
  const deleteCommentMutation = useDeleteComment(postId);
  const reactionMutation = useCommentReaction(postId);
  const hideMutation = useHidePost();
  const notInterestedMutation = useNotInterested();

  const post = postQuery.data ?? null;
  const comments = useMemo(
    () => commentsQuery.data?.pages.flatMap((page) => page.comments) ?? [],
    [commentsQuery.data]
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
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
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [
    commentsQuery.hasNextPage,
    commentsQuery.isFetchingNextPage,
    commentsQuery.fetchNextPage,
  ]);

  if (postQuery.isLoading) return <FeedSkeleton count={1} />;

  if (postQuery.error || !post) {
    return (
      <ErrorState
        title="Post unavailable"
        description={
          postQuery.error instanceof ApiError
            ? postQuery.error.message
            : "This post could not be loaded."
        }
        onRetry={() => void postQuery.refetch()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <ShellBackRow>
          <ShellBackLink href="/feed" label="Home" />
        </ShellBackRow>
      </div>

      <PostCard
        post={post}
        saving={saveMutation.isPending}
        onLike={(input) =>
          likeMutation.mutate({
            reactionType: input.reactionType,
            isTapToggle: input.isTapToggle,
          })
        }
        onSave={() => saveMutation.mutate()}
        onReport={() => setReportOpen(true)}
        onComment={() => setCommentsOpen(true)}
        onRepost={() => setRepostOpen(true)}
        onSend={() => setSendOpen(true)}
        onReactions={() => setReactionsOpen(true)}
        onHide={() =>
          hideMutation.mutate(postId, {
            onSuccess: () => router.push("/feed"),
          })
        }
        onNotInterested={() =>
          notInterestedMutation.mutate(postId, {
            onSuccess: () => router.push("/feed"),
          })
        }
      />

      <section className="mt-6 space-y-4 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Comments</h2>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const text = draft.trim();
            if (!text || commentMutation.isPending) return;
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
          }}
        >
          <MentionTextField
            value={draft}
            onChange={setDraft}
            composerRef={mentionRef}
            placeholder="Write a comment… Use @ to mention"
            rows={3}
            disabled={commentMutation.isPending}
          />
          {commentMutation.error ? (
            <p className="text-sm text-destructive" role="alert">
              {commentMutation.error instanceof ApiError
                ? commentMutation.error.message
                : "Could not post comment"}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={commentMutation.isPending || draft.trim().length === 0}
          >
            {commentMutation.isPending ? <InlineLoader /> : null}
            Comment
          </Button>
        </form>

        {commentsQuery.isPending ||
        (commentsQuery.isFetching && comments.length === 0) ? (
          <CommentListSkeleton count={4} />
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
          <ul className="space-y-4">
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
        <div ref={sentinelRef} className="h-6" aria-hidden />
        {commentsQuery.isFetchingNextPage ? (
          <div className="flex justify-center py-2">
            <InlineLoader />
          </div>
        ) : null}
      </section>

      <ReportPostDialog
        postId={postId}
        open={reportOpen}
        onOpenChange={setReportOpen}
      />
      <PostCommentsDialog
        postId={postId}
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        viewerName={viewerName}
        viewerAvatarUrl={viewerAvatarUrl}
        seedPost={post}
      />
      <PostRepostDialog
        postId={postId}
        open={repostOpen}
        onOpenChange={setRepostOpen}
      />
      <PostSendDialog
        post={post}
        open={sendOpen}
        onOpenChange={setSendOpen}
      />
      <PostReactionsDialog
        postId={postId}
        open={reactionsOpen}
        onOpenChange={setReactionsOpen}
      />
    </div>
  );
}
