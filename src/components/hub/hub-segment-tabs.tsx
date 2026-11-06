"use client";

import { cn } from "@/lib/utils";

export type HubSegmentTabItem<T extends string> = {
  id: T;
  title: string;
};

export function HubSegmentTabs<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  className,
  gridClassName = "grid-cols-2 sm:grid-cols-4",
}: {
  items: HubSegmentTabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  className?: string;
  gridClassName?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-0.5 rounded-lg border border-border/70 bg-muted/40 p-0.5",
        gridClassName,
        className
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const active = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative rounded-md px-2 py-1.5 text-center text-xs font-semibold transition-colors sm:text-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              active
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.title}
          </button>
        );
      })}
    </div>
  );
}
