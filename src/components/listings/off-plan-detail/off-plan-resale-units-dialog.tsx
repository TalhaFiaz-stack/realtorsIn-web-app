"use client";

import Link from "next/link";
import { BedDouble, Bath, ChevronRight, Ruler } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/states/empty-state";
import { formatOffPlanPrice } from "@/features/off-plan/lib/format-off-plan-price";
import type { OffPlanResaleUnit } from "@/features/off-plan/types/off-plan.types";

function range(a: number | null, b: number | null, fmt: (n: number) => string) {
  if (a != null && b != null && a !== b) return `${fmt(a)} – ${fmt(b)}`;
  const v = a ?? b;
  return v != null ? fmt(v) : null;
}

/** Mobile `ReSellUnitModal`: resale listings inside an off-plan project. */
export function OffPlanResaleUnitsDialog({
  open,
  onOpenChange,
  projectTitle,
  units,
  fallbackCurrency,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  units: OffPlanResaleUnit[];
  fallbackCurrency: string | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,640px)] flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-5 py-4 text-start">
          <DialogTitle className="text-base font-semibold">Re-sell units</DialogTitle>
          <DialogDescription className="locale-text text-xs">
            {units.length} listing{units.length === 1 ? "" : "s"} in {projectTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {units.length === 0 ? (
            <EmptyState title="No re-sell units" className="border-none" />
          ) : (
            <ul className="space-y-2">
              {units.map((u) => {
                const currency = u.currency || fallbackCurrency || "AED";
                const price = range(u.priceStart, u.priceEnd, (n) =>
                  formatOffPlanPrice(n, currency)
                );
                const area = range(u.areaStart, u.areaEnd, (n) =>
                  `${n.toLocaleString("en-US")} sqft`
                );
                return (
                  <li key={u.id}>
                    <Link
                      href={`/listings/property/${u.id}?type=sell`}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3 transition hover:border-primary/35 hover:bg-muted/30"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="locale-text truncate text-sm font-semibold">{u.title}</p>
                        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {u.bedrooms ? (
                            <span className="inline-flex items-center gap-1">
                              <BedDouble className="h-3.5 w-3.5" aria-hidden />
                              {u.bedrooms}
                            </span>
                          ) : null}
                          {u.baths ? (
                            <span className="inline-flex items-center gap-1">
                              <Bath className="h-3.5 w-3.5" aria-hidden />
                              {u.baths}
                            </span>
                          ) : null}
                          {area ? (
                            <span className="inline-flex items-center gap-1">
                              <Ruler className="h-3.5 w-3.5" aria-hidden />
                              {area}
                            </span>
                          ) : null}
                        </p>
                        <p className="text-sm font-semibold tabular-nums">
                          {price ?? "Price on request"}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
