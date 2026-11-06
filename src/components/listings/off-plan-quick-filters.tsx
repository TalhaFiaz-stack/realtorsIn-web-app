"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  CalendarClock,
  ChevronDown,
  MapPin,
  MapPinned,
  Tag,
} from "lucide-react";
import { OffPlanCityQuickTabs } from "@/components/listings/off-plan-city-quick-tabs";
import { buildOffPlanCityProjectCounts } from "@/features/off-plan/lib/off-plan-city-project-counts";
import { OffPlanChoiceFilterDialog } from "@/components/listings/off-plan-choice-filter-dialog";
import { OffPlanDevelopersFilterDialog } from "@/components/listings/off-plan-developers-filter-dialog";
import {
  offPlanCityOptions,
  offPlanCityOptionsForDistrict,
  offPlanDistrictOptions,
} from "@/features/off-plan/lib/off-plan-location-filters";
import {
  offPlanQuickFilterChipLabel,
  offPlanQuickFilterIsActive,
} from "@/features/off-plan/lib/off-plan-quick-filter-labels";
import type {
  OffPlanDistrict,
  OffPlanFilterMeta,
  OffPlanProjectSummary,
} from "@/features/off-plan/types/off-plan.types";
import type { OffPlanFilterDraft } from "@/features/off-plan/services/off-plan.client";
import { cn } from "@/lib/utils";

type QuickKind = "city" | "district" | "status" | "handover" | "developer";

const QUICK_CHIPS: {
  kind: QuickKind;
  icon: typeof MapPin;
  defaultLabel: string;
}[] = [
  { kind: "city", icon: MapPin, defaultLabel: "City" },
  { kind: "district", icon: MapPinned, defaultLabel: "District" },
  { kind: "developer", icon: Building2, defaultLabel: "Developers" },
  { kind: "status", icon: Tag, defaultLabel: "Development status" },
  { kind: "handover", icon: CalendarClock, defaultLabel: "Handover" },
];

function FilterPill({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof MapPin;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-2.5 text-xs font-medium transition sm:px-3",
        active
          ? "border-primary/35 bg-primary/8 text-primary shadow-sm"
          : "border-border/70 bg-background/90 text-foreground hover:border-border hover:bg-muted/40",
      )}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          active ? "text-primary" : "text-muted-foreground",
        )}
        aria-hidden
      />
      <span className="max-w-[8.5rem] truncate">{label}</span>
      <ChevronDown className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
    </button>
  );
}

export function OffPlanQuickFilters({
  draft,
  onChange,
  filterMeta,
  districts,
  projectsForCityCounts,
}: {
  draft: OffPlanFilterDraft;
  onChange: (next: OffPlanFilterDraft) => void;
  filterMeta: OffPlanFilterMeta;
  districts: OffPlanDistrict[];
  /** When set (e.g. full map payload), city tabs show approximate counts. */
  projectsForCityCounts?: OffPlanProjectSummary[];
}) {
  const [open, setOpen] = useState<QuickKind | null>(null);

  const cityOptions = useMemo(() => {
    if (draft.districtId) {
      return offPlanCityOptionsForDistrict(districts, draft.districtId);
    }
    return offPlanCityOptions(districts, filterMeta.cities);
  }, [districts, draft.districtId, filterMeta.cities]);

  const districtOptions = useMemo(
    () => offPlanDistrictOptions(districts, draft.cityId),
    [districts, draft.cityId],
  );

  const handoverOptions = useMemo(
    () =>
      filterMeta.deliveryDates.map((date) => ({
        label: date,
        value: date,
      })),
    [filterMeta.deliveryDates],
  );

  const cityCounts = useMemo(() => {
    if (!projectsForCityCounts?.length) return undefined;
    return buildOffPlanCityProjectCounts(projectsForCityCounts, districts);
  }, [projectsForCityCounts, districts]);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {QUICK_CHIPS.map(({ kind, icon, defaultLabel }) => {
          const active = offPlanQuickFilterIsActive(kind, draft);
          const resolved = offPlanQuickFilterChipLabel(
            kind,
            draft,
            filterMeta,
            districts,
          );
          const label = active ? resolved : defaultLabel;
          return (
            <FilterPill
              key={kind}
              icon={icon}
              label={label}
              active={active}
              onClick={() => setOpen(kind)}
            />
          );
        })}
      </div>

      <OffPlanCityQuickTabs
        cities={filterMeta.cities}
        selectedCityId={draft.cityId}
        cityCounts={cityCounts}
        onSelectCity={(cityId) => {
          let districtId = draft.districtId;
          if (cityId && districtId) {
            const inCity = offPlanDistrictOptions(districts, cityId).some(
              (d) => d.value === districtId,
            );
            if (!inCity) districtId = undefined;
          }
          if (!cityId) districtId = undefined;
          onChange({ ...draft, cityId, districtId });
        }}
      />

      <OffPlanChoiceFilterDialog
        open={open === "city"}
        onOpenChange={(v) => !v && setOpen(null)}
        title="City"
        options={cityOptions}
        mode="single"
        value={draft.cityId ?? ""}
        onApply={(next) => {
          const cityId = typeof next === "string" && next ? next : undefined;
          let districtId = draft.districtId;
          if (cityId && districtId) {
            const inCity = offPlanDistrictOptions(districts, cityId).some(
              (d) => d.value === districtId,
            );
            if (!inCity) districtId = undefined;
          }
          onChange({ ...draft, cityId, districtId });
        }}
      />

      <OffPlanChoiceFilterDialog
        open={open === "district"}
        onOpenChange={(v) => !v && setOpen(null)}
        title="District"
        description={
          draft.cityId
            ? "Districts in the selected city."
            : "All districts — pick a city to narrow the list."
        }
        options={districtOptions}
        mode="single"
        value={draft.districtId ?? ""}
        searchable
        searchThreshold={6}
        onApply={(next) => {
          const districtId =
            typeof next === "string" && next ? next : undefined;
          const district = districts.find((d) => String(d.id) === districtId);
          onChange({
            ...draft,
            districtId,
            cityId:
              district?.cityId != null ? String(district.cityId) : draft.cityId,
          });
        }}
      />

      <OffPlanChoiceFilterDialog
        open={open === "status"}
        onOpenChange={(v) => !v && setOpen(null)}
        title="Development status"
        description="Choose one or more stages, such as on sale or announced."
        options={filterMeta.developmentStatuses}
        mode="multi"
        value={draft.developmentStatus ?? []}
        onApply={(next) =>
          onChange({
            ...draft,
            developmentStatus:
              Array.isArray(next) && next.length ? next : undefined,
          })
        }
      />

      <OffPlanChoiceFilterDialog
        open={open === "handover"}
        onOpenChange={(v) => !v && setOpen(null)}
        title="Expected handover"
        options={handoverOptions}
        mode="single"
        value={
          draft.completionDate && draft.completionDate !== "all"
            ? draft.completionDate
            : ""
        }
        onApply={(next) => {
          const date = typeof next === "string" && next ? next : undefined;
          onChange({
            ...draft,
            completionDate: date,
          });
        }}
        searchable={handoverOptions.length >= 8}
      />

      <OffPlanDevelopersFilterDialog
        open={open === "developer"}
        onOpenChange={(v) => !v && setOpen(null)}
        developers={filterMeta.developers}
        selectedIds={draft.developerIds ?? []}
        onApply={(ids) =>
          onChange({
            ...draft,
            developerIds: ids.length ? ids : undefined,
          })
        }
      />
    </>
  );
}
