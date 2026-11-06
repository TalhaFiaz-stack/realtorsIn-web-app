"use client";

import Link from "next/link";
import { ChevronRight, MessageCircle, Repeat2 } from "lucide-react";
import { ActivityPostEmbeds } from "@/features/activities/lib/activity-post-embeds";
import {
  activityPostHasVisualEmbed,
  shouldShowActivityPostDescription,
} from "@/features/activities/lib/activity-post-preview";
import type { ActivityRepostItem } from "@/features/activities/types/activity.types";
import { PostDescription } from "@/components/feed/post-description";
import { PostReactionSummaryRow } from "@/components/feed/post-reaction-summary-row";
import {
  formatPostLikeSummary,
  getSummaryReactionTypes,
} from "@/features/feed/constants/post-reactions";
import { ActivityRowAvatar } from "@/components/activities/activity-row-avatar";
import { ProfileHandle } from "@/components/shared/profile-handle";
import { cn } from "@/lib/utils";

export function ActivityRepostRow({ item }: { item: ActivityRepostItem }) {
  const post = item.post;
  const postHref = `/posts/${post.id}`;
  const authorProfileHref = post.userName ? `/u/${post.userName}` : null;
  const repostedLabel = item.repostedAt
    ? `You reposted · ${item.repostedAt}`
    : "You reposted";
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

  return (
    <article className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm dark:shadow-none">
      <Link
        href={postHref}
        className="block px-3.5 pb-3.5 pt-3.5 transition-colors hover:bg-muted/25"
      >
        <div className="mb-2.5 flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
          <Repeat2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{repostedLabel}</span>
        </div>

        {item.repostText?.trim() ? (
          <p className="mb-3 text-sm leading-relaxed text-foreground">
            {item.repostText}
          </p>
        ) : null}

        <div className="border-s-[3px] border-primary/80 ps-3">
          <div className="flex items-start gap-2.5">
            {authorProfileHref ? (
              <Link
                href={authorProfileHref}
                className="shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <ActivityRowAvatar
                  className="h-9 w-9"
                  name={post.authorName}
                  imageUrl={post.avatarUrl}
                />
              </Link>
            ) : (
              <ActivityRowAvatar
                className="h-9 w-9"
                name={post.authorName}
                imageUrl={post.avatarUrl}
              />
            )}
            <div className="min-w-0 flex-1">
              {authorProfileHref ? (
                <Link
                  href={authorProfileHref}
                  className="block"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-[15px] font-bold leading-snug text-foreground hover:underline">
                    {post.authorName}
                  </p>
                </Link>
              ) : (
                <p className="text-[15px] font-bold leading-snug text-foreground">
                  {post.authorName}
                </p>
              )}
              {post.userName ? (
                <ProfileHandle userName={post.userName} className="text-xs" />
              ) : null}
            </div>
          </div>

          {shouldShowActivityPostDescription(post) ? (
            <div className="mt-2 line-clamp-4 text-sm text-foreground/90">
              <PostDescription
                description={post.description}
                mentions={post.mentions}
                compact
              />
            </div>
          ) : null}

          {activityPostHasVisualEmbed(post) ? (
            <ActivityPostEmbeds post={post} className="mt-2.5" />
          ) : null}

          <div
            className={cn(
              "mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
            )}
          >
            {likeSummary ? (
              <PostReactionSummaryRow
                summaryTypes={summaryTypes}
                likeSummary={likeSummary}
              />
            ) : null}
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              {post.commentCount}
            </span>
          </div>
        </div>

        <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-primary">
          View post
          <ChevronRight className="h-4 w-4" aria-hidden />
        </span>
      </Link>
    </article>
  );
}
