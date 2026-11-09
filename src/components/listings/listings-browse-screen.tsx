"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  readListingsFilterSession,
  writeListingsFilterSession,
} from "@/features/off-plan/lib/listings-filter-session";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ListingsBrowseToolbar } from "@/components/listings/listings-browse-toolbar";
import { OffPlanProjectCard } from "@/components/listings/off-plan-project-card";
import {
  OffPlanMapBrowseSkeleton,
  OffPlanProjectGridSkeleton,
} from "@/components/listings/off-plan-skeletons";
import { PublishedListingCard } from "@/components/listings/published-listing-card";
import { PublishedPropertyDetailPanel } from "@/components/listings/published-property-detail-panel";
import { OffPlanFiltersDialog } from "@/components/listings/off-plan-filters-dialog";
import { OffPlanQuickFilters } from "@/components/listings/off-plan-quick-filters";
import { OffPlanSearchDialog } from "@/components/listings/off-plan-search-dialog";
import {
  PropertyHubFiltersDialog,
  type PropertyHubFilterDraft,
} from "@/components/properties/property-hub-filters-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  applyOffPlanSearchPayloadToFilters,
  clearOffPlanSearchFromFilters,
  offPlanSearchSummaryFromDraft,
} from "@/features/off-plan/lib/off-plan-search-apply";
import { OffPlanMapBrowseLayout } from "@/components/listings/off-plan-map-browse-layout";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import {
  useOffPlanProjects,
  usePublishedListings,
} from "@/features/off-plan/hooks/use-off-plan-list";
import { useOffPlanFilterOptions } from "@/features/off-plan/hooks/use-off-plan-filter-options";
import { OFF_PLAN_SORT_OPTIONS } from "@/features/off-plan/constants/off-plan-filters.constants";
import { countOffPlanActiveFilters } from "@/features/off-plan/lib/count-off-plan-filters";
import { countMarketListingActiveFilters } from "@/features/off-plan/lib/count-market-listing-filters";
import {
  fetchOffPlanMapProjectsClient,
  type OffPlanFilterDraft,
} from "@/features/off-plan/services/off-plan.client";
import { useBrokerGate } from "@/components/broker-verification/broker-gate-provider";
import { PROPERTY_HUB_SORT_OPTIONS } from "@/features/properties/constants/property-hub.constants";
import { usePropertyHubFilterOptions } from "@/features/properties/hooks/use-property-hub-filter-options";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { OffPlanProjectSummary } from "@/features/off-plan/types/off-plan.types";
import { useInfiniteScrollTrigger } from "@/hooks/use-infinite-scroll-trigger";

const EMPTY_OFF_PLAN_FILTERS: OffPlanFilterDraft = {
  projectVisibility: "all",
  sortBy: "default",
};

const EMPTY_MARKET_LISTING_FILTERS: PropertyHubFilterDraft = {};

type ListingsTab = "off-plan" | "secondary" | "rental";

function parseTab(raw: string | null): ListingsTab {
  if (raw === "secondary" || raw === "rental") return raw;
  return "off-plan";
}

export function ListingsBrowseScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = parseTab(searchParams.get("tab"));
  const [tab, setTab] = useState<ListingsTab>(initialTab);

  useEffect(() => {
    setTab(parseTab(searchParams.get("tab")));
  }, [searchParams]);

  useEffect(() => {
    setAppliedMarketListingFilters((prev) => {
      const m = prev.mainListingType;
      if (tab === "secondary" && (m === "rent_in" || m === "rent_out")) {
        return { ...prev, mainListingType: "all" };
      }
      if (tab === "rental" && (m === "buy" || m === "sell")) {
        return { ...prev, mainListingType: "all" };
      }
      return prev;
    });
  }, [tab]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [offPlanFilters, setOffPlanFilters] = useState<OffPlanFilterDraft>(
    EMPTY_OFF_PLAN_FILTERS,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [marketFiltersOpen, setMarketFiltersOpen] = useState(false);
  const [offPlanSearchOpen, setOffPlanSearchOpen] = useState(false);
  const [marketSortBy, setMarketSortBy] = useState("newest");
  const [appliedMarketListingFilters, setAppliedMarketListingFilters] =
    useState<PropertyHubFilterDraft>(EMPTY_MARKET_LISTING_FILTERS);
  const initialMapView = searchParams.get("view") === "map";
  const initialMapProject = searchParams.get("project");
  /** Filters restored from this tab's session (until then queries wait). */
  const [filtersRestored, setFiltersRestored] = useState(false);

  useEffect(() => {
    const saved = readListingsFilterSession<OffPlanFilterDraft, PropertyHubFilterDraft>();
    if (saved?.offPlan) setOffPlanFilters({ ...EMPTY_OFF_PLAN_FILTERS, ...saved.offPlan });
    if (saved?.market) {
      setAppliedMarketListingFilters({ ...EMPTY_MARKET_LISTING_FILTERS, ...saved.market });
    }
    if (saved?.marketSort) setMarketSortBy(saved.marketSort);
    setFiltersRestored(true);
  }, []);

  useEffect(() => {
    if (!filtersRestored) return;
    writeListingsFilterSession({
      offPlan: offPlanFilters,
      market: appliedMarketListingFilters,
      marketSort: marketSortBy,
    });
  }, [filtersRestored, offPlanFilters, appliedMarketListingFilters, marketSortBy]);

  const [mapView, setMapView] = useState(initialMapView);
  const [selectedMapProjectId, setSelectedMapProjectId] = useState<
    string | null
  >(initialMapProject);

  useEffect(() => {
    setMapView(searchParams.get("view") === "map");
    const project = searchParams.get("project");
    if (project) setSelectedMapProjectId(project);
  }, [searchParams]);

  const propertyIdRaw = searchParams.get("property");
  const propertyTypeFromUrl = searchParams.get("type")?.trim() ?? null;
  const openContactFromUrl =
    searchParams.get("contact") === "1" ||
    searchParams.get("contact") === "true";
  const propertyIdNum =
    propertyIdRaw != null ? Number(propertyIdRaw) : Number.NaN;
  const publishedPropertyModalOpen =
    (tab === "secondary" || tab === "rental") &&
    Number.isFinite(propertyIdNum) &&
    propertyIdNum > 0 &&
    propertyTypeFromUrl != null &&
    propertyTypeFromUrl.length > 0;

  const closePublishedPropertyModal = () => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("property");
    p.delete("type");
    p.delete("contact");
    const q = p.toString();
    router.replace(q ? `/listings?${q}` : "/listings", { scroll: false });
  };

  const consumePublishedContactParam = () => {
    if (!searchParams.get("contact")) return;
    const p = new URLSearchParams(searchParams.toString());
    p.delete("contact");
    const q = p.toString();
    router.replace(q ? `/listings?${q}` : "/listings", { scroll: false });
  };

  const syncMapUrl = (nextMap: boolean, projectId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "off-plan");
    if (nextMap) params.set("view", "map");
    else params.delete("view");
    if (projectId) params.set("project", projectId);
    else params.delete("project");
    router.replace(`/listings?${params.toString()}`, { scroll: false });
  };

  const filterOptions = useOffPlanFilterOptions();
  const propertyHubFilterOptions = usePropertyHubFilterOptions();
  const activeOffPlanFilterCount = countOffPlanActiveFilters(offPlanFilters);
  const activeMarketFilterCount = useMemo(
    () => countMarketListingActiveFilters(appliedMarketListingFilters),
    [appliedMarketListingFilters],
  );
  const toolbarFilterCount =
    tab === "off-plan"
      ? activeOffPlanFilterCount
      : tab === "secondary" || tab === "rental"
        ? activeMarketFilterCount
        : 0;

  const marketListingsQueryInput = useMemo(() => {
    const f = appliedMarketListingFilters;
    const rawMain = f.mainListingType && f.mainListingType !== "all" ? f.mainListingType : undefined;
    const mainForSecondary =
      rawMain === "buy" || rawMain === "sell" ? rawMain : undefined;
    const mainForRental =
      rawMain === "rent_in" || rawMain === "rent_out" ? rawMain : undefined;
    return {
      searchText: search || undefined,
      sortBy: marketSortBy,
      minPrice: f.minPrice?.trim() || undefined,
      maxPrice: f.maxPrice?.trim() || undefined,
      minArea: f.minArea?.trim() || undefined,
      maxArea: f.maxArea?.trim() || undefined,
      beds: f.beds,
      baths: f.baths,
      availability:
        f.availability === "ready" || f.availability === "offplan"
          ? f.availability
          : undefined,
      mainListingType:
        tab === "secondary" ? mainForSecondary : tab === "rental" ? mainForRental : undefined,
      distressDeal:
        f.distressDeal === "yes" || f.distressDeal === "no"
          ? f.distressDeal
          : undefined,
      propertyCategory: f.propertyCategory?.trim() || undefined,
      filterPropertyTypes: f.filterPropertyTypes?.trim() || undefined,
      city: f.city?.trim() || undefined,
      community: f.community?.trim() || undefined,
      subCommunity: f.subCommunity?.trim() || undefined,
      neighbourhoodId: f.neighbourhoodId,
      buildingId: f.buildingId,
    };
  }, [appliedMarketListingFilters, marketSortBy, search, tab]);

  const offPlanListFilters = useMemo(() => offPlanFilters, [offPlanFilters]);

  const hasMarketRefine = activeMarketFilterCount > 0 || search.length > 0;
  const clearOffPlanFilters = () =>
    setOffPlanFilters((prev) => ({
      ...EMPTY_OFF_PLAN_FILTERS,
      sortBy: prev.sortBy ?? EMPTY_OFF_PLAN_FILTERS.sortBy,
    }));
  const clearMarketFilters = () => {
    setAppliedMarketListingFilters(EMPTY_MARKET_LISTING_FILTERS);
    setSearchInput("");
    setSearch("");
  };

  const offPlanQuery = useOffPlanProjects(offPlanListFilters, {
    enabled: filtersRestored,
  });

  const mapProjectsQuery = useQuery({
    queryKey: ["off-plan", "map", offPlanListFilters],
    queryFn: ({ signal }) =>
      fetchOffPlanMapProjectsClient(offPlanListFilters, signal),
    enabled: filtersRestored && tab === "off-plan" && mapView,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // The full map list is one slow upstream call (~16s). Warm it in the
  // background once the grid has loaded so switching to Map is usually instant.
  const queryClient = useQueryClient();
  const gridReady = tab === "off-plan" && !mapView && Boolean(offPlanQuery.data);
  useEffect(() => {
    if (!gridReady) return;
    const timer = window.setTimeout(() => {
      void queryClient.prefetchQuery({
        queryKey: ["off-plan", "map", offPlanListFilters],
        queryFn: ({ signal }) =>
          fetchOffPlanMapProjectsClient(offPlanListFilters, signal),
        staleTime: 10 * 60 * 1000,
      });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [gridReady, offPlanListFilters, queryClient]);

  const brokerGate = useBrokerGate();

  const secondaryQuery = usePublishedListings(
    { mode: "secondary", ...marketListingsQueryInput },
    { enabled: filtersRestored && tab === "secondary" },
  );

  const rentalQuery = usePublishedListings(
    { mode: "rental", ...marketListingsQueryInput },
    { enabled: filtersRestored && tab === "rental" },
  );

  const offPlanProjects = useMemo(
    () => offPlanQuery.data?.pages.flatMap((p) => p.projects) ?? [],
    [offPlanQuery.data],
  );

  const mapProjects = mapProjectsQuery.data?.projects ?? offPlanProjects;

  const openProjectFromMap = (project: OffPlanProjectSummary) => {
    const href = `/off-plan/${project.id}`;
    if (brokerGate.guard(null, href)) router.push(href);
  };

  const secondaryListings = useMemo(
    () => secondaryQuery.data?.pages.flatMap((p) => p.listings) ?? [],
    [secondaryQuery.data],
  );

  const rentalListings = useMemo(
    () => rentalQuery.data?.pages.flatMap((p) => p.listings) ?? [],
    [rentalQuery.data],
  );

  const offPlanMapMode = tab === "off-plan" && mapView;

  const sortToolbarControl =
    tab === "off-plan" ? (
      <div
        className="inline-flex max-w-full min-w-0 items-center gap-1 rounded-full bg-muted/60 ps-3 pe-0.5"
        role="group"
        aria-label="Sort projects"
      >
        <span className="shrink-0 text-xs text-muted-foreground">Sort:</span>
        <Select
          value={offPlanFilters.sortBy ?? "default"}
          onValueChange={(v) =>
            setOffPlanFilters((prev) => ({ ...prev, sortBy: v }))
          }
        >
          <SelectTrigger
            className="h-8 min-w-[7rem] max-w-[min(11rem,calc(100vw-14rem))] shrink border-0 bg-transparent px-2 text-xs font-semibold shadow-none ring-0 focus:ring-0 [&>span]:line-clamp-1 [&>span]:text-start"
            aria-label="Sort projects"
          >
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" align="start">
            {OFF_PLAN_SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ) : tab === "secondary" || tab === "rental" ? (
      <div
        className="inline-flex max-w-full min-w-0 items-center gap-1 rounded-full bg-muted/60 ps-3 pe-0.5"
        role="group"
        aria-label="Sort listings"
      >
        <span className="shrink-0 text-xs text-muted-foreground">Sort:</span>
        <Select value={marketSortBy} onValueChange={setMarketSortBy}>
          <SelectTrigger
            className="h-8 min-w-[7rem] max-w-[min(11rem,calc(100vw-14rem))] shrink border-0 bg-transparent px-2 text-xs font-semibold shadow-none ring-0 focus:ring-0 [&>span]:line-clamp-1 [&>span]:text-start"
            aria-label="Sort listings"
          >
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" align="start">
            {PROPERTY_HUB_SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ) : null;

  return (
    <div
      className={
        offPlanMapMode ? "relative w-full space-y-3 pb-6" : "relative w-full space-y-4 pb-10"
      }
    >
      <ListingsBrowseToolbar
        tab={tab}
        onTabChange={(next) => {
          setTab(next);
          router.replace(`/listings?tab=${next}`, { scroll: false });
        }}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={() => setSearch(searchInput.trim())}
        mapMode={offPlanMapMode}
        mapView={mapView}
        projectCount={offPlanMapMode ? mapProjects.length : undefined}
        activeFilterCount={toolbarFilterCount}
        onOpenFilters={
          tab === "off-plan"
            ? () => setFiltersOpen(true)
            : tab === "secondary" || tab === "rental"
              ? () => setMarketFiltersOpen(true)
              : undefined
        }
        offPlanSearchSummary={
          tab === "off-plan"
            ? offPlanSearchSummaryFromDraft(offPlanFilters)
            : ""
        }
        onOpenOffPlanSearch={
          tab === "off-plan" ? () => setOffPlanSearchOpen(true) : undefined
        }
        onToggleMapView={() => {
          const next = !mapView;
          setMapView(next);
          if (!next) {
            setSelectedMapProjectId(null);
            syncMapUrl(false, null);
          } else {
            syncMapUrl(true, selectedMapProjectId);
          }
        }}
        quickFilters={
          tab === "off-plan" ? (
            <OffPlanQuickFilters
              draft={offPlanFilters}
              onChange={setOffPlanFilters}
              filterMeta={filterOptions.filters}
              districts={filterOptions.districts}
              projectsForCityCounts={
                mapView && mapProjects.length > 0 ? mapProjects : undefined
              }
            />
          ) : undefined
        }
        sortControl={sortToolbarControl}
      />

      <OffPlanSearchDialog
        open={offPlanSearchOpen}
        onOpenChange={setOffPlanSearchOpen}
        draft={offPlanFilters}
        filterMeta={filterOptions.filters}
        districts={filterOptions.districts}
        onApply={(payload) =>
          setOffPlanFilters((prev) =>
            applyOffPlanSearchPayloadToFilters(prev, payload),
          )
        }
        onReset={() =>
          setOffPlanFilters((prev) => clearOffPlanSearchFromFilters(prev))
        }
      />

      <OffPlanFiltersDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        draft={offPlanFilters}
        filterMeta={filterOptions.filters}
        optionsLoading={filterOptions.isLoading}
        onApply={setOffPlanFilters}
        onReset={() => {
          clearOffPlanFilters();
          setFiltersOpen(false);
        }}
      />

      <PropertyHubFiltersDialog
        open={marketFiltersOpen}
        onOpenChange={setMarketFiltersOpen}
        draft={appliedMarketListingFilters}
        filterOptions={propertyHubFilterOptions.data}
        optionsLoading={propertyHubFilterOptions.isPending}
        showListingStatus={false}
        marketMode={tab === "secondary" ? "secondary" : tab === "rental" ? "rental" : undefined}
        title="Filter properties"
        onApply={setAppliedMarketListingFilters}
        onReset={() => {
          setAppliedMarketListingFilters(EMPTY_MARKET_LISTING_FILTERS);
          setMarketFiltersOpen(false);
        }}
      />

      <div className={offPlanMapMode ? "mt-2" : "mt-4"}>
        {tab === "off-plan" ? (
          mapView ? (
            // Show the map right away with the projects already loaded for the
            // grid; the full set streams in behind a small loading pill.
            (!filtersRestored || mapProjectsQuery.isLoading) && offPlanProjects.length === 0 ? (
              <OffPlanMapBrowseSkeleton />
            ) : mapProjectsQuery.isError && offPlanProjects.length === 0 ? (
              <ErrorState
                title="Unable to load map projects"
                onRetry={() => mapProjectsQuery.refetch()}
              />
            ) : (
              <OffPlanMapBrowseLayout
                projects={mapProjects}
                loadingAll={mapProjectsQuery.isFetching && !mapProjectsQuery.data}
                loadError={mapProjectsQuery.isError && !mapProjectsQuery.data}
                onRetryAll={() => void mapProjectsQuery.refetch()}
                districts={filterOptions.districts}
                selectedDistrictId={offPlanFilters.districtId}
                selectedProjectId={selectedMapProjectId}
                onSelectProject={(id) => {
                  setSelectedMapProjectId(id);
                  syncMapUrl(true, id);
                }}
                onOpenProject={openProjectFromMap}
              />
            )
          ) : (
            <>
              <ListingGrid
                loading={!filtersRestored || offPlanQuery.isLoading}
                error={offPlanQuery.isError}
                onRetry={() => offPlanQuery.refetch()}
                emptyTitle="No projects found"
                emptyDescription="Try adjusting filters or search."
                onClearFilters={
                  activeOffPlanFilterCount > 0 ? clearOffPlanFilters : undefined
                }
              >
                {offPlanProjects.map((p) => (
                  <OffPlanProjectCard key={p.id} project={p} />
                ))}
              </ListingGrid>
              <ListingInfiniteScrollFooter
                hasNextPage={offPlanQuery.hasNextPage}
                isFetchingNextPage={offPlanQuery.isFetchingNextPage}
                isLoading={!filtersRestored || offPlanQuery.isLoading}
                itemCount={offPlanProjects.length}
                fetchNextPage={() => offPlanQuery.fetchNextPage()}
              />
            </>
          )
        ) : null}

        {tab === "secondary" ? (
          <>
            <ListingGrid
              loading={!filtersRestored || secondaryQuery.isLoading}
              error={secondaryQuery.isError}
              onRetry={() => secondaryQuery.refetch()}
              emptyTitle="No secondary listings"
              emptyDescription="No active secondary listings match your search."
              onClearFilters={hasMarketRefine ? clearMarketFilters : undefined}
            >
              {secondaryListings.map((p) => (
                <PublishedListingCard key={`${p.type}-${p.id}`} listing={p} />
              ))}
            </ListingGrid>
            <ListingInfiniteScrollFooter
              hasNextPage={secondaryQuery.hasNextPage}
              isFetchingNextPage={secondaryQuery.isFetchingNextPage}
              isLoading={!filtersRestored || secondaryQuery.isLoading}
              itemCount={secondaryListings.length}
              fetchNextPage={() => secondaryQuery.fetchNextPage()}
            />
          </>
        ) : null}

        {tab === "rental" ? (
          <>
            <ListingGrid
              loading={!filtersRestored || rentalQuery.isLoading}
              error={rentalQuery.isError}
              onRetry={() => rentalQuery.refetch()}
              emptyTitle="No rental listings"
              emptyDescription="Try another search or adjust your filters."
              onClearFilters={hasMarketRefine ? clearMarketFilters : undefined}
            >
              {rentalListings.map((p) => (
                <PublishedListingCard key={`${p.type}-${p.id}`} listing={p} />
              ))}
            </ListingGrid>
            <ListingInfiniteScrollFooter
              hasNextPage={rentalQuery.hasNextPage}
              isFetchingNextPage={rentalQuery.isFetchingNextPage}
              isLoading={!filtersRestored || rentalQuery.isLoading}
              itemCount={rentalListings.length}
              fetchNextPage={() => rentalQuery.fetchNextPage()}
            />
          </>
        ) : null}
      </div>

      <Dialog
        open={publishedPropertyModalOpen}
        onOpenChange={(open) => {
          if (!open) closePublishedPropertyModal();
        }}
      >
        <DialogContent
          className="max-h-[min(92vh,840px)] w-[calc(100%-2rem)] max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl"
          showCloseButton
          closeButtonClassName="flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md ring-1 ring-border/70 backdrop-blur-sm hover:bg-background"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Property details</DialogTitle>
            <DialogDescription>
              Photos, price, description, and contact options for this listing.
            </DialogDescription>
          </DialogHeader>
          {publishedPropertyModalOpen ? (
            <div className="max-h-[min(92vh,840px)] overflow-y-auto">
              <PublishedPropertyDetailPanel
                propertyId={propertyIdNum}
                type={propertyTypeFromUrl!}
                variant="modal"
                openContactOnLoad={openContactFromUrl}
                onContactIntentConsumed={consumePublishedContactParam}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ListingGrid({
  children,
  loading,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  onClearFilters,
}: {
  children: React.ReactNode;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  emptyTitle: string;
  emptyDescription: string;
  /** When set (filters/search active), the empty state offers a one-tap reset. */
  onClearFilters?: () => void;
}) {
  if (loading) {
    return <OffPlanProjectGridSkeleton count={6} />;
  }
  if (error) {
    return (
      <ErrorState
        title="Unable to load listings"
        description="Check your connection and try again."
        onRetry={onRetry}
      />
    );
  }
  if (!React.Children.count(children)) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onClearFilters ? "Clear filters" : undefined}
        onAction={onClearFilters}
      />
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">{children}</div>
  );
}

function ListingInfiniteScrollFooter({
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  itemCount,
  fetchNextPage,
}: {
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  itemCount: number;
  fetchNextPage: () => void;
}) {
  const sentinelRef = useInfiniteScrollTrigger({
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
    itemCount,
    enabled: itemCount > 0,
  });

  if (itemCount === 0) return null;

  return (
    <div className="mt-4 space-y-4">
      {isFetchingNextPage ? <OffPlanProjectGridSkeleton count={2} /> : null}
      {hasNextPage ? (
        <div
          ref={sentinelRef}
          className="h-4 w-full shrink-0 scroll-mt-4"
          aria-hidden
        />
      ) : (
        <p className="py-4 text-center text-sm text-muted-foreground">
          You&apos;re all caught up
        </p>
      )}
    </div>
  );
}
