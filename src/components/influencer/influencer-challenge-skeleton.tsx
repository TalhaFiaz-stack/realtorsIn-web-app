import { Skeleton } from "@/components/ui/skeleton";

export function InfluencerChallengeSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Loading influencer challenge">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <Skeleton className="mx-auto h-12 w-12 rounded-full" />
        <Skeleton className="mx-auto mt-4 h-6 w-48" />
        <Skeleton className="mx-auto mt-2 h-4 w-36" />
        <div className="mt-6 grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-md" />
          ))}
        </div>
        <Skeleton className="mt-4 h-2 w-full rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
