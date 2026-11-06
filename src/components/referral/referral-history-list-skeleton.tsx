import { Skeleton } from "@/components/ui/skeleton";

function ReferralHistoryRowSkeleton({ withSteps = false }: { withSteps?: boolean }) {
  return (
    <li className="border-b border-border py-3 last:border-b-0">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-3 w-20" />
          {withSteps ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-16 rounded-full" />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function ReferralHistoryListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <ul
      className="overflow-hidden rounded-lg border border-border bg-card px-3 shadow-sm"
      aria-busy
      aria-label="Loading referrals"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ReferralHistoryRowSkeleton key={index} withSteps={index === count - 1} />
      ))}
    </ul>
  );
}
