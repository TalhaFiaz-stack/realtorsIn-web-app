import { Skeleton } from "@/components/ui/skeleton";
import {
  HubTwoColumnGrid,
  HubTwoColumnGridItem,
} from "@/components/hub/hub-two-column-grid";
import {
  JOB_CARD_BODY_MIN,
  JOB_CARD_IMAGE_HEIGHT,
} from "@/components/jobs/job-card";
import { cn } from "@/lib/utils";

/** Mirrors `JobCard` grid tiles. */
export function JobCardSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <Skeleton className={cn("w-full rounded-none", JOB_CARD_IMAGE_HEIGHT)} />
      <div
        className={cn(
          "flex flex-1 flex-col gap-2 p-3",
          JOB_CARD_BODY_MIN
        )}
      >
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-3.5 w-[72%]" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          <Skeleton className="h-5 w-[4.5rem] rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function JobsListGridShimmer({ count = 4 }: { count?: number }) {
  return (
    <HubTwoColumnGrid ariaBusy ariaLabel="Loading jobs">
      {Array.from({ length: count }).map((_, i) => (
        <HubTwoColumnGridItem key={i}>
          <JobCardSkeleton />
        </HubTwoColumnGridItem>
      ))}
    </HubTwoColumnGrid>
  );
}
