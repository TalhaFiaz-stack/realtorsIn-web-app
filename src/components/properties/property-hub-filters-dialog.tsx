"use client";

import { useEffect, useState } from "react";
import { PropertyLocationSearch } from "@/components/properties/property-location-search";
import { ExpandableFilterChipList } from "@/components/properties/expandable-filter-chip-list";
import {
  FilterChip,
  FilterChipRow,
  FilterSection,
} from "@/components/properties/property-hub-filter-ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PROPERTY_HUB_AVAILABILITY_OPTIONS } from "@/features/properties/constants/property-hub.constants";
import { fallbackPropertyHubFilterOptions } from "@/features/properties/lib/map-rem-filter-options";
import type { PropertyHubFilterOptions } from "@/features/properties/types/property-hub-filter.types";
import type { PropertyHubListFilters } from "@/features/properties/types/property-hub.types";

const BED_OPTIONS = ["Studio", "1", "2", "3", "4", "5", "6+"];
const BATH_OPTIONS = ["1", "2", "3", "4", "5+"];

export type PropertyHubFilterDraft = Pick<
  PropertyHubListFilters,
  | "beds"
  | "baths"
  | "minPrice"
  | "maxPrice"
  | "minArea"
  | "maxArea"
  | "availability"
  | "mainListingType"
  | "distressDeal"
  | "propertyCategory"
  | "filterPropertyTypes"
  | "filterPropertyStatusId"
  | "locationLabel"
  | "locationDisplay"
  | "city"
  | "community"
  | "subCommunity"
  | "neighbourhoodId"
  | "buildingId"
>;

export function PropertyHubFiltersDialog({
  open,
  onOpenChange,
  draft,
  onApply,
  onReset,
  filterOptions,
  optionsLoading,
  showListingStatus = true,
  marketMode,
  title = "Refine listings",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: PropertyHubFilterDraft;
  onApply: (next: PropertyHubFilterDraft) => void;
  onReset: () => void;
  filterOptions?: PropertyHubFilterOptions;
  optionsLoading?: boolean;
  /** Public browse (Secondary/Rental) always requests Active listings from the API. */
  showListingStatus?: boolean;
  /** When set, shows Main type + Distress deal (mobile `PropertyFilterComp` parity). */
  marketMode?: "secondary" | "rental";
  title?: string;
}) {
  const [local, setLocal] = useState(draft);
  const options = filterOptions ?? fallbackPropertyHubFilterOptions();

  useEffect(() => {
    if (open) setLocal(draft);
  }, [open, draft]);

  const selectedTypes = local.filterPropertyTypes
    ? local.filterPropertyTypes.split(",").filter(Boolean)
    : [];
  const selectedCategories = local.propertyCategory
    ? local.propertyCategory.split(",").filter(Boolean)
    : [];

  function toggleCsv(
    field: "filterPropertyTypes" | "propertyCategory",
    value: string
  ) {
    const current =
      field === "filterPropertyTypes" ? selectedTypes : selectedCategories;
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setLocal((prev) => ({
      ...prev,
      [field]: next.length ? next.join(",") : undefined,
    }));
  }

  const mainTypeOptions =
    marketMode === "secondary"
      ? [
          { label: "All", value: "all" as const },
          { label: "Buy", value: "buy" as const },
          { label: "Sell", value: "sell" as const },
        ]
      : marketMode === "rental"
        ? [
            { label: "All", value: "all" as const },
            { label: "Rent in", value: "rent_in" as const },
            { label: "Rent out", value: "rent_out" as const },
          ]
        : null;

  const DISTRESS_OPTIONS: {
    label: string;
    value: "" | "yes" | "no";
  }[] = [
    { label: "All", value: "" },
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,680px)] flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-5 py-4 text-start">
          <DialogTitle className="text-base font-semibold">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Filter listings by availability, location, price, and more.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <FilterSection title="Availability">
            <FilterChipRow>
              {PROPERTY_HUB_AVAILABILITY_OPTIONS.map((opt) => (
                <FilterChip
                  key={opt.value}
                  active={(local.availability ?? "all") === opt.value}
                  onClick={() =>
                    setLocal((prev) => ({
                      ...prev,
                      availability: opt.value,
                    }))
                  }
                >
                  {opt.label}
                </FilterChip>
              ))}
            </FilterChipRow>
          </FilterSection>

          {mainTypeOptions ? (
            <FilterSection
              title="Main type"
              hint={
                marketMode === "secondary"
                  ? "Buy or sell within Secondary listings."
                  : "Rent in or rent out within Rental listings."
              }
            >
              <FilterChipRow>
                {mainTypeOptions.map((opt) => (
                  <FilterChip
                    key={opt.value}
                    active={(local.mainListingType ?? "all") === opt.value}
                    onClick={() =>
                      setLocal((prev) => ({
                        ...prev,
                        mainListingType: opt.value,
                      }))
                    }
                  >
                    {opt.label}
                  </FilterChip>
                ))}
              </FilterChipRow>
            </FilterSection>
          ) : null}

          {marketMode ? (
            <FilterSection title="Distress deal">
              <FilterChipRow>
                {DISTRESS_OPTIONS.map((opt) => (
                  <FilterChip
                    key={opt.value === "" ? "all" : opt.value}
                    active={(local.distressDeal ?? "") === opt.value}
                    onClick={() =>
                      setLocal((prev) => ({
                        ...prev,
                        distressDeal: opt.value || undefined,
                      }))
                    }
                  >
                    {opt.label}
                  </FilterChip>
                ))}
              </FilterChipRow>
            </FilterSection>
          ) : null}

          {showListingStatus ? (
            <FilterSection title="Listing status">
              {optionsLoading && options.statuses.length === 0 ? (
                <p className="text-xs text-muted-foreground">Loading statuses…</p>
              ) : (
                <FilterChipRow>
                  <FilterChip
                    active={local.filterPropertyStatusId == null}
                    onClick={() =>
                      setLocal((prev) => ({
                        ...prev,
                        filterPropertyStatusId: undefined,
                      }))
                    }
                  >
                    All
                  </FilterChip>
                  {options.statuses.map((opt) => (
                    <FilterChip
                      key={opt.value}
                      active={local.filterPropertyStatusId === opt.value}
                      onClick={() =>
                        setLocal((prev) => ({
                          ...prev,
                          filterPropertyStatusId: opt.value,
                        }))
                      }
                    >
                      {opt.label}
                    </FilterChip>
                  ))}
                </FilterChipRow>
              )}
            </FilterSection>
          ) : null}

          <FilterSection title="Location" hint="Search for a location…">
            <PropertyLocationSearch
              value={local.locationLabel ?? ""}
              displayValue={local.locationDisplay}
              placeholder="Search for a location..."
              onChange={(selection) => {
                if (!selection) {
                  setLocal((prev) => ({
                    ...prev,
                    locationLabel: undefined,
                    locationDisplay: undefined,
                    city: undefined,
                    community: undefined,
                    subCommunity: undefined,
                    neighbourhoodId: undefined,
                    buildingId: undefined,
                  }));
                  return;
                }
                setLocal((prev) => ({
                  ...prev,
                  locationLabel: selection.label || undefined,
                  locationDisplay: selection.displayLabel || undefined,
                  city: selection.city || undefined,
                  community: selection.community || undefined,
                  subCommunity: selection.subCommunity || undefined,
                  neighbourhoodId: selection.neighbourhoodId,
                  buildingId: selection.buildingId,
                }));
              }}
            />
          </FilterSection>

          <FilterSection title="Price range (AED)">
            <div className="grid grid-cols-2 gap-3">
              <Input
                inputMode="numeric"
                value={local.minPrice ?? ""}
                onChange={(e) =>
                  setLocal((prev) => ({ ...prev, minPrice: e.target.value }))
                }
                placeholder="Min"
                className="h-10"
                aria-label="Minimum price"
              />
              <Input
                inputMode="numeric"
                value={local.maxPrice ?? ""}
                onChange={(e) =>
                  setLocal((prev) => ({ ...prev, maxPrice: e.target.value }))
                }
                placeholder="Max"
                className="h-10"
                aria-label="Maximum price"
              />
            </div>
          </FilterSection>

          <FilterSection title="Area (sq ft)">
            <div className="grid grid-cols-2 gap-3">
              <Input
                inputMode="numeric"
                value={local.minArea ?? ""}
                onChange={(e) =>
                  setLocal((prev) => ({
                    ...prev,
                    minArea: e.target.value.replace(/[^0-9]/g, "") || undefined,
                  }))
                }
                placeholder="Min"
                className="h-10"
                aria-label="Minimum area in square feet"
              />
              <Input
                inputMode="numeric"
                value={local.maxArea ?? ""}
                onChange={(e) =>
                  setLocal((prev) => ({
                    ...prev,
                    maxArea: e.target.value.replace(/[^0-9]/g, "") || undefined,
                  }))
                }
                placeholder="Max"
                className="h-10"
                aria-label="Maximum area in square feet"
              />
            </div>
          </FilterSection>

          <FilterSection title="Bedrooms">
            <FilterChipRow>
              {BED_OPTIONS.map((bed) => {
                const value = bed === "Studio" ? "0" : bed.replace("+", "");
                const active = local.beds === value;
                return (
                  <FilterChip
                    key={bed}
                    active={active}
                    onClick={() =>
                      setLocal((prev) => ({
                        ...prev,
                        beds: active ? undefined : value,
                      }))
                    }
                  >
                    {bed}
                  </FilterChip>
                );
              })}
            </FilterChipRow>
          </FilterSection>

          <FilterSection title="Bathrooms">
            <FilterChipRow>
              {BATH_OPTIONS.map((bath) => {
                const value = bath.replace("+", "");
                const active = local.baths === value;
                return (
                  <FilterChip
                    key={bath}
                    active={active}
                    onClick={() =>
                      setLocal((prev) => ({
                        ...prev,
                        baths: active ? undefined : value,
                      }))
                    }
                  >
                    {bath}
                  </FilterChip>
                );
              })}
            </FilterChipRow>
          </FilterSection>

          <FilterSection title="Category">
            <FilterChipRow>
              {options.categories.map((opt) => {
                const active = selectedCategories.includes(opt.value);
                return (
                  <FilterChip
                    key={opt.value}
                    active={active}
                    onClick={() => toggleCsv("propertyCategory", opt.value)}
                  >
                    {opt.label}
                  </FilterChip>
                );
              })}
            </FilterChipRow>
          </FilterSection>

          <FilterSection
            title="Property type"
            hint={
              options.propertyTypes.length > 10
                ? `${options.propertyTypes.length} types available`
                : undefined
            }
          >
            {optionsLoading && options.propertyTypes.length === 0 ? (
              <p className="text-xs text-muted-foreground">Loading types…</p>
            ) : options.propertyTypes.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Property types unavailable. Try again later.
              </p>
            ) : (
              <ExpandableFilterChipList
                dialogOpen={open}
                options={options.propertyTypes}
                selectedValues={selectedTypes}
                chipClassName="capitalize"
                onToggle={(value) => toggleCsv("filterPropertyTypes", value)}
              />
            )}
          </FilterSection>
        </div>

        <DialogFooter className="flex-row gap-2 border-t border-border bg-muted/20 px-5 py-4 sm:justify-between">
          <Button type="button" variant="ghost" className="text-muted-foreground" onClick={onReset}>
            Reset all
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                onApply(local);
                onOpenChange(false);
              }}
            >
              Show results
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
