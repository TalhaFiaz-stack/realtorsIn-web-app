"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  HubControlCard,
  HubControlCardBody,
  HubControlCardHeader,
} from "@/components/hub/hub-control-card";
import { HubSearchInput } from "@/components/hub/hub-search-input";
import { PropertyListingCard } from "@/components/properties/property-listing-card";
import {
  PropertyHubFiltersDialog,
  type PropertyHubFilterDraft,
} from "@/components/properties/property-hub-filters-dialog";
import { PropertyHubTabs } from "@/components/properties/property-hub-tabs";
import { PropertyListGridShimmer } from "@/components/properties/property-list-shimmers";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countMarketListingActiveFilters } from "@/features/off-plan/lib/count-market-listing-filters";
import {
  PROPERTY_HUB_SORT_OPTIONS,
  type PropertyHubTabId,
} from "@/features/properties/constants/property-hub.constants";
import { usePropertyHubFilterOptions } from "@/features/properties/hooks/use-property-hub-filter-options";
import {
  propertiesErrorMessage,
  usePropertyHubList,
} from "@/features/properties/hooks/use-property-hub";
import type { PropertyHubListFilters } from "@/features/properties/types/property-hub.types";
import { cn } from "@/lib/utils";
import { PropertyHubHeader } from "@/components/properties/property-hub-header";

const EMPTY_FILTER_DRAFT: PropertyHubFilterDraft = {
  availability: "all",
};

export function PropertyHubScreen() {
  const [tab, setTab] = useState<PropertyHubTabId>("buy");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterDraft, setFilterDraft] =
    useState<PropertyHubFilterDraft>(EMPTY_FILTER_DRAFT);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const listFilters: PropertyHubListFilters = useMemo(
    () => ({
      tab,
      search: search || undefined,
      sortBy,
      ...filterDraft,
    }),
    [tab, search, sortBy, filterDraft]
  );

  const filterOptionsQuery = usePropertyHubFilterOptions();
  const query = usePropertyHubList(listFilters);
  const listings = query.data?.listings ?? [];
  const total = query.data?.total ?? 0;
  const loadedCount = query.data?.loadedCount ?? listings.length;
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  const activeFilterCount = useMemo(
    () => countMarketListingActiveFilters(filterDraft),
    [filterDraft]
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          void fetchNextPage();
        }
      },
      { rootMargin: "320px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  function resetFilters() {
    setFilterDraft(EMPTY_FILTER_DRAFT);
  }

  return (
    <div className="w-full max-w-2xl space-y-4 pb-10">
      <HubControlCard>
        <HubControlCardHeader>
          <PropertyHubHeader />
        </HubControlCardHeader>

        <HubControlCardBody>
          <PropertyHubTabs value={tab} onChange={setTab} />

          <HubSearchInput
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={() => setSearch(searchInput.trim())}
            onClear={() => {
              setSearchInput("");
              setSearch("");
            }}
            placeholder="Search your listings"
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-2 rounded-full border-border/70 px-4 shadow-none",
                activeFilterCount > 0 && "border-primary/40 bg-primary/5 text-primary"
              )}
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              Filters
              {activeFilterCount > 0 ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold tabular-nums text-primary-foreground">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>

            {activeFilterCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 rounded-full text-muted-foreground"
                onClick={resetFilters}
              >
                Clear
              </Button>
            ) : null}

            <div
              className="ms-auto inline-flex min-w-0 items-center gap-1 rounded-full bg-muted/60 ps-3 pe-0.5"
              role="group"
              aria-label="Sort listings"
            >
              <span className="shrink-0 text-xs text-muted-foreground">Sort:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger
                  className="h-8 min-w-[7.5rem] border-0 bg-transparent px-2 text-xs font-medium shadow-none ring-0 focus:ring-0 [&>span]:line-clamp-1 [&>span]:text-start"
                  aria-label="Sort listings"
                >
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" align="end">
                  {PROPERTY_HUB_SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </HubControlCardBody>
      </HubControlCard>

      {!query.isLoading && !query.isError && total > 0 ? (
        <p className="text-xs font-medium text-muted-foreground">
          Showing {loadedCount.toLocaleString()} of {total.toLocaleString()}{" "}
          listing{total === 1 ? "" : "s"}
          {hasNextPage ? " · scroll for more" : ""}
        </p>
      ) : null}

      {query.isLoading ? (
        <PropertyListGridShimmer
          count={6}
          showImage={tab === "sell" || tab === "rent_out"}
        />
      ) : query.isError ? (
        <ErrorState
          title="Unable to load properties"
          description={propertiesErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      ) : listings.length === 0 ? (
        search || activeFilterCount > 0 ? (
          <EmptyState
            title="No listings match"
            description="Try another keyword or adjust your filters."
            actionLabel="Clear filters"
            onAction={() => {
              resetFilters();
              setSearchInput("");
              setSearch("");
            }}
          />
        ) : (
          <EmptyState
            title="No listings yet"
            description="Your listings across buy, sell, and rent will appear here."
          />
        )
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2">
            {listings.map((listing) => (
              <li key={listing.listingRowId} className="h-full">
                <PropertyListingCard listing={listing} />
              </li>
            ))}
          </ul>

          {isFetchingNextPage ? (
            <PropertyListGridShimmer
              count={2}
              className="pt-0"
              showImage={tab === "sell" || tab === "rent_out"}
            />
          ) : null}

          {hasNextPage && !isFetchingNextPage ? (
            <div className="flex justify-center pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-lg px-5"
                onClick={() => void fetchNextPage()}
              >
                Load more
              </Button>
            </div>
          ) : null}

          <div ref={sentinelRef} className="h-px w-full shrink-0" aria-hidden />
        </>
      )}

      <PropertyHubFiltersDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        draft={filterDraft}
        filterOptions={filterOptionsQuery.data}
        optionsLoading={filterOptionsQuery.isLoading}
        onApply={setFilterDraft}
        onReset={() => {
          resetFilters();
          setFiltersOpen(false);
        }}
      />
    </div>
  );
}
