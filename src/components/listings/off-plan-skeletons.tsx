import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Matches `OffPlanProjectCard` layout (browse grid). */
export function OffPlanProjectCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
      aria-hidden
    >
      <div className="relative aspect-[16/9] w-full">
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="absolute inset-x-0 bottom-0 flex justify-between gap-2 px-2.5 pb-2.5">
          <div className="space-y-1">
            <Skeleton className="h-2.5 w-8 bg-white/20" />
            <Skeleton className="h-5 w-28 bg-white/30" />
          </div>
          <Skeleton className="h-6 w-[4.5rem] rounded-md bg-white/25" />
        </div>
      </div>
      <div className="space-y-1 px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 min-w-0 flex-1 max-w-[65%]" />
          <div className="space-y-1 text-end">
            <Skeleton className="ms-auto h-2.5 w-14" />
            <Skeleton className="ms-auto h-3 w-[4.5rem]" />
          </div>
        </div>
        <Skeleton className="h-3 w-[40%]" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3.5 min-w-0 flex-1 max-w-[85%]" />
          <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
        </div>
      </div>
    </article>
  );
}

export function OffPlanProjectGridSkeleton({
  count = 6,
  className,
  columns = "sm:grid-cols-2",
}: {
  count?: number;
  className?: string;
  columns?: string;
}) {
  return (
    <div
      className={cn("grid gap-4", columns, className)}
      aria-busy
      aria-label="Loading projects"
    >
      {Array.from({ length: count }).map((_, i) => (
        <OffPlanProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

const MAP_CARD_IMAGE_H = 96;
const MAP_CARD_BODY_MIN_H = 72;

/** Matches compact `OffPlanMapGridCard` (map sidebar). */
function OffPlanMapGridCardSkeleton() {
  return (
    <div
      className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm ring-1 ring-black/[0.03]"
      aria-hidden
    >
      <div
        className="relative w-full shrink-0 overflow-hidden bg-muted"
        style={{ height: MAP_CARD_IMAGE_H }}
      >
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="absolute inset-x-1.5 top-1.5 flex justify-between gap-1">
          <Skeleton className="h-4 w-14 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-1 px-1.5 pb-1.5 pt-4">
          <div className="space-y-0.5">
            <Skeleton className="h-2 w-6 bg-white/25" />
            <Skeleton className="h-3.5 w-[4.5rem] bg-white/30" />
          </div>
          <Skeleton className="h-4 w-8 rounded bg-white/30" />
        </div>
      </div>
      <div
        className="flex shrink-0 flex-col gap-1 p-2 pt-1.5"
        style={{ minHeight: MAP_CARD_BODY_MIN_H }}
      >
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-[85%]" />
        <div className="flex items-end justify-between gap-1">
          <Skeleton className="h-2.5 w-[45%]" />
          <div className="space-y-0.5 text-end">
            <Skeleton className="ms-auto h-2 w-10" />
            <Skeleton className="ms-auto h-2.5 w-12" />
          </div>
        </div>
        <Skeleton className="h-2.5 w-[70%]" />
      </div>
    </div>
  );
}

/** Map browse: project list column + map pane. */
export function OffPlanMapBrowseSkeleton() {
  return (
    <div
      className="flex h-[calc(100vh-9.5rem)] min-h-[480px] overflow-hidden rounded-2xl bg-background shadow-md ring-1 ring-border/60"
      aria-busy
      aria-label="Loading map projects"
    >
      <aside className="flex w-[min(100%,28rem)] shrink-0 flex-col border-e border-border/60 bg-muted/10 sm:w-[28rem]">
        <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-background/80 px-3 py-2.5 backdrop-blur-sm">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-2.5 pb-4">
          <ul className="grid grid-cols-2 gap-2.5 auto-rows-fr">
            {Array.from({ length: 10 }).map((_, i) => (
              <li key={i} className="flex min-h-0 min-w-0">
                <OffPlanMapGridCardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <div className="relative min-h-0 min-w-0 flex-1">
        <OffPlanMapPanelSkeleton className="absolute inset-0 h-full rounded-none" />
      </div>
    </div>
  );
}

const MAP_PIN_PLACES: { top: string; left: string; size: string }[] = [
  { top: "28%", left: "38%", size: "h-9 w-9" },
  { top: "42%", left: "55%", size: "h-10 w-10" },
  { top: "52%", left: "32%", size: "h-8 w-8" },
  { top: "35%", left: "68%", size: "h-7 w-7" },
  { top: "58%", left: "48%", size: "h-9 w-9" },
];

export function OffPlanMapPanelSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-full min-h-[480px] overflow-hidden bg-muted/35 dark:bg-muted/20",
        className,
      )}
      aria-busy
      aria-label="Loading map"
    >
      <div
        className="absolute inset-0 opacity-50"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(#d1d5db 1px, transparent 1px), linear-gradient(90deg, #d1d5db 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <Skeleton className="absolute inset-0 rounded-none bg-muted/20" />
      {MAP_PIN_PLACES.map((pin, i) => (
        <Skeleton
          key={i}
          className={cn(
            "absolute rounded-full shadow-md ring-2 ring-white/80",
            pin.size,
          )}
          style={{ top: pin.top, left: pin.left }}
        />
      ))}
      <div className="absolute bottom-3 start-3 end-3 flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card/95 px-3 py-2 shadow-sm backdrop-blur-sm">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-16 rounded-full" />
        ))}
      </div>
      <div className="absolute end-3 top-3 flex flex-col gap-1.5">
        <Skeleton className="h-9 w-9 rounded-md shadow-sm" />
        <Skeleton className="h-9 w-9 rounded-md shadow-sm" />
      </div>
    </div>
  );
}

function OffPlanDetailTabBarSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden py-1" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-20 shrink-0 rounded-full" />
      ))}
    </div>
  );
}

function OffPlanDetailSectionSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card p-4 shadow-sm">
      <Skeleton className="mb-3 h-4 w-32" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-3", i === lines - 1 ? "w-[70%]" : "w-full")}
          />
        ))}
      </div>
    </div>
  );
}

/** Matches `OffPlanDetailPage` hero + tabs + sections. */
export function OffPlanDetailPageSkeleton() {
  return (
    <div className="w-full max-w-4xl space-y-4 pb-24 md:pb-10" aria-busy aria-label="Loading project">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <div className="flex flex-col md:flex-row">
            <Skeleton className="aspect-[2/1] max-h-[11.5rem] w-full shrink-0 rounded-none md:aspect-[4/3] md:max-h-[13.5rem] md:w-[min(42%,18rem)] md:border-e md:border-border/80" />
            <div className="flex flex-1 flex-col gap-3 p-4">
              <Skeleton className="h-7 w-[85%]" />
              <Skeleton className="h-4 w-[60%]" />
              <Skeleton className="h-[4.5rem] w-full rounded-lg" />
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
        <div className="relative z-20 bg-card/80">
          <OffPlanDetailTabBarSkeleton />
        </div>
        <div className="space-y-3 px-0 pb-4 pt-3 md:px-1">
          <OffPlanDetailSectionSkeleton lines={4} />
          <OffPlanDetailSectionSkeleton lines={3} />
          <OffPlanDetailSectionSkeleton lines={5} />
        </div>
        <div className="hidden rounded-xl border border-border/80 bg-card p-4 shadow-sm md:block">
          <Skeleton className="mb-3 h-3 w-36" />
          <div className="flex gap-2">
            <Skeleton className="h-11 flex-1 rounded-lg" />
            <Skeleton className="h-11 flex-1 rounded-lg" />
            <Skeleton className="h-11 flex-1 rounded-lg" />
          </div>
        </div>
    </div>
  );
}

/** Single unit row on inventory screen. */
export function OffPlanUnitListRowSkeleton() {
  return (
    <li
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
      aria-hidden
    >
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3.5 w-56 max-w-full" />
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </li>
  );
}

export function OffPlanUnitsScreenSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div
      className="relative z-0 w-full max-w-4xl pb-24 md:pb-10"
      aria-busy
      aria-label="Loading units"
    >
      <div>
        <Skeleton className="mb-4 h-10 w-32 rounded-full" />
        <Skeleton className="mb-2 h-8 w-48" />
        <Skeleton className="mb-6 h-4 w-36" />
        <div className="mb-6 grid grid-cols-2 gap-2 lg:grid-cols-3">
          <Skeleton className="col-span-2 h-10 lg:col-span-3" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <ul className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <OffPlanUnitListRowSkeleton key={i} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export function OffPlanUnitDetailSkeleton() {
  return (
    <div
      className="relative z-0 w-full max-w-4xl pb-24 md:pb-10"
      aria-busy
      aria-label="Loading unit"
    >
      <div>
        <Skeleton className="mb-4 h-10 w-28 rounded-full" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-40" />
        <div className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}
