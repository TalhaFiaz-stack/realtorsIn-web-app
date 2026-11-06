"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  FileText,
  MessageCircle,
} from "lucide-react";
import { CommentReactionsDialog } from "@/components/feed/comment-reactions-dialog";
import { PostDescription } from "@/components/feed/post-description";
import { PostReactionSummaryRow } from "@/components/feed/post-reaction-summary-row";
import {
  formatPostLikeSummary,
  getSummaryReactionTypes,
} from "@/features/feed/constants/post-reactions";
import { ActivityRowAvatar } from "@/components/activities/activity-row-avatar";
import { ActivityPostEmbeds } from "@/features/activities/lib/activity-post-embeds";
import {
  activityPostHasVisualEmbed,
  shouldShowActivityPostDescription,
} from "@/features/activities/lib/activity-post-preview";
import type { ActivityCommentItem } from "@/features/activities/types/activity.types";
import { formatRelativeTime } from "@/features/feed/lib/map-post";
import { useOwnProfile } from "@/features/profile/hooks/use-profile";
import { cn } from "@/lib/utils";

export function ActivityCommentRow({ item }: { item: ActivityCommentItem }) {
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const { data: ownProfile } = useOwnProfile();
  const post = item.post;
  const postHref = post ? `/posts/${post.id}` : null;
  const timeLabel =
    item.timeAgo ??
    (item.createdAt ? formatRelativeTime(item.createdAt) : null);
  const commentAvatarUrl =
    item.avatarUrl ?? ownProfile?.profileImage?.url ?? null;
  const commentAuthorName =
    item.authorName ||
    ownProfile?.fullName ||
    ownProfile?.name ||
    ownProfile?.userName ||
    "You";
  const summaryTypes = getSummaryReactionTypes({
    reactionSummary: item.reactionSummary,
    likeStatus: item.isLiked,
    userReaction: item.userReaction,
    likeCount: item.likeCount,
  });
  const likeSummary = formatPostLikeSummary({
    likeCount: item.likeCount,
    likeStatus: item.isLiked,
    summaryReactionTypes: summaryTypes,
  });

  return (
    <article className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm dark:shadow-none">
      {post && postHref ? (
        <Link
          href={postHref}
          className="block px-3.5 pb-3 pt-3.5 transition-colors hover:bg-muted/25"
        >
          <div className="mb-2.5 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
            On this post
          </div>
          <div className="flex items-start gap-2.5">
            <ActivityRowAvatar
              className="h-10 w-10"
              name={post.authorName}
              imageUrl={post.avatarUrl}
            />
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold leading-snug text-foreground">
                {post.authorName}
              </p>
              {shouldShowActivityPostDescription(post) ? (
                <div className="mt-0.5 text-sm text-foreground/90">
                  <PostDescription
                    description={post.description}
                    mentions={post.mentions}
                    compact
                  />
                </div>
              ) : null}
            </div>
          </div>
          {activityPostHasVisualEmbed(post) ? (
            <ActivityPostEmbeds post={post} className="mt-2.5" />
          ) : null}
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[13px] font-semibold text-primary",
              activityPostHasVisualEmbed(post) ? "mt-3" : "mt-2"
            )}
          >
            View post
            <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        </Link>
      ) : (
        <div className="px-3.5 py-3.5 text-sm text-muted-foreground">
          Post unavailable
        </div>
      )}

      <div className="mx-3.5 h-px bg-border/80" aria-hidden />

      <div className="flex gap-2.5 px-3.5 pb-3.5 pt-3">
        <div className="flex w-3.5 shrink-0 flex-col items-center pt-1">
          <span className="h-2 w-2 rounded-full bg-primary/85" aria-hidden />
          <span className="mt-1 min-h-6 w-0.5 flex-1 rounded-full bg-border" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold tracking-wide text-primary">
            <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Your comment
          </div>
          <div className="mb-2 flex items-center gap-2">
            <ActivityRowAvatar
              className="h-[34px] w-[34px]"
              name={commentAuthorName}
              imageUrl={commentAvatarUrl}
            />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-foreground">
                {commentAuthorName}
              </p>
              {timeLabel ? (
                <p className="text-xs text-muted-foreground">{timeLabel}</p>
              ) : null}
            </div>
          </div>
          {item.comment.trim() ? (
            <div
              className={cn(
                "max-w-full rounded-xl border border-border/60 bg-muted/40 px-3 py-2.5 text-sm leading-relaxed",
                "dark:border-transparent dark:bg-white/5"
              )}
            >
              <PostDescription
                description={item.comment}
                mentions={item.mentions}
                compact
              />
            </div>
          ) : null}
          {likeSummary ? (
            <div className="mt-2">
              <PostReactionSummaryRow
                summaryTypes={summaryTypes}
                likeSummary={likeSummary}
                onClick={() => setReactionsOpen(true)}
              />
            </div>
          ) : null}
          {postHref ? (
            <Link
              href={postHref}
              className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Open thread on post
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>
      <CommentReactionsDialog
        commentId={item.id}
        open={reactionsOpen}
        onOpenChange={setReactionsOpen}
      />
    </article>
  );
}
