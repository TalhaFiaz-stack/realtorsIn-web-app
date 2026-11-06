"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { InlineLoader } from "@/components/states/inline-loader";
import { VerifiedBadgeIcon } from "@/components/profile/profile-badges";
import { PostReactionIcon } from "@/features/feed/constants/post-reaction-icons";
import { fetchCommentReactionsRequest } from "@/features/feed/services/posts.client";
import type { PostLiker } from "@/features/feed/types/post.types";
import { ApiError } from "@/lib/api/errors";
import { formatRelativeTime } from "@/lib/format-relative-time";

function formatRoleAtCompany(role: string | null, company: string | null) {
  const r = role?.trim() || "";
  const c = company?.trim() || "";
  if (r && c) return `${r} at ${c}`;
  if (r) return r;
  if (c) return `working at ${c}`;
  return "";
}

function LikersShimmer() {
  return (
    <ul className="space-y-1" aria-busy="true" aria-label="Loading reactions">
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index} className="flex items-center gap-3 px-2 py-2.5">
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
          <span className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3 w-48" />
          </span>
          <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
        </li>
      ))}
    </ul>
  );
}

export function CommentReactionsDialog({
  commentId,
  open,
  onOpenChange,
}: {
  commentId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [likers, setLikers] = useState<PostLiker[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || commentId == null) {
      setLikers([]);
      setPage(1);
      setHasNextPage(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setLikers([]);
    setPage(1);

    void fetchCommentReactionsRequest({ commentId, page: 1 })
      .then((result) => {
        if (cancelled) return;
        setLikers(result.likers);
        setHasNextPage(result.hasNextPage);
        setPage(result.page);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Unable to load reactions"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, commentId]);

  async function loadMore() {
    if (commentId == null || loading || loadingMore || !hasNextPage) return;
    setLoadingMore(true);
    setError(null);
    try {
      const result = await fetchCommentReactionsRequest({
        commentId,
        page: page + 1,
      });
      setLikers((prev) => [...prev, ...result.likers]);
      setHasNextPage(result.hasNextPage);
      setPage(result.page);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Unable to load more reactions"
      );
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(88vh,640px)] max-w-md gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle>Comment reactions</DialogTitle>
          <DialogDescription className="sr-only">
            People who reacted to this comment
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(70vh,520px)] overflow-y-auto p-2">
          {loading ? (
            <LikersShimmer />
          ) : error && likers.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            </div>
          ) : likers.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Heart className="h-7 w-7 text-muted-foreground" />
              </span>
              <p className="text-sm font-semibold text-foreground">
                No reactions yet
              </p>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {likers.map((liker) => {
                const subtitle = formatRoleAtCompany(liker.role, liker.company);
                const reactedAgo = formatRelativeTime(liker.likedAt);
                const href = liker.userName
                  ? `/u/${liker.userName}`
                  : `/profile/${liker.userId}`;
                return (
                  <li key={`${liker.userId}-${liker.likedAt ?? ""}`}>
                    <Link
                      href={href}
                      className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-muted/60"
                      onClick={() => onOpenChange(false)}
                    >
                      <Avatar className="h-11 w-11 shrink-0">
                        {liker.avatarUrl ? (
                          <AvatarImage src={liker.avatarUrl} alt="" />
                        ) : null}
                        <AvatarPlaceholderFallback />
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="flex min-w-0 items-center gap-1">
                          <span className="truncate text-sm font-semibold">
                            {liker.name}
                          </span>
                          {liker.isVerified ? (
                            <VerifiedBadgeIcon size={14} />
                          ) : null}
                        </span>
                        {subtitle || reactedAgo ? (
                          <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {subtitle}
                            {subtitle && reactedAgo ? (
                              <span aria-hidden="true"> · </span>
                            ) : null}
                            {reactedAgo ? (
                              <span className="whitespace-nowrap tabular-nums">
                                {reactedAgo}
                              </span>
                            ) : null}
                          </span>
                        ) : null}
                      </span>
                      <PostReactionIcon type={liker.reactionType} size={22} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {hasNextPage ? (
            <div className="flex justify-center py-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={loadingMore}
                onClick={() => void loadMore()}
              >
                {loadingMore ? <InlineLoader /> : null}
                Load more
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
