import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Hub card — matches `ActivityHubCard` / mobile `ActivityCardShimmer`. */
export function ActivityHubCardSkeleton() {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-border/80 bg-card px-3 py-3.5",
        "shadow-[0_2px_7px_rgba(15,23,42,0.06)] dark:shadow-none"
      )}
    >
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2 pr-1">
        <Skeleton className="h-[15px] w-[45%] max-w-[140px]" />
        <Skeleton className="h-[13px] w-[70%] max-w-[220px]" />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Skeleton className="h-[22px] w-8 rounded-[10px]" />
        <Skeleton className="h-4 w-4 rounded-sm" />
      </div>
    </div>
  );
}

export function ActivityHubShimmer({ count = 4 }: { count?: number }) {
  return (
    <div
      className="flex flex-col gap-2.5"
      aria-busy
      aria-label="Loading activity summary"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ActivityHubCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Comment activity row — matches `ActivityCommentRow`. */
export function ActivityCommentRowSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm dark:shadow-none">
      <div className="px-3.5 pb-3 pt-3.5">
        <Skeleton className="mb-2.5 h-3 w-[100px]" />
        <div className="flex items-start gap-2.5">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-[45%]" />
            <Skeleton className="h-3.5 w-[90%]" />
            <Skeleton className="h-3.5 w-[75%]" />
          </div>
        </div>
        <Skeleton className="mt-3 h-3.5 w-20" />
      </div>
      <div className="mx-3.5 h-px bg-border/80" aria-hidden />
      <div className="flex gap-2.5 px-3.5 pb-3.5 pt-3">
        <Skeleton className="h-20 w-3.5 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <Skeleton className="mb-2 h-3 w-[90px]" />
          <div className="mb-2 flex items-center gap-2">
            <Skeleton className="h-[34px] w-[34px] rounded-full" />
            <Skeleton className="h-3.5 flex-1 max-w-[120px]" />
          </div>
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ActivityCommentsShimmer({ count = 3 }: { count?: number }) {
  return (
    <div
      className="space-y-3.5"
      aria-busy
      aria-label="Loading comments"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ActivityCommentRowSkeleton key={i} />
      ))}
    </div>
  );
}

/** Repost row — matches `ActivityRepostRow`. */
export function ActivityRepostRowSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card px-3.5 py-3.5 shadow-sm dark:shadow-none">
      <div className="mb-2.5 flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-sm" />
        <Skeleton className="h-3.5 w-36" />
      </div>
      <div className="border-s-[3px] border-border ps-3">
        <div className="flex items-start gap-2.5">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="mt-2 space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-[85%]" />
        </div>
        <Skeleton className="mt-2.5 h-32 w-full rounded-xl" />
        <div className="mt-3 flex gap-4">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-12" />
        </div>
      </div>
      <Skeleton className="mt-3 h-3.5 w-20" />
    </div>
  );
}

export function ActivityRepostsShimmer({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3.5" aria-busy aria-label="Loading reposts">
      {Array.from({ length: count }).map((_, i) => (
        <ActivityRepostRowSkeleton key={i} />
      ))}
    </div>
  );
}

/** Feed-style post — reactions / saved lists (`PostCard` layout, no extra page padding). */
export function ActivityFeedPostSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm">
      <div className="flex items-start gap-3 px-4 pt-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2 pt-0.5">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-2 px-4 pb-2 pt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[92%]" />
      </div>
      <Skeleton className="mx-4 mb-3 h-40 w-[calc(100%-2rem)] rounded-xl" />
      <div className="flex gap-2 border-t border-border px-2 py-2">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 flex-1 rounded-md" />
      </div>
    </div>
  );
}

export function ActivityPostsShimmer({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy aria-label="Loading posts">
      {Array.from({ length: count }).map((_, i) => (
        <ActivityFeedPostSkeleton key={i} />
      ))}
    </div>
  );
}
