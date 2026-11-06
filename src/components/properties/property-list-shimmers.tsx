import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Mirrors `PropertyListingCard` / `PropertyMatchCard` grid tiles. */
export function PropertyListingCardSkeleton({
  showImage = true,
  showFooterAction = true,
}: {
  showImage?: boolean;
  showFooterAction?: boolean;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {showImage ? (
        <Skeleton className="aspect-[2/1] w-full shrink-0 rounded-none" />
      ) : null}
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-10 min-h-[2.5rem] flex-1 rounded-md" />
          <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
        </div>
        <Skeleton className="h-3 w-12" />
        <div className="flex gap-2 border-t border-border/70 pt-2">
          <Skeleton className="h-4 flex-1 max-w-[55%]" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-[88%]" />
        <div className="flex gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
        <Skeleton className="mt-auto h-3 w-28" />
      </div>
      {showFooterAction ? (
        <div className="border-t border-border/80 px-3.5 py-2">
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      ) : null}
    </div>
  );
}

export function PropertyListGridShimmer({
  count = 6,
  className,
  showImage = true,
  showFooterAction = true,
}: {
  count?: number;
  className?: string;
  showImage?: boolean;
  showFooterAction?: boolean;
}) {
  return (
    <ul
      className={cn("grid gap-3 sm:grid-cols-2", className)}
      aria-busy
      aria-label="Loading listings"
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="h-full">
          <PropertyListingCardSkeleton
            showImage={showImage}
            showFooterAction={showFooterAction}
          />
        </li>
      ))}
    </ul>
  );
}

/** “Your listing” block on matches / detail loading. */
export function PropertyListingDetailSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-4 border-t border-border/70 pt-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
