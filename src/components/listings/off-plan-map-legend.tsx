"use client";

import { OFF_PLAN_MAP_LEGEND } from "@/features/off-plan/lib/off-plan-map-status-colors";

/** Compact status key — one pill row instead of a large card over the map. */
export function OffPlanMapLegend() {
  return (
    <ul
      className="pointer-events-none flex min-h-9 max-w-full flex-wrap items-center gap-x-3 gap-y-1 whitespace-nowrap rounded-2xl border border-border/60 bg-background/95 px-3 py-1.5 text-[11px] font-medium text-foreground/80 shadow-md backdrop-blur-md"
      aria-label="Development status"
    >
      {OFF_PLAN_MAP_LEGEND.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

/** Top-left overlay row: optional leading control (e.g. "Projects") + legend. */
export function OffPlanMapTopStart({ leading }: { leading?: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute start-3 top-3 z-[1002] flex max-w-[calc(100%-4.5rem)] flex-wrap items-center gap-2">
      {leading}
      <OffPlanMapLegend />
    </div>
  );
}
