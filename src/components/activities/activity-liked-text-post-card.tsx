"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { ActivityPostEmbeds } from "@/features/activities/lib/activity-post-embeds";
import {
  activityPostHasVisualEmbed,
  shouldShowActivityPostDescription,
} from "@/features/activities/lib/activity-post-preview";
import type { FeedPost } from "@/features/feed/types/post.types";
import { PostDescription } from "@/components/feed/post-description";
import { PostReactionIcon } from "@/features/feed/constants/post-reaction-icons";
import { ActivityRowAvatar } from "@/components/activities/activity-row-avatar";
import { ProfileHandle } from "@/components/shared/profile-handle";
import {
  formatPostLikeSummary,
  getPostReactionMeta,
  getSummaryReactionTypes,
} from "@/features/feed/constants/post-reactions";
import { cn } from "@/lib/utils";

export function ActivityLikedTextPostCard({
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
  const postHref = `/posts/${post.id}`;
  const userReaction = post.userReaction ?? "like";
  const reactionMeta = getPostReactionMeta(userReaction);
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

  const body = (
    <>
      <div className="flex items-start gap-3">
        <ActivityRowAvatar
          className="h-11 w-11"
          name={post.authorName}
          imageUrl={post.avatarUrl}
        />
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-foreground">{post.authorName}</p>
          {post.userName ? (
            <ProfileHandle userName={post.userName} className="text-xs" />
          ) : null}
        </div>
        {selectMode ? (
          <button
            type="button"
            aria-label={selected ? "Deselect post" : "Select post"}
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSelect();
            }}
          >
            {selected ? <Check className="h-3.5 w-3.5" /> : null}
          </button>
        ) : reactionMeta ? (
          <PostReactionIcon type={userReaction} size={22} />
        ) : null}
      </div>
      {shouldShowActivityPostDescription(post) ? (
        <div className="mt-2 line-clamp-3 text-sm">
          <PostDescription
            description={post.description}
            mentions={post.mentions}
            compact
          />
        </div>
      ) : null}
      {activityPostHasVisualEmbed(post) ? (
        <ActivityPostEmbeds post={post} className="mt-2" />
      ) : null}
      {likeSummary ? (
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          {likeSummary}
          {post.commentCount > 0 ? (
            <span>{` · ${post.commentCount} comments`}</span>
          ) : null}
        </p>
      ) : null}
    </>
  );

  if (selectMode) {
    return (
      <button
        type="button"
        className={cn(
          "locale-text w-full rounded-2xl border border-border bg-card p-3.5 text-start shadow-sm transition-colors",
          selected && "border-primary/50 bg-primary/5"
        )}
        onClick={onToggleSelect}
      >
        {body}
      </button>
    );
  }

  return (
    <Link
      href={postHref}
      className="block rounded-2xl border border-border bg-card p-3.5 shadow-sm transition-colors hover:bg-muted/25"
    >
      {body}
    </Link>
  );
}
