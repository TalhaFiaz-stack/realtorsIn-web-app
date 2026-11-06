import { Skeleton } from "@/components/ui/skeleton";

function ScheduledPostRowSkeleton() {
  return (
    <div
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
      aria-hidden
    >
      <div className="flex gap-3">
        <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-[70%]" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
    </div>
  );
}

export function ScheduledPostsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="space-y-3"
      aria-busy="true"
      aria-label="Loading scheduled posts"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ScheduledPostRowSkeleton key={index} />
      ))}
    </div>
  );
}
