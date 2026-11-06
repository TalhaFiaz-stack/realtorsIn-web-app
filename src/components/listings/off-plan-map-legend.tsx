"use client";

import { OFF_PLAN_MAP_LEGEND } from "@/features/off-plan/lib/off-plan-map-status-colors";

export function OffPlanMapLegend() {
  return (
    <div className="pointer-events-none absolute start-3 top-3 z-[1000] max-w-[11rem] rounded-2xl border border-border/50 bg-background/90 p-3.5 text-xs shadow-lg backdrop-blur-md">
      <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        Development status
      </p>
      <ul className="space-y-1.5">
        {OFF_PLAN_MAP_LEGEND.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full border border-border/50"
              style={{ backgroundColor: item.color }}
              aria-hidden
            />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
