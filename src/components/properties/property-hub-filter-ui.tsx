"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FilterSection({
  title,
  hint,
  children,
  className,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-2.5", className)}>
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </h3>
        {hint ? (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function FilterChip({
  active,
  children,
  onClick,
  className,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        active
          ? "border-primary/40 bg-primary text-primary-foreground shadow-sm"
          : "border-border/80 bg-background text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

export function FilterChipRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>{children}</div>
  );
}
