"use client";

import { cn } from "@/lib/utils";
import type { OffPlanDetailTabId } from "@/features/off-plan/types/off-plan.types";
import { offPlanDetailTabDomId } from "@/features/off-plan/lib/build-detail-tabs";
import { OFF_PLAN_DETAIL_SCROLL_OFFSET_PX } from "@/features/off-plan/lib/off-plan-detail-scroll";

export function OffPlanDetailSectionCard({
  tab,
  title,
  children,
  className,
  inset = true,
}: {
  tab: OffPlanDetailTabId;
  title?: string;
  children: React.ReactNode;
  className?: string;
  /** When false, children render without the outer card shell (mobile-style lists). */
  inset?: boolean;
}) {
  return (
    <section
      id={offPlanDetailTabDomId(tab)}
      style={{ scrollMarginTop: OFF_PLAN_DETAIL_SCROLL_OFFSET_PX }}
      className={cn("py-1.5", className)}
    >
      {title ? (
        <h2 className="locale-text mb-2 px-1 text-sm font-bold tracking-tight text-foreground md:text-base">
          {title}
        </h2>
      ) : null}
      {inset ? (
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card p-3 shadow-sm md:p-4">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
