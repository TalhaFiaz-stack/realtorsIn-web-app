"use client";

import type { ReactNode } from "react";
import { LayoutGrid, Map, Search, SlidersHorizontal } from "lucide-react";
import {
  HubControlCard,
  HubControlCardBody,
  HubControlCardHeader,
} from "@/components/hub/hub-control-card";
import { ListingsHubHeader } from "@/components/listings/listings-hub-header";
import { HubSegmentTabs } from "@/components/hub/hub-segment-tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ListingsTab = "off-plan" | "secondary" | "rental";

const LISTINGS_TABS: { id: ListingsTab; title: string }[] = [
  { id: "off-plan", title: "Off Plan" },
  { id: "secondary", title: "Secondary" },
  { id: "rental", title: "Rental" },
];

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

  const viewToggle =
    tab === "off-plan" && onToggleMapView ? (
      <div
        className="flex h-9 rounded-full bg-muted/70 p-0.5"
        role="group"
        aria-label="View mode"
      >
        <button
          type="button"
          aria-pressed={!mapView}
          onClick={() => mapView && onToggleMapView()}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors",
            !mapView
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">Grid</span>
        </button>
        <button
          type="button"
          aria-pressed={mapView}
          onClick={() => !mapView && onToggleMapView()}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors",
            mapView
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Map className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">Map</span>
        </button>
      </div>
    ) : null;

  return (
    <HubControlCard
      className={cn(
        mapMode ? "rounded-2xl shadow-md ring-1 ring-border/50 backdrop-blur-md" : "",
      )}
    >
      {!mapMode ? (
        <HubControlCardHeader>
          <ListingsHubHeader action={viewToggle} />
        </HubControlCardHeader>
      ) : null}

      <HubSegmentTabs
        items={LISTINGS_TABS}
        value={tab}
        onChange={onTabChange}
        ariaLabel="Listing type"
        className={cn("px-3 pb-1 sm:px-4", mapMode ? "pt-3" : "pt-3")}
        trailing={
          <div className="flex items-center gap-2">
            {mapMode && projectCount != null ? (
              <p className="hidden text-xs text-muted-foreground sm:block">
                <span className="font-semibold tabular-nums text-foreground">
                  {projectCount.toLocaleString()}
                </span>{" "}
                projects
              </p>
            ) : null}
            {sortControl}
            {mapMode ? viewToggle : null}
          </div>
        }
      />

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
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              {offPlanSearchMode ? (
                <button
                  type="button"
                  onClick={onOpenOffPlanSearch}
                  className={cn(
                    "flex h-10 w-full items-center rounded-full bg-muted/60 ps-10 pe-4 text-start text-sm text-muted-foreground transition-colors hover:bg-muted",
                    offPlanSearchSummary && "font-medium text-foreground",
                  )}
                >
                  <span className="truncate">
                    {offPlanSearchSummary || "Search projects, developers, districts…"}
                  </span>
                </button>
              ) : (
                <Input
                  value={searchInput}
                  onChange={(e) => onSearchInputChange(e.target.value)}
                  placeholder="Search properties, areas or agents…"
                  className="h-10 rounded-full border-transparent bg-muted/60 ps-10 shadow-none hover:bg-muted focus-visible:border-primary/40 focus-visible:bg-background"
                />
              )}
            </div>

            {onOpenFilters ? (
              <Button
                type="button"
                variant="outline"
                className="h-10 shrink-0 gap-2 rounded-full border-border/70 px-4 shadow-none"
                onClick={onOpenFilters}
              >
                <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                ) : null}
              </Button>
            ) : null}

            {!offPlanSearchMode ? (
              <Button type="submit" className="h-10 shrink-0 rounded-full px-5 shadow-none">
                Search
              </Button>
            ) : null}
          </div>

          {quickFilters ? <div className="mt-3">{quickFilters}</div> : null}
        </form>
      </HubControlCardBody>
    </HubControlCard>
  );
}
