"use client";

import { useEffect, useMemo, useRef } from "react";
import { ActivityCommentRow } from "@/components/activities/activity-comment-row";
import {
  ActivityCommentRowSkeleton,
  ActivityCommentsShimmer,
} from "@/components/activities/activity-shimmers";
import { ErrorState } from "@/components/states/error-state";
import { MessageCircle } from "lucide-react";
import {
  activityErrorMessage,
  useActivityComments,
} from "@/features/activities/hooks/use-activities";

type ActivityCommentsQuery = ReturnType<typeof useActivityComments>;

export function ActivityCommentsScreen({
  query: queryProp,
}: {
  query?: ActivityCommentsQuery;
}) {
  const fallbackQuery = useActivityComments();
  const query = queryProp ?? fallbackQuery;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const comments = useMemo(
    () => query.data?.pages.flatMap((p) => p.comments) ?? [],
    [query.data?.pages]
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !query.hasNextPage || query.isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void query.fetchNextPage();
        }
      },
      { rootMargin: "240px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [query]);

  if (query.isLoading) {
    return <ActivityCommentsShimmer count={3} />;
  }

  if (query.isError) {
    return (
      <ErrorState
        title="Could not load comments"
        description={activityErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center px-8 py-12 text-center">
        <MessageCircle
          className="h-20 w-20 stroke-[1.25] text-muted-foreground/35"
          aria-hidden
        />
        <p className="mt-5 text-[22px] font-semibold text-foreground">
          No comments yet
        </p>
        <p className="mt-2.5 text-sm text-muted-foreground">
          Your comments will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {comments.map((item) => (
        <ActivityCommentRow key={item.id} item={item} />
      ))}
      {query.isFetchingNextPage ? (
        <ActivityCommentRowSkeleton />
      ) : null}
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
    </div>
  );
}
