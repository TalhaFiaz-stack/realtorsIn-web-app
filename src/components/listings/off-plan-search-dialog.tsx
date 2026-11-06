"use client";

import { useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  OffPlanSearchChipSection,
  OffPlanSearchDialogContentSkeleton,
  OffPlanSearchProjectSection,
  OffPlanSearchRecentSection,
  OffPlanSearchSuggestionList,
} from "@/components/listings/off-plan-search-dialog-sections";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  buildInitialOffPlanSearchChoices,
  buildOffPlanRecentItems,
  buildOffPlanSearchApplyPayload,
  pushOffPlanSearchRecents,
} from "@/features/off-plan/lib/off-plan-search-apply";
import { useOffPlanSearch } from "@/features/off-plan/hooks/use-off-plan-search";
import type { OffPlanFilterDraft } from "@/features/off-plan/services/off-plan.client";
import type {
  OffPlanDistrict,
  OffPlanFilterMeta,
} from "@/features/off-plan/types/off-plan.types";

export function OffPlanSearchDialog({
  open,
  onOpenChange,
  draft,
  filterMeta,
  districts,
  onApply,
  onReset,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: OffPlanFilterDraft;
  filterMeta: OffPlanFilterMeta;
  districts: OffPlanDistrict[];
  onApply: (payload: ReturnType<typeof buildOffPlanSearchApplyPayload>) => void;
  onReset: () => void;
}) {
  const search = useOffPlanSearch(open, { districts, filterMeta });

  useEffect(() => {
    if (!open) return;
    const choices = buildInitialOffPlanSearchChoices(
      draft,
      filterMeta,
      districts
    );
    search.syncFromApplied(choices, draft.searchText ?? "");
    // Sync applied filters when dialog opens only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleDone = () => {
    const payload = buildOffPlanSearchApplyPayload(
      search.selectedChoices,
      search.localQuery
    );
    const hasAny =
      payload.searchText.length > 0 ||
      payload.cityId ||
      payload.districtId ||
      payload.developerIds.length > 0 ||
      payload.searchProjectIds.length > 0;
    if (!hasAny) {
      onReset();
      onOpenChange(false);
      return;
    }
    const recentItems = buildOffPlanRecentItems(
      search.selectedChoices,
      search.localQuery
    );
    if (recentItems.length) pushOffPlanSearchRecents(recentItems);
    onApply(payload);
    onOpenChange(false);
  };

  const { listSections, showSearchResults } = search;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,720px)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-border/60 bg-muted/15 px-5 py-4 text-start">
          <DialogTitle className="text-base font-semibold tracking-tight">
            Search off-plan
          </DialogTitle>
          <DialogDescription className="sr-only">
            Search by city, district, developer, or project name.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 border-b border-border px-5 py-3">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search.localQuery}
              onChange={(e) => search.setLocalQuery(e.target.value)}
              placeholder="Search for a locality, area or city"
              className="h-11 rounded-full border-border/60 bg-muted/30 pe-9 ps-9 shadow-inner"
              autoFocus
            />
            {search.localQuery.length > 0 ? (
              <button
                type="button"
                aria-label="Clear search"
                className="absolute end-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
                onClick={() => search.setLocalQuery("")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          {search.selectedChoices.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {search.selectedChoices.map((c) => (
                <span
                  key={`${c.detailType}-${c.id}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/30 px-2.5 py-1 text-xs font-semibold"
                >
                  {c.label}
                  <button
                    type="button"
                    aria-label={`Remove ${c.label}`}
                    onClick={() => search.selectSuggestion(c)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {search.recentsForDisplay.length > 0 ? (
            <OffPlanSearchRecentSection
              items={search.recentsForDisplay}
              isSelected={search.isRowSelected}
              onSelect={search.selectSuggestion}
              onClearAll={search.clearAllRecents}
            />
          ) : null}

          {search.listLoading ? (
            <OffPlanSearchDialogContentSkeleton
              variant={showSearchResults ? "typing" : "idle"}
            />
          ) : showSearchResults ? (
            search.emptyList ? (
              <div className="py-8 text-center">
                <p className="text-sm font-semibold">No suggestions found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a different keyword or check your spelling.
                </p>
              </div>
            ) : (
              <OffPlanSearchSuggestionList
                sections={listSections}
                query={search.localQuery.trim()}
                isSelected={search.isRowSelected}
                onToggle={search.selectSuggestion}
              />
            )
          ) : search.hasIdleBrowseContent ? (
            <>
              <OffPlanSearchProjectSection
                title="Featured"
                items={listSections.featuredProjects}
                isSelected={search.isRowSelected}
                onToggle={search.selectSuggestion}
              />
              <OffPlanSearchProjectSection
                title="Off plan projects"
                items={listSections.projects}
                isSelected={search.isRowSelected}
                onToggle={search.selectSuggestion}
              />
              <OffPlanSearchChipSection
                title="Popular cities"
                items={listSections.cities}
                isSelected={search.isRowSelected}
                onToggle={search.selectSuggestion}
              />
              <OffPlanSearchChipSection
                title="Popular districts"
                items={listSections.districts}
                isSelected={search.isRowSelected}
                onToggle={search.selectSuggestion}
              />
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm font-semibold">Popular suggestions unavailable</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try again later or use the search input.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 border-t border-border bg-muted/20 px-5 py-4 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => {
              search.clearSelectionOnly();
              onReset();
              onOpenChange(false);
            }}
          >
            Reset
          </Button>
          <Button type="button" onClick={handleDone}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
