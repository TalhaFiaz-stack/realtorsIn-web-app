"use client";

import Link from "next/link";
import { ActivityPostEmbeds } from "@/features/activities/lib/activity-post-embeds";
import {
  activityPostHasVisualEmbed,
  shouldShowActivityPostDescription,
} from "@/features/activities/lib/activity-post-preview";
import { PostDescription } from "@/components/feed/post-description";
import {
  Avatar,
  AvatarImage,
  AvatarPlaceholderFallback,
} from "@/components/ui/avatar";
import { ProfileHandle } from "@/components/shared/profile-handle";
import type { FeedPost } from "@/features/feed/types/post.types";
import { cn } from "@/lib/utils";

/** Nested original post inside a repost-with-thoughts card (mobile `PostContainer`). */
export function PostQuotedEmbed({
  post,
  className,
}: {
  post: FeedPost;
  className?: string;
}) {
  const profileHref = post.userName ? `/u/${post.userName}` : null;
  const postHref = `/posts/${post.id}`;

  return (
    <Link
      href={postHref}
      className={cn(
        "mx-4 block rounded-xl border border-border/80 bg-muted/20 p-3 transition-colors hover:bg-muted/35",
        className
      )}
    >
      <div className="flex items-start gap-2.5">
        {profileHref ? (
          <span className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <Avatar className="h-8 w-8">
              {post.avatarUrl ? (
                <AvatarImage src={post.avatarUrl} alt="" />
              ) : null}
              <AvatarPlaceholderFallback />
            </Avatar>
          </span>
        ) : (
          <Avatar className="h-8 w-8 shrink-0">
            {post.avatarUrl ? (
              <AvatarImage src={post.avatarUrl} alt="" />
            ) : null}
            <AvatarPlaceholderFallback />
          </Avatar>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-foreground">
            {post.authorName}
          </p>
          {post.userName ? (
            <ProfileHandle userName={post.userName} className="text-xs" />
          ) : null}
        </div>
      </div>

      {shouldShowActivityPostDescription(post) ? (
        <div className="mt-2 line-clamp-6 text-sm text-foreground/90">
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
    </Link>
  );
}
