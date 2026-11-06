import { Skeleton } from "@/components/ui/skeleton";

export function DetailListCardSkeleton({
  rows = 4,
  ariaLabel = "Loading list",
}: {
  rows?: number;
  ariaLabel?: string;
}) {
  return (
    <ul
      className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
      aria-busy
      aria-label={ariaLabel}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <li
          key={index}
          className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-36 max-w-full" />
            <Skeleton className="h-3 w-48 max-w-full" />
          </div>
          <Skeleton className="hidden h-8 w-16 shrink-0 rounded-md sm:block" />
        </li>
      ))}
    </ul>
  );
}

export function DetailTagListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul
      className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
      aria-busy
      aria-label="Loading tags"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <li
          key={index}
          className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
            <Skeleton className="h-4 w-32 max-w-full" />
          </div>
          <Skeleton className="h-8 w-20 shrink-0 rounded-md" />
        </li>
      ))}
    </ul>
  );
}

export function DetailMetricGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      aria-busy
      aria-label="Loading metrics"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <Skeleton className="h-8 w-14" />
          <Skeleton className="mt-2 h-4 w-32" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
