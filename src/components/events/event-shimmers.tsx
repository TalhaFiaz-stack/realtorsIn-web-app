import { Skeleton } from "@/components/ui/skeleton";
import {
  HubTwoColumnGrid,
  HubTwoColumnGridItem,
} from "@/components/hub/hub-two-column-grid";

export function EventCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <Skeleton className="aspect-[16/10] w-full shrink-0 rounded-none" />
      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 min-h-[1.25rem] w-[90%] rounded-md" />
        <Skeleton className="h-3.5 w-[75%]" />
        <Skeleton className="mt-auto h-3.5 w-[55%]" />
      </div>
    </div>
  );
}

export function EventsListShimmer({ count = 4 }: { count?: number }) {
  return (
    <HubTwoColumnGrid ariaBusy ariaLabel="Loading events">
      {Array.from({ length: count }).map((_, i) => (
        <HubTwoColumnGridItem key={i}>
          <EventCardSkeleton />
        </HubTwoColumnGridItem>
      ))}
    </HubTwoColumnGrid>
  );
}
