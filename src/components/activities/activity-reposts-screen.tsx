"use client";

import { useEffect, useMemo, useRef } from "react";
import { Repeat2 } from "lucide-react";
import { ActivityRepostRow } from "@/components/activities/activity-repost-row";
import {
  ActivityRepostRowSkeleton,
  ActivityRepostsShimmer,
} from "@/components/activities/activity-shimmers";
import { ErrorState } from "@/components/states/error-state";
import {
  activityErrorMessage,
  useActivityReposts,
} from "@/features/activities/hooks/use-activities";

type ActivityRepostsQuery = ReturnType<typeof useActivityReposts>;

export function ActivityRepostsScreen({
  query: queryProp,
}: {
  query?: ActivityRepostsQuery;
}) {
  const fallbackQuery = useActivityReposts();
  const query = queryProp ?? fallbackQuery;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const reposts = useMemo(
    () => query.data?.pages.flatMap((p) => p.reposts) ?? [],
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
    return <ActivityRepostsShimmer count={3} />;
  }

  if (query.isError) {
    return (
      <ErrorState
        title="Could not load reposts"
        description={activityErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (reposts.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center px-8 py-12 text-center">
        <Repeat2
          className="h-20 w-20 stroke-[1.25] text-muted-foreground/35"
          aria-hidden
        />
        <p className="mt-5 text-[22px] font-semibold text-foreground">
          No reposts yet
        </p>
        <p className="mt-2.5 text-sm text-muted-foreground">
          Posts you&apos;ve reposted will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {reposts.map((item) => (
        <ActivityRepostRow key={item.id} item={item} />
      ))}
      {query.isFetchingNextPage ? <ActivityRepostRowSkeleton /> : null}
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
    </div>
  );
}
