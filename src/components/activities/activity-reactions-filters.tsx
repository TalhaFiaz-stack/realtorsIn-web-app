"use client";

import type { ActivityReactionsFilter } from "@/features/activities/types/reactions.types";
import { cn } from "@/lib/utils";

const TABS: { id: ActivityReactionsFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "photos", label: "Photos" },
  { id: "text", label: "Posts" },
];

export function ActivityReactionsFilters({
  value,
  onChange,
  disabled,
  selectMode = false,
  onSelectModeToggle,
  selectActionDisabled,
}: {
  value: ActivityReactionsFilter;
  onChange: (next: ActivityReactionsFilter) => void;
  disabled?: boolean;
  selectMode?: boolean;
  onSelectModeToggle?: () => void;
  selectActionDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
      <div
        className="flex min-h-9 min-w-0 flex-1 flex-wrap items-center gap-3"
        role={selectMode ? undefined : "tablist"}
        aria-label={selectMode ? undefined : "Filter reactions"}
      >
        {selectMode ? (
          <p className="text-sm font-semibold text-foreground">
            Select posts to unlike
          </p>
        ) : (
          TABS.map((tab) => {
            const active = value === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={disabled}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
                onClick={() => onChange(tab.id)}
              >
                {tab.label}
              </button>
            );
          })
        )}
      </div>

      {onSelectModeToggle ? (
        <button
          type="button"
          disabled={selectActionDisabled}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors disabled:opacity-40",
            selectMode
              ? "bg-muted text-foreground hover:bg-muted/80"
              : "text-primary hover:bg-primary/10"
          )}
          onClick={onSelectModeToggle}
        >
          {selectMode ? "Cancel" : "Select"}
        </button>
      ) : null}
    </div>
  );
}
