"use client";

import { cn } from "@/lib/utils";
import type { OffPlanDetailTabId } from "@/features/off-plan/types/off-plan.types";

function tabShortLabel(tab: OffPlanDetailTabId): string {
  switch (tab) {
    case "Facilities & Amenities":
      return "Facilities";
    case "Location & Nearby":
      return "Location";
    case "Commercial Details":
      return "Commercial";
    case "Sales Agencies":
      return "Agencies";
    case "Sales Executive":
      return "Sales exec";
    case "Visual overview":
      return "Overview";
    default:
      return tab;
  }
}

export function OffPlanDetailTabBar({
  tabs,
  activeTab,
  scrollRef,
  onSelect,
  className,
}: {
  tabs: OffPlanDetailTabId[];
  activeTab: OffPlanDetailTabId;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (tab: OffPlanDetailTabId) => void;
  className?: string;
  pinned?: boolean;
}) {
  return (
    <nav
      className={cn("relative border-b border-border/80", className)}
      aria-label="Project sections"
    >
      <div
        ref={scrollRef}
        className="-mb-px flex w-full gap-0 overflow-x-auto scroll-smooth scrollbar-none"
        role="tablist"
      >
        {tabs.map((tab) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={active}
              title={tab}
              data-off-plan-tab={tab}
              onClick={() => onSelect(tab)}
              className={cn(
                "relative shrink-0 px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4",
                "whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="sm:hidden">{tabShortLabel(tab)}</span>
              <span className="hidden sm:inline">{tab}</span>
              {active ? (
                <span
                  className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
