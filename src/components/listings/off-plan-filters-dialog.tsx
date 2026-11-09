"use client";

import { useEffect, useState } from "react";
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
import {
  OFF_PLAN_BED_OPTIONS,
  OFF_PLAN_DOWN_PAYMENT_OPTIONS,
  OFF_PLAN_POST_HANDOVER_OPTIONS,
  OFF_PLAN_VISIBILITY_OPTIONS,
  PAYMENT_BREAKDOWN_FIELDS,
  EMPTY_PAYMENT_BREAKDOWN,
} from "@/features/off-plan/constants/off-plan-filters.constants";
import { countOffPlanActiveFilters } from "@/features/off-plan/lib/count-off-plan-filters";
import type { OffPlanFilterMeta } from "@/features/off-plan/types/off-plan.types";
import type { OffPlanFilterDraft } from "@/features/off-plan/services/off-plan.client";

const digits = (v: string) => v.replace(/[^0-9]/g, "");

function toggleMulti(selected: string[], value: string): string[] {
  return selected.includes(value)
    ? selected.filter((v) => v !== value)
    : [...selected, value];
}

/** "Min 382,913" from the backend's raw "382913.00" range bound. */
function rangePlaceholder(raw: string | number | null | undefined, fallback: string): string {
  const n = Number(raw);
  if (raw == null || raw === "" || !Number.isFinite(n) || n <= 0) return fallback;
  return `${fallback} ${Math.round(n).toLocaleString("en-US")}`;
}

export function OffPlanFiltersDialog({
  open,
  onOpenChange,
  draft,
  onApply,
  onReset,
  filterMeta,
  optionsLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: OffPlanFilterDraft;
  onApply: (next: OffPlanFilterDraft) => void;
  onReset: () => void;
  filterMeta: OffPlanFilterMeta;
  optionsLoading?: boolean;
}) {
  const [local, setLocal] = useState(draft);

  useEffect(() => {
    if (open) setLocal(draft);
  }, [open, draft]);

  const activeCount = countOffPlanActiveFilters(local);

  const pb = local.paymentBreakdown ?? EMPTY_PAYMENT_BREAKDOWN;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-5 py-4 text-start">
          <DialogTitle className="text-base font-semibold">
            More filters
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {optionsLoading
              ? "Loading filter options…"
              : activeCount > 0
                ? `${activeCount} filter${activeCount === 1 ? "" : "s"} applied`
                : "Price, beds, property type, payment plan, and more. Use the chips above for city, district, developer, status, and handover."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <FilterSection title="Bedrooms">
            <FilterChipRow>
              {OFF_PLAN_BED_OPTIONS.map((opt) => {
                const active = local.beds === opt.value;
                return (
                  <FilterChip
                    key={opt.value}
                    active={active}
                    onClick={() =>
                      setLocal((prev) => ({
                        ...prev,
                        beds: active ? undefined : opt.value,
                      }))
                    }
                  >
                    {opt.label}
                  </FilterChip>
                );
              })}
            </FilterChipRow>
          </FilterSection>

          <FilterSection title="Price range (AED)">
            <div className="grid grid-cols-2 gap-3">
              <Input
                inputMode="numeric"
                value={local.minPrice ?? ""}
                onChange={(e) =>
                  setLocal((prev) => ({ ...prev, minPrice: digits(e.target.value) }))
                }
                placeholder={rangePlaceholder(filterMeta.minPrice, "Min")}
                className="h-10"
                aria-label="Minimum price"
              />
              <Input
                inputMode="numeric"
                value={local.maxPrice ?? ""}
                onChange={(e) =>
                  setLocal((prev) => ({ ...prev, maxPrice: digits(e.target.value) }))
                }
                placeholder={rangePlaceholder(filterMeta.maxPrice, "Max")}
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
                  setLocal((prev) => ({ ...prev, minArea: digits(e.target.value) }))
                }
                placeholder={rangePlaceholder(filterMeta.minArea, "Min")}
                className="h-10"
                aria-label="Minimum area"
              />
              <Input
                inputMode="numeric"
                value={local.maxArea ?? ""}
                onChange={(e) =>
                  setLocal((prev) => ({ ...prev, maxArea: digits(e.target.value) }))
                }
                placeholder={rangePlaceholder(filterMeta.maxArea, "Max")}
                className="h-10"
                aria-label="Maximum area"
              />
            </div>
          </FilterSection>

          {filterMeta.completionStatuses.length > 0 ? (
            <FilterSection title="Completion status">
              <FilterChipRow>
                {filterMeta.completionStatuses.map((opt) => {
                  const selected = local.completionStatus ?? [];
                  const active = selected.includes(opt.value);
                  return (
                    <FilterChip
                      key={opt.value}
                      active={active}
                      onClick={() =>
                        setLocal((prev) => ({
                          ...prev,
                          completionStatus: toggleMulti(
                            prev.completionStatus ?? [],
                            opt.value,
                          ),
                        }))
                      }
                    >
                      {opt.label}
                    </FilterChip>
                  );
                })}
              </FilterChipRow>
            </FilterSection>
          ) : null}

          {filterMeta.unitTypes.length > 0 ? (
            <FilterSection
              title="Property type"
              hint={
                filterMeta.unitTypes.length > 10
                  ? `${filterMeta.unitTypes.length} types available`
                  : undefined
              }
            >
              <ExpandableFilterChipList
                dialogOpen={open}
                options={filterMeta.unitTypes}
                selectedValues={local.propertyTypes ?? []}
                chipClassName="capitalize"
                onToggle={(value) =>
                  setLocal((prev) => ({
                    ...prev,
                    propertyTypes: toggleMulti(prev.propertyTypes ?? [], value),
                  }))
                }
              />
            </FilterSection>
          ) : null}

          <FilterSection title="Down payment">
            <FilterChipRow>
              {OFF_PLAN_DOWN_PAYMENT_OPTIONS.map((opt) => {
                const value = opt.value || "any";
                const active = (local.downPayment ?? "") === opt.value;
                return (
                  <FilterChip
                    key={value}
                    active={active}
                    onClick={() =>
                      setLocal((prev) => ({
                        ...prev,
                        downPayment: opt.value || undefined,
                      }))
                    }
                  >
                    {opt.label}
                  </FilterChip>
                );
              })}
            </FilterChipRow>
          </FilterSection>

          <FilterSection title="Post handover">
            <FilterChipRow>
              {OFF_PLAN_POST_HANDOVER_OPTIONS.map((opt) => {
                const value = opt.value || "any";
                const active = (local.postHandover ?? "") === opt.value;
                return (
                  <FilterChip
                    key={value}
                    active={active}
                    onClick={() =>
                      setLocal((prev) => ({
                        ...prev,
                        postHandover: opt.value || undefined,
                      }))
                    }
                  >
                    {opt.label}
                  </FilterChip>
                );
              })}
            </FilterChipRow>
          </FilterSection>

          {filterMeta.allowPrivateProjects ? (
            <FilterSection title="Project visibility">
              <FilterChipRow>
                {OFF_PLAN_VISIBILITY_OPTIONS.map((opt) => (
                  <FilterChip
                    key={opt.value}
                    active={(local.projectVisibility ?? "all") === opt.value}
                    onClick={() =>
                      setLocal((prev) => ({
                        ...prev,
                        projectVisibility: opt.value,
                      }))
                    }
                  >
                    {opt.label}
                  </FilterChip>
                ))}
              </FilterChipRow>
            </FilterSection>
          ) : null}

          <FilterSection
            title="Payment plan breakdown"
            hint="Optional percentages — on booking, construction, handover, post handover."
          >
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_BREAKDOWN_FIELDS.map(({ key, label }) => (
                <Input
                  key={key}
                  inputMode="numeric"
                  value={pb[key] ?? ""}
                  onChange={(e) =>
                    setLocal((prev) => ({
                      ...prev,
                      paymentBreakdown: {
                        ...(prev.paymentBreakdown ?? EMPTY_PAYMENT_BREAKDOWN),
                        [key]: digits(e.target.value),
                      },
                    }))
                  }
                  placeholder={label.replace(" (%)", "")}
                  className="h-10 text-xs"
                  aria-label={label}
                />
              ))}
            </div>
          </FilterSection>
        </div>

        <DialogFooter className="flex-row gap-2 border-t border-border bg-muted/20 px-5 py-4 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground"
            onClick={onReset}
          >
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
