"use client";

import Link from "next/link";
import { DetailTagListSkeleton } from "@/components/states/detail-list-skeleton";
import { Hash } from "lucide-react";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";
import {
  followedHashtagsErrorMessage,
  useFollowedHashtags,
  useUnfollowHashtag,
} from "@/features/hashtag/hooks/use-followed-hashtags";
import { showAppToast } from "@/lib/toast/app-toast";

export function FollowedTagsScreen() {
  const query = useFollowedHashtags();
  const unfollow = useUnfollowHashtag();

  if (query.isLoading) {
    return <DetailTagListSkeleton />;
  }

  if (query.isError) {
    return (
      <ErrorState
        title="Could not load tags"
        description={followedHashtagsErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const tags = query.data?.tags ?? [];

  if (tags.length === 0) {
    return (
      <EmptyState
        title="No followed tags"
        description="Follow hashtags from the feed to see updates here."
        actionLabel="Browse feed"
        onAction={() => {
          window.location.href = "/feed";
        }}
      />
    );
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {tags.map((tag) => (
        <li
          key={tag.id}
          className="flex items-center justify-between gap-3 px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Hash className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0">
              <Link
                href={`/search?q=${encodeURIComponent(tag.label)}`}
                className="font-medium text-foreground hover:underline"
              >
                {tag.label}
              </Link>
              <p className="text-xs text-muted-foreground">
                {tag.usageCount} posts
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={unfollow.isPending}
            onClick={() => {
              void unfollow
                .mutateAsync({ hashtagId: tag.id, hashtag: tag.title })
                .then((res) =>
                  showAppToast.success("Unfollowed", res.message)
                )
                .catch((error) =>
                  showAppToast.fromError(error, "Could not unfollow")
                );
            }}
          >
            Unfollow
          </Button>
        </li>
      ))}
    </ul>
  );
}
