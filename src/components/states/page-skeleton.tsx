import { Skeleton } from "@/components/ui/skeleton";

/** Neutral route-transition placeholder — not feed-specific. */
export function PageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading page">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <Skeleton className="h-10 w-full max-w-xl rounded-md" />
      <div className="space-y-2 overflow-hidden rounded-[var(--radius)] border border-border bg-card p-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 py-2">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-40 max-w-[70%]" />
              <Skeleton className="h-3 w-56 max-w-[90%]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
