"use client";

import { cn } from "@/lib/utils";

export type HubSegmentTabItem<T extends string> = {
  id: T;
  title: string;
};

/**
 * Pill tab row (LinkedIn-style filter chips): selected tab is a solid primary
 * pill, others are quiet outlined pills. Scrolls sideways on small screens.
 */
export function HubSegmentTabs<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  className,
  trailing,
}: {
  items: HubSegmentTabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  className?: string;
  /** Right-aligned control on the tab row (e.g. sort). */
  trailing?: React.ReactNode;
  /** @deprecated No longer used (pills don't sit flush with the card edge). */
  flush?: boolean;
  /** @deprecated Layout is now a scrollable row; kept for call-site compatibility. */
  gridClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="-my-1 flex min-w-0 flex-1 gap-2 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                "inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-foreground/80 hover:border-foreground/30 hover:bg-muted/60 hover:text-foreground"
              )}
            >
              {item.title}
            </button>
          );
        })}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}
