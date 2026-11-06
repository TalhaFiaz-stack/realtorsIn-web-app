"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, List, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OffPlanDetailFooter } from "@/components/listings/off-plan-detail/off-plan-detail-footer";
import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import { ErrorState } from "@/components/states/error-state";
import { EmptyState } from "@/components/states/empty-state";
import {
  fetchOffPlanInventoryClient,
  fetchOffPlanProjectDetailClient,
} from "@/features/off-plan/services/off-plan.client";
import { useTrackOffPlanView } from "@/features/off-plan/hooks/use-track-off-plan-view";
import { formatOffPlanPrice } from "@/features/off-plan/lib/format-off-plan-price";
import {
  inventoryStatusFilterValue,
  inventoryUnitStatusLabel,
  offPlanInventoryUnitTypeChipClassName,
} from "@/features/off-plan/lib/off-plan-inventory-status";
import type { OffPlanInventoryUnit } from "@/features/off-plan/types/off-plan.types";
import {
  OffPlanUnitListRowSkeleton,
  OffPlanUnitsScreenSkeleton,
} from "@/components/listings/off-plan-skeletons";
import { cn } from "@/lib/utils";

function formatAreaSqft(value: number | null): string | null {
  if (value == null || value <= 0) return null;
  return `${value.toLocaleString("en-US")} sqft`;
}

function floorLabel(key: string): string {
  const n = Number(String(key).replace(/\D/g, ""));
  if (String(key).toLowerCase().includes("g") || n === 0) return "G";
  if (Number.isFinite(n) && n > 0) return String(n);
  return key;
}

function floorSortKey(key: string): number {
  const n = Number(String(key).replace(/\D/g, ""));
  if (String(key).toLowerCase().includes("g") || n === 0) return 0;
  return Number.isFinite(n) ? n : 9999;
}

function bedSummary(unit: OffPlanInventoryUnit): string | null {
  const t = unit.unitType?.toLowerCase() ?? "";
  const commercial = ["office", "warehouse", "shop", "compound", "plot"].some(
    (x) => t.includes(x),
  );
  if (commercial) return null;
  const raw = unit.beds?.trim() ?? "";
  if (raw.toLowerCase() === "studio" || raw === "0")
    return "Studio";
  if (raw && Number(raw) > 0) return `${raw} BR`;
  return null;
}

/** Digits only — keeps price/area filters numeric on every browser. */
function digitsOnly(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

function bedFilterLabel(value: string): string {
  if (value === "studio") return "Studio";
  return /^\d+$/.test(value) ? `${value} BR` : value;
}

export function OffPlanUnitsScreen({ projectId }: { projectId: string }) {
  const [searchDigits, setSearchDigits] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [beds, setBeds] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [listView, setListView] = useState(true);

  const projectQuery = useQuery({
    queryKey: ["off-plan", "detail", projectId],
    queryFn: ({ signal }) => fetchOffPlanProjectDetailClient(projectId, signal),
  });

  const inventoryQuery = useQuery({
    queryKey: ["off-plan", "inventory", projectId],
    queryFn: ({ signal }) => fetchOffPlanInventoryClient(projectId, signal),
  });

  // Mobile parity: trackEvents('unit_list_open') + recordAnalyticsApi('project_unit_list_view').
  const unitsProject = projectQuery.data?.project;
  useTrackOffPlanView(
    unitsProject
      ? {
          projectId: unitsProject.id,
          projectName: unitsProject.title,
          eventType: "unit_list_open",
          analyticsAction: "project_unit_list_view",
        }
      : null,
    Boolean(unitsProject)
  );

  const bedOptions = useMemo(() => {
    const set = new Set<string>();
    inventoryQuery.data?.units.forEach((u) => {
      const b = u.beds?.trim().toLowerCase();
      if (!b || b === "studio" || b === "0") return; // "Studio" has its own option
      set.add(b);
    });
    return Array.from(set).sort((a, b) => Number(a) - Number(b) || a.localeCompare(b));
  }, [inventoryQuery.data]);

  const statusFilterOptions = useMemo(() => {
    const units = inventoryQuery.data?.units ?? [];
    const codeSet = new Set<string>();
    const labelEntries = new Map<string, string>();

    for (const u of units) {
      const v = inventoryStatusFilterValue(u);
      if (!v) continue;
      if (v.startsWith("label:")) {
        const key = v.slice("label:".length);
        if (!labelEntries.has(key)) {
          labelEntries.set(key, u.status?.trim() ?? key);
        }
      } else {
        codeSet.add(v);
      }
    }

    const opts: { value: string; label: string }[] = [];
    if (codeSet.has("0")) opts.push({ value: "0", label: "Sold out" });
    if (codeSet.has("1")) opts.push({ value: "1", label: "On sale" });
    if (codeSet.has("2")) opts.push({ value: "2", label: "Booked" });
    for (const [key, label] of labelEntries) {
      opts.push({ value: `label:${key}`, label });
    }
    opts.sort((a, b) => a.label.localeCompare(b.label));
    return opts;
  }, [inventoryQuery.data]);

  const hasStudio = useMemo(
    () =>
      (inventoryQuery.data?.units ?? []).some((u) => {
        const b = u.beds?.trim().toLowerCase();
        return b === "studio" || b === "0";
      }),
    [inventoryQuery.data],
  );

  const activeFilterCount =
    [searchDigits, minPrice, maxPrice, minArea, maxArea].filter((v) =>
      v.trim(),
    ).length +
    (beds !== "all" ? 1 : 0) +
    (status !== "all" ? 1 : 0);

  const clearFilters = () => {
    setSearchDigits("");
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setMaxArea("");
    setBeds("all");
    setStatus("all");
  };

  const filteredUnits = useMemo(() => {
    const units = inventoryQuery.data?.units ?? [];
    return units.filter((u) => {
      if (searchDigits.trim()) {
        const title = u.title.toLowerCase();
        if (!title.includes(searchDigits.trim().toLowerCase())) return false;
      }
      if (beds !== "all") {
        const unitBeds = (u.beds ?? "").toLowerCase();
        if (beds === "studio" && unitBeds !== "studio" && unitBeds !== "0") {
          return false;
        }
        if (beds !== "studio" && unitBeds !== beds) return false;
      }
      if (status !== "all") {
        if (inventoryStatusFilterValue(u) !== status) return false;
      }
      const minP = minPrice ? Number(minPrice) : 0;
      const maxP = maxPrice ? Number(maxPrice) : Infinity;
      if (u.priceStart != null && minP > 0 && u.priceStart < minP) return false;
      if (
        u.priceStart != null &&
        maxPrice &&
        Number.isFinite(maxP) &&
        u.priceStart > maxP
      )
        return false;
      const minA = minArea ? Number(minArea) : 0;
      const maxA = maxArea ? Number(maxArea) : Infinity;
      if (u.areaStart != null && minA > 0 && u.areaStart < minA) return false;
      if (
        u.areaStart != null &&
        maxArea &&
        Number.isFinite(maxA) &&
        u.areaStart > maxA
      )
        return false;
      return true;
    });
  }, [
    inventoryQuery.data,
    searchDigits,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    beds,
    status,
  ]);

  const unitsByFloor = useMemo(() => {
    const map = new Map<string, OffPlanInventoryUnit[]>();
    for (const u of filteredUnits) {
      const key = u.floorKey || "0";
      const list = map.get(key) ?? [];
      list.push(u);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort(
      (a, b) => floorSortKey(a[0]) - floorSortKey(b[0]),
    );
  }, [filteredUnits]);

  const title = projectQuery.data?.project.title ?? "Project units";
  const project = projectQuery.data?.project;
  const projectCurrency = project?.currency ?? "AED";

  if (projectQuery.isLoading) {
    return <OffPlanUnitsScreenSkeleton />;
  }

  return (
    <div className="relative z-0 w-full max-w-4xl space-y-4 pb-24 md:pb-10">
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <ShellBackRow>
            <ShellBackLink href={`/off-plan/${projectId}`} label="Project" />
          </ShellBackRow>
          {!inventoryQuery.isLoading && inventoryQuery.data?.units.length ? (
            <div
              className="flex h-8 rounded-lg bg-muted/40 p-0.5 ring-1 ring-border/50"
              role="group"
              aria-label="View layout"
            >
              <Button
                type="button"
                variant={listView ? "secondary" : "ghost"}
                size="sm"
                className="h-full gap-1 rounded-md px-2 shadow-none"
                onClick={() => setListView(true)}
              >
                <List className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden text-xs font-medium sm:inline">
                  By floor
                </span>
              </Button>
              <Button
                type="button"
                variant={!listView ? "secondary" : "ghost"}
                size="sm"
                className="h-full gap-1 rounded-md px-2 shadow-none"
                onClick={() => setListView(false)}
              >
                <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden text-xs font-medium sm:inline">
                  All units
                </span>
              </Button>
            </div>
          ) : null}
        </div>

        <h1 className="locale-text mb-1 text-2xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="mb-5 text-sm font-medium text-muted-foreground">
          Available units
        </p>

        <div className="mb-4">
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2.5 shadow-sm",
            )}
          >
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              placeholder="Search unit number…"
              inputMode="numeric"
              value={searchDigits}
              onChange={(e) =>
                setSearchDigits(e.target.value.replace(/[^0-9]/g, ""))
              }
              className="h-9 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              aria-label="Search units by number"
            />
          </div>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-6">
          <Input
            placeholder="Min price"
            aria-label="Minimum price"
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(digitsOnly(e.target.value))}
            className="bg-card"
          />
          <Input
            placeholder="Max price"
            aria-label="Maximum price"
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(digitsOnly(e.target.value))}
            className="bg-card"
          />
          <Input
            placeholder="Min area (sqft)"
            aria-label="Minimum area in square feet"
            inputMode="numeric"
            value={minArea}
            onChange={(e) => setMinArea(digitsOnly(e.target.value))}
            className="bg-card"
          />
          <Input
            placeholder="Max area (sqft)"
            aria-label="Maximum area in square feet"
            inputMode="numeric"
            value={maxArea}
            onChange={(e) => setMaxArea(digitsOnly(e.target.value))}
            className="bg-card"
          />
          <Select value={beds} onValueChange={setBeds}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Bedrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All beds</SelectItem>
              {hasStudio ? (
                <SelectItem value="studio">Studio</SelectItem>
              ) : null}
              {bedOptions.map((b) => (
                <SelectItem key={b} value={b}>
                  {bedFilterLabel(b)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statusFilterOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!inventoryQuery.isLoading && !inventoryQuery.isError ? (
          <div className="mb-4 flex min-h-8 flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {activeFilterCount > 0
                ? `${filteredUnits.length.toLocaleString()} of ${(inventoryQuery.data?.units.length ?? 0).toLocaleString()} units`
                : `${(inventoryQuery.data?.units.length ?? 0).toLocaleString()} unit${(inventoryQuery.data?.units.length ?? 0) === 1 ? "" : "s"}`}
            </p>
            {activeFilterCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-muted-foreground"
                onClick={clearFilters}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                Clear filters ({activeFilterCount})
              </Button>
            ) : null}
          </div>
        ) : null}

        {inventoryQuery.isLoading ? (
          <ul className="space-y-3" aria-busy aria-label="Loading units">
            {Array.from({ length: 6 }).map((_, i) => (
              <OffPlanUnitListRowSkeleton key={i} />
            ))}
          </ul>
        ) : null}

        {inventoryQuery.isError ? (
          <ErrorState
            title="Unable to load units"
            onRetry={() => inventoryQuery.refetch()}
          />
        ) : null}

        {!inventoryQuery.isLoading &&
        !inventoryQuery.isError &&
        !filteredUnits.length ? (
          activeFilterCount > 0 ? (
            <EmptyState
              title="No units match your filters"
              description="Try widening the price or area range, or clear your filters."
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          ) : (
            <EmptyState
              title="No units listed yet"
              description="This project has no available units at the moment."
            />
          )
        ) : null}

        {!inventoryQuery.isLoading &&
        !inventoryQuery.isError &&
        filteredUnits.length > 0 ? (
          listView ? (
            <div className="space-y-8">
              {unitsByFloor.map(([floorKey, floorUnits]) => (
                <section key={floorKey} aria-labelledby={`floor-${floorKey}`}>
                  <div className="flex gap-2 sm:gap-3">
                    <div
                      id={`floor-${floorKey}`}
                      className="flex w-10 shrink-0 flex-col items-center justify-start pt-1 sm:w-11"
                    >
                      <div className="flex min-h-[3rem] w-full items-center justify-center rounded-lg bg-muted/80 text-center text-sm font-semibold tabular-nums text-foreground ring-1 ring-border/50 sm:min-h-[3.25rem]">
                        {floorLabel(floorKey)}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:overflow-visible [&::-webkit-scrollbar]:hidden">
                      <ul className="flex gap-2.5 sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
                        {floorUnits.map((unit) => (
                          <li
                            key={unit.id}
                            className="w-[min(17.5rem,78vw)] shrink-0 sm:w-auto"
                          >
                            <UnitInventoryCard
                              projectId={projectId}
                              unit={unit}
                              currency={
                                unit.currency?.trim() || projectCurrency
                              }
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredUnits.map((unit) => (
                <li key={unit.id}>
                  <UnitInventoryCard
                    projectId={projectId}
                    unit={unit}
                    currency={unit.currency?.trim() || projectCurrency}
                  />
                </li>
              ))}
            </ul>
          )
        ) : null}
      </div>

      {project ? (
        <div className="mt-8">
          <OffPlanDetailFooter project={project} />
        </div>
      ) : null}
    </div>
  );
}

function UnitInventoryCard({
  projectId,
  unit,
  currency,
}: {
  projectId: string;
  unit: OffPlanInventoryUnit;
  currency: string;
}) {
  const summaryLine = [
    bedSummary(unit),
    formatAreaSqft(unit.areaStart),
    unit.unitType,
  ]
    .filter(Boolean)
    .join(" · ");

  const statusLabel = inventoryUnitStatusLabel(unit);

  return (
    <Link
      href={`/off-plan/${projectId}/units/${unit.id}`}
      className={cn(
        "flex h-full min-h-[9rem] flex-col overflow-hidden rounded-xl border border-border/60 bg-muted/15 p-4 shadow-sm ring-1 ring-border/30 transition hover:border-primary/35 hover:bg-muted/25 hover:ring-primary/15",
        "dark:bg-card/40",
      )}
    >
      {unit.unitType ? (
        <span className={offPlanInventoryUnitTypeChipClassName()}>
          {unit.unitType}
        </span>
      ) : null}

      {statusLabel ? (
        <span className="mb-2 inline-flex w-fit rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {statusLabel}
        </span>
      ) : null}

      {summaryLine ? (
        <p className="text-sm font-medium leading-snug text-foreground">
          {summaryLine}
        </p>
      ) : null}
      <p className="mt-1 text-base font-semibold leading-tight text-foreground">
        {unit.title}
      </p>
      {unit.priceSqft != null && unit.priceSqft > 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {currency}{" "}
          {unit.priceSqft.toLocaleString("en-US", {
            maximumFractionDigits: 0,
          })}
          /sqft
        </p>
      ) : null}
      <p className="mt-auto pt-2 text-base font-semibold tabular-nums text-foreground">
        {formatOffPlanPrice(unit.priceStart, currency)}
      </p>
    </Link>
  );
}
