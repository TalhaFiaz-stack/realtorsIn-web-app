"use client";

import type { ReactNode } from "react";
import { LayoutGrid, Map, Search, SlidersHorizontal } from "lucide-react";
import {
  HubControlCard,
  HubControlCardBody,
  HubControlCardHeader,
} from "@/components/hub/hub-control-card";
import { ListingsHubHeader } from "@/components/listings/listings-hub-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ListingsTab = "off-plan" | "secondary" | "rental";

type Props = {
  tab: ListingsTab;
  onTabChange: (tab: ListingsTab) => void;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: () => void;
  mapMode?: boolean;
  mapView?: boolean;
  onToggleMapView?: () => void;
  activeFilterCount?: number;
  onOpenFilters?: () => void;
  projectCount?: number;
  offPlanSearchSummary?: string;
  onOpenOffPlanSearch?: () => void;
  quickFilters?: ReactNode;
  /** Shown in the top bar immediately after the Off Plan / Secondary / Rental tabs */
  sortControl?: ReactNode;
};

export function ListingsBrowseToolbar({
  tab,
  onTabChange,
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  mapMode = false,
  mapView = false,
  onToggleMapView,
  activeFilterCount = 0,
  onOpenFilters,
  projectCount,
  offPlanSearchSummary,
  onOpenOffPlanSearch,
  quickFilters,
  sortControl,
}: Props) {
  const offPlanSearchMode = tab === "off-plan" && Boolean(onOpenOffPlanSearch);

  return (
    <HubControlCard
      className={cn(
        mapMode ? "rounded-2xl shadow-md ring-1 ring-border/50 backdrop-blur-md" : "",
      )}
    >
      {!mapMode ? (
        <HubControlCardHeader>
          <ListingsHubHeader />
        </HubControlCardHeader>
      ) : null}

      <div
        className={cn(
          "flex flex-wrap items-center gap-2 border-b border-border/50 px-3 py-2.5 sm:px-4",
          mapMode ? "bg-muted/25" : "bg-muted/15",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Tabs
            value={tab}
            onValueChange={(v) => onTabChange(v as ListingsTab)}
            className="min-w-0 shrink-0"
          >
            <TabsList className="inline-flex h-8 gap-0.5 rounded-lg bg-background/80 p-0.5 shadow-sm">
              <TabsTrigger
                value="off-plan"
                className="rounded-md px-2.5 text-xs data-[state=active]:shadow-sm sm:px-3 sm:text-sm"
              >
                Off Plan
              </TabsTrigger>
              <TabsTrigger
                value="secondary"
                className="rounded-md px-2.5 text-xs data-[state=active]:shadow-sm sm:px-3 sm:text-sm"
              >
                Secondary
              </TabsTrigger>
              <TabsTrigger
                value="rental"
                className="rounded-md px-2.5 text-xs data-[state=active]:shadow-sm sm:px-3 sm:text-sm"
              >
                Rental
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {sortControl ? (
            <div className="min-w-0">{sortControl}</div>
          ) : null}
        </div>

        <div className="ms-auto flex shrink-0 items-center gap-2">
          {mapMode && projectCount != null ? (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold tabular-nums text-foreground">
                {projectCount.toLocaleString()}
              </span>{" "}
              <span className="hidden sm:inline">projects</span>
            </p>
          ) : null}

          {tab === "off-plan" && onToggleMapView ? (
            <div
              className="flex h-8 rounded-lg bg-background/90 p-0.5 shadow-sm ring-1 ring-border/60"
              role="group"
              aria-label="View mode"
            >
              <Button
                type="button"
                variant={!mapView ? "secondary" : "ghost"}
                size="sm"
                className="h-full gap-1 rounded-md px-2 shadow-none"
                onClick={() => mapView && onToggleMapView()}
              >
                <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden text-xs font-medium sm:inline">
                  Grid
                </span>
              </Button>
              <Button
                type="button"
                variant={mapView ? "secondary" : "ghost"}
                size="sm"
                className="h-full gap-1 rounded-md px-2 shadow-none"
                onClick={() => !mapView && onToggleMapView()}
              >
                <Map className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden text-xs font-medium sm:inline">
                  Map
                </span>
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <HubControlCardBody className="space-y-0 px-3 py-3 sm:px-4">
      <form
        className="flex flex-col gap-0"
        onSubmit={(e) => {
          e.preventDefault();
          if (offPlanSearchMode) {
            onOpenOffPlanSearch?.();
            return;
          }
          onSearchSubmit();
        }}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            {offPlanSearchMode ? (
              <button
                type="button"
                onClick={onOpenOffPlanSearch}
                className={cn(
                  "flex h-11 w-full items-center rounded-xl border-0 ps-10 pe-4 text-start text-sm shadow-inner transition",
                  "bg-muted/35 ring-1 ring-border/50 hover:bg-muted/50",
                  offPlanSearchSummary && "font-medium text-foreground",
                )}
              >
                <span className="truncate">
                  {offPlanSearchSummary ||
                    "Search projects, developers, districts…"}
                </span>
              </button>
            ) : (
              <Input
                value={searchInput}
                onChange={(e) => onSearchInputChange(e.target.value)}
                placeholder="Search projects or properties…"
                className="h-11 rounded-xl border-0 bg-muted/35 ps-10 shadow-inner ring-1 ring-border/50"
              />
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {onOpenFilters ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-3 shadow-sm"
                onClick={onOpenFilters}
              >
                <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden />
                <span className="hidden sm:inline">More filters</span>
                <span className="sm:hidden">Filters</span>
                {activeFilterCount > 0 ? (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                ) : null}
              </Button>
            ) : null}

            {!offPlanSearchMode ? (
              <Button type="submit" size="sm" className="h-11 rounded-xl px-5">
                Search
              </Button>
            ) : null}
          </div>
        </div>

        {quickFilters ? (
          <div className="mt-3 border-t border-border/40 pt-3">
            {quickFilters}
          </div>
        ) : null}
      </form>
      </HubControlCardBody>
    </HubControlCard>
  );
}
