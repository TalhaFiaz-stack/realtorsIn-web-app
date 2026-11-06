import type {
  OffPlanDistrict,
  OffPlanFilterMeta,
} from "@/features/off-plan/types/off-plan.types";
import type { OffPlanFilterDraft } from "@/features/off-plan/services/off-plan.client";
import {
  offPlanCityOptions,
  offPlanDistrictOptions,
} from "@/features/off-plan/lib/off-plan-location-filters";

function findLabel(
  options: { label: string; value: string }[],
  value: string | undefined
): string | null {
  if (!value) return null;
  return options.find((o) => o.value === value)?.label ?? null;
}

export function offPlanQuickFilterChipLabel(
  kind: "city" | "district" | "status" | "handover" | "developer",
  draft: OffPlanFilterDraft,
  meta: OffPlanFilterMeta,
  districts: OffPlanDistrict[]
): string {
  const defaults: Record<typeof kind, string> = {
    city: "City",
    district: "District",
    status: "Development status",
    handover: "Expected Handover",
    developer: "Developer",
  };

  switch (kind) {
    case "city": {
      const cities = offPlanCityOptions(districts, meta.cities);
      const label = findLabel(cities, draft.cityId);
      return label ?? defaults.city;
    }
    case "district": {
      const districtsOpts = offPlanDistrictOptions(districts, draft.cityId);
      const label = findLabel(districtsOpts, draft.districtId);
      return label ?? defaults.district;
    }
    case "status": {
      const selected = draft.developmentStatus ?? [];
      if (selected.length === 0) return defaults.status;
      if (selected.length === 1) {
        return (
          meta.developmentStatuses.find((s) => s.value === selected[0])?.label ??
          selected[0]
        );
      }
      return `${selected.length} statuses`;
    }
    case "handover": {
      if (draft.completionDate && draft.completionDate !== "all") {
        return draft.completionDate;
      }
      return defaults.handover;
    }
    case "developer": {
      const count = draft.developerIds?.length ?? 0;
      if (count === 0) return defaults.developer;
      if (count === 1) {
        const id = String(draft.developerIds![0]);
        return meta.developers.find((d) => d.value === id)?.label ?? "1 developer";
      }
      return `${count} developers`;
    }
    default:
      return defaults[kind];
  }
}

export function offPlanQuickFilterIsActive(
  kind: "city" | "district" | "status" | "handover" | "developer",
  draft: OffPlanFilterDraft
): boolean {
  switch (kind) {
    case "city":
      return Boolean(draft.cityId);
    case "district":
      return Boolean(draft.districtId);
    case "status":
      return (draft.developmentStatus?.length ?? 0) > 0;
    case "handover":
      return Boolean(draft.completionDate && draft.completionDate !== "all");
    case "developer":
      return (draft.developerIds?.length ?? 0) > 0;
    default:
      return false;
  }
}
