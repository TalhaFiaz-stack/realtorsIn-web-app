import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function EventDetailSkeleton({
  variant = "page",
}: {
  variant?: "page" | "embedded";
}) {
  const embedded = variant === "embedded";

  return (
    <div className="w-full" aria-busy aria-label="Loading event">
      <div
        className={cn(
          "overflow-hidden bg-card",
          !embedded && "rounded-xl border border-border/80 shadow-sm"
        )}
      >
        <Skeleton
          className={cn(
            "w-full shrink-0 rounded-none",
            embedded ? "aspect-[5/2] max-h-44" : "aspect-[2/1]"
          )}
        />

        <div className={cn("space-y-4", embedded ? "px-4 py-4" : "space-y-5 p-5 md:p-6")}>
          <Skeleton className="h-3 w-40 rounded" />
          <Skeleton className="h-7 w-[90%] max-w-sm rounded-md" />

          <div className="space-y-3 border-y border-border/80 py-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
                <Skeleton className="h-4 flex-1 max-w-[14rem] rounded" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-14 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
          </div>

          {!embedded ? (
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-10 w-36 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
