"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bookmark,
  EyeOff,
  Flag,
  MoreHorizontal,
  Pin,
  PinOff,
  ThumbsDown,
  Trash2,
} from "lucide-react";
import { PostCardActionBar } from "@/components/feed/post-card-action-bar";
import { PostCommentsPanel } from "@/components/feed/post-comments-panel";
import { useConfirm } from "@/components/common/confirm-provider";
import { PostDescription } from "@/components/feed/post-description";
import { PostMedia } from "@/components/feed/post-media";
import {
  PostPropertyShareCard,
  PostPropertyUnavailableCard,
} from "@/components/feed/post-property-share-card";
import { PostProjectShareCard } from "@/components/feed/post-project-share-card";
import {
  PostVisibilityIcon,
  postVisibilityLabel,
} from "@/components/feed/post-visibility-icon";
import { VerifiedBadgeIcon } from "@/components/profile/profile-badges";
import { ProfileHandle } from "@/components/shared/profile-handle";
import {
  Avatar,
  AvatarImage,
  AvatarPlaceholderFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PostReactionSummaryRow } from "@/components/feed/post-reaction-summary-row";
import {
  formatPostLikeSummary,
  getSummaryReactionTypes,
  type PostReactionType,
} from "@/features/feed/constants/post-reactions";
import {
  formatRelativeTime,
  getConnectionRepostThoughts,
} from "@/features/feed/lib/map-post";
import type { FeedPost } from "@/features/feed/types/post.types";
import { PostQuotedEmbed } from "@/components/feed/post-quoted-embed";
import { PostRepostBanner } from "@/components/feed/post-repost-banner";
import { CONFIRM_DELETE_POST } from "@/constants/confirm-copy";
import { cn } from "@/lib/utils";

export function PostCard({
  post,
  onLike,
  onSave,
  onReport,
  onComment,
  onRepost,
  onUndoRepost,
  onSend,
  onReactions,
  onHide,
  onNotInterested,
  onDelete,
  onPin,
  saving,
  commentsExpanded,
  commentsViewerName,
  commentsViewerAvatarUrl,
  reactionPickerPortal = false,
}: {
  post: FeedPost;
  onLike: (input: {
    postId: number;
    reactionType?: PostReactionType | null;
    isTapToggle?: boolean;
  }) => void;
  onSave: (id: number) => void;
  onReport: (id: number) => void;
  onComment?: (postId: number) => void;
  onRepost?: (postId: number) => void;
  onUndoRepost?: (postId: number) => void;
  onSend?: (postId: number) => void;
  onReactions?: (postId: number) => void;
  onHide?: (postId: number) => void;
  onNotInterested?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onPin?: (input: { postId: number; pinned: boolean }) => void;
  saving?: boolean;
  commentsExpanded?: boolean;
  commentsViewerName?: string;
  commentsViewerAvatarUrl?: string | null;
  /** Portaled reaction picker — use on profile / nested scroll areas. */
  reactionPickerPortal?: boolean;
}) {
  const { confirm } = useConfirm();
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!commentsExpanded || !cardRef.current) return;
    cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [commentsExpanded]);
  const profileHref = post.userName ? `/u/${post.userName}` : "/me";
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
  const hasEngagement =
    showPostLikeSummary || post.commentCount > 0;
  const hasPropertyBlock = post.isPropertyShare;
  const hasProjectBlock = Boolean(post.projectData) || post.isProjectShare;
  const hideRegularMedia = Boolean(post.propertyData);
  const postedAgo = formatRelativeTime(post.createdAt);
  const connectionRepost = Boolean(post.repostInfo?.isRepost);
  const connectionRepostThoughts = getConnectionRepostThoughts(post.repostInfo);
  const quotedOriginal = post.repostData;
  const showWrapperBody = !quotedOriginal;

  function handleCommentToggle() {
    onComment?.(post.id);
  }

  return (
    <article
      ref={cardRef}
      className={cn(
        "overflow-visible rounded-[var(--radius)] border border-border bg-card shadow-sm",
        commentsExpanded && "ring-1 ring-primary/15"
      )}
    >
      {connectionRepost && post.repostInfo ? (
        <PostRepostBanner reposters={post.repostInfo.allReposters} />
      ) : null}

      {connectionRepost && connectionRepostThoughts ? (
        <div className="px-4 pb-1 pt-1">
          <PostDescription
            description={connectionRepostThoughts}
            mentions={[]}
          />
        </div>
      ) : null}

      <header
        className={cn(
          "flex items-start gap-3 px-4 pt-3",
          connectionRepost && "pt-2"
        )}
      >
        <Link href={profileHref} className="shrink-0">
          <Avatar className="h-10 w-10">
            {post.avatarUrl ? (
              <AvatarImage src={post.avatarUrl} alt="" />
            ) : null}
            <AvatarPlaceholderFallback />
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <Link
              href={profileHref}
              className="locale-text truncate text-[15px] font-semibold text-foreground hover:underline"
            >
              {post.authorName}
            </Link>
            {post.isVerified ? <VerifiedBadgeIcon size={16} /> : null}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted-foreground">
            <ProfileHandle userName={post.userName} className="text-[13px]" />
            {post.userName && postedAgo ? <span aria-hidden>·</span> : null}
            {postedAgo ? (
              <Link href={`/posts/${post.id}`} className="hover:underline">
                {postedAgo}
              </Link>
            ) : null}
            {post.visibility ? (
              <>
                <span aria-hidden>·</span>
                <span
                  className="inline-flex items-center"
                  title={postVisibilityLabel(post.visibility)}
                  aria-label={postVisibilityLabel(post.visibility)}
                >
                  <PostVisibilityIcon visibility={post.visibility} />
                </span>
              </>
            ) : null}
            {post.isPinned ? (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
                  <Pin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Pinned
                </span>
              </>
            ) : null}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full text-muted-foreground data-[state=open]:bg-muted"
              aria-label="Post actions"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem
              disabled={saving}
              onClick={() => onSave(post.id)}
            >
              <Bookmark
                className={cn("mr-2 h-4 w-4", post.isSaved && "fill-current")}
              />
              {post.isSaved ? "Saved" : "Save"}
            </DropdownMenuItem>
            {post.isOwn ? (
              <>
                {onPin ? (
                  <DropdownMenuItem
                    onClick={() =>
                      onPin({ postId: post.id, pinned: !post.isPinned })
                    }
                  >
                    {post.isPinned ? (
                      <PinOff className="mr-2 h-4 w-4" />
                    ) : (
                      <Pin className="mr-2 h-4 w-4" />
                    )}
                    {post.isPinned ? "Unpin from profile" : "Pin to profile"}
                  </DropdownMenuItem>
                ) : null}
                {onDelete ? (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(event) => {
                      event.preventDefault();
                      void (async () => {
                        const preview =
                          post.description.trim().slice(0, 160) ||
                          `Post by ${post.authorName}`;
                        const ok = await confirm({
                          ...CONFIRM_DELETE_POST,
                          detail: preview,
                        });
                        if (ok) onDelete(post.id);
                      })();
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete post
                  </DropdownMenuItem>
                ) : null}
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => onHide?.(post.id)}>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNotInterested?.(post.id)}>
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  Not interested
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onReport(post.id)}>
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem asChild>
              <Link href={`/posts/${post.id}`}>Open post</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {quotedOriginal ? (
        <>
          {post.description?.trim() ? (
            <PostDescription
              description={post.description}
              mentions={post.mentions}
            />
          ) : null}
          <PostQuotedEmbed post={quotedOriginal} className="mb-1 mt-3" />
        </>
      ) : null}

      {showWrapperBody && post.description ? (
        <PostDescription
          description={post.description}
          mentions={post.mentions}
        />
      ) : null}

      {showWrapperBody && (hasPropertyBlock || hasProjectBlock) && (
        <p className="locale-text px-4 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {hasPropertyBlock ? "Property share" : "Project share"}
        </p>
      )}

      {showWrapperBody &&
      !hideRegularMedia &&
      (post.images.length > 0 || post.videos.length > 0) ? (
        <div
          className={cn(
            post.description || hasPropertyBlock || hasProjectBlock
              ? "mt-3"
              : "mt-2"
          )}
        >
          <PostMedia post={post} edgeToEdge />
        </div>
      ) : null}

      {showWrapperBody && hasPropertyBlock ? (
        post.propertyData ? (
          <div className="mt-3">
            <PostPropertyShareCard
              propertyData={post.propertyData}
              postImageUrls={post.images.map((image) => image.url)}
            />
          </div>
        ) : (
          <div className="mt-3">
            <PostPropertyUnavailableCard />
          </div>
        )
      ) : null}

      {showWrapperBody && post.projectData ? (
        <div className={cn(hasPropertyBlock ? "mt-0" : "mt-3")}>
          <PostProjectShareCard projectData={post.projectData} />
        </div>
      ) : null}

      {hasEngagement ? (
        <div className="flex min-h-8 items-center justify-between gap-3 px-4 py-1.5 text-[13px] text-muted-foreground">
          <div className="min-w-0 flex-1">
            {showPostLikeSummary ? (
              onReactions ? (
                <PostReactionSummaryRow
                  summaryTypes={summaryTypes}
                  likeSummary={likeSummary}
                  onClick={() => onReactions(post.id)}
                />
              ) : (
                <PostReactionSummaryRow
                  summaryTypes={summaryTypes}
                  likeSummary={likeSummary!}
                />
              )
            ) : null}
          </div>
          {post.commentCount > 0 ? (
            onComment ? (
              <button
                type="button"
                className="shrink-0 tabular-nums hover:underline"
                onClick={handleCommentToggle}
              >
                {post.commentCount} comment
                {post.commentCount === 1 ? "" : "s"}
              </button>
            ) : (
              <Link
                href={`/posts/${post.id}`}
                className="shrink-0 tabular-nums hover:underline"
              >
                {post.commentCount} comment
                {post.commentCount === 1 ? "" : "s"}
              </Link>
            )
          ) : (
            <span />
          )}
        </div>
      ) : (
        <div className="h-2" aria-hidden />
      )}

      <div className="mx-4 border-t border-border" />

      <PostCardActionBar
        post={post}
        className="overflow-visible px-2"
        pickerPortal={reactionPickerPortal}
        onLike={(input) =>
          onLike({
            postId: post.id,
            reactionType: input.reactionType,
            isTapToggle: input.isTapToggle,
          })
        }
        commentActive={commentsExpanded}
        onComment={onComment ? handleCommentToggle : undefined}
        onRepost={onRepost ? () => onRepost(post.id) : undefined}
        onUndoRepost={onUndoRepost ? () => onUndoRepost(post.id) : undefined}
        onSend={onSend ? () => onSend(post.id) : undefined}
      />

      {onComment && commentsViewerName ? (
        <PostCommentsPanel
          postId={post.id}
          enabled={Boolean(commentsExpanded)}
          viewerName={commentsViewerName}
          viewerAvatarUrl={commentsViewerAvatarUrl}
          seedPost={post}
          autoFocusComposer={commentsExpanded}
        />
      ) : null}
    </article>
  );
}
