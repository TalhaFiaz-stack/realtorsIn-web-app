import {
  EMPTY_PAYMENT_BREAKDOWN,
  OFF_PLAN_DOWN_PAYMENT_OPTIONS,
  OFF_PLAN_POST_HANDOVER_OPTIONS,
  OFF_PLAN_VISIBILITY_OPTIONS,
} from "@/features/off-plan/constants/off-plan-filters.constants";
import {
  offPlanCityOptions,
  offPlanDistrictOptions,
} from "@/features/off-plan/lib/off-plan-location-filters";
import type {
  OffPlanDistrict,
  OffPlanFilterMeta,
} from "@/features/off-plan/types/off-plan.types";
import type { OffPlanFilterDraft } from "@/features/off-plan/services/off-plan.client";
function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(n);
}

export type OffPlanRailFilterKind =
  | "city"
  | "district"
  | "developer"
  | "status"
  | "completion"
  | "handover"
  | "price"
  | "downPayment"
  | "postHandover"
  | "paymentBreakdown"
  | "visibility"
  | "more";

export const OFF_PLAN_RAIL_FILTERS: {
  kind: OffPlanRailFilterKind;
  defaultLabel: string;
  opensAdvanced?: boolean;
}[] = [
  { kind: "city", defaultLabel: "City" },
  { kind: "district", defaultLabel: "District" },
  { kind: "developer", defaultLabel: "Developer" },
  { kind: "status", defaultLabel: "Status" },
  { kind: "completion", defaultLabel: "Completion Status" },
  { kind: "handover", defaultLabel: "Expected Handover" },
  { kind: "price", defaultLabel: "Price", opensAdvanced: true },
  { kind: "downPayment", defaultLabel: "Down Payment", opensAdvanced: true },
  { kind: "postHandover", defaultLabel: "Post Handover", opensAdvanced: true },
  {
    kind: "paymentBreakdown",
    defaultLabel: "Payment Breakdown (%)",
    opensAdvanced: true,
  },
  { kind: "visibility", defaultLabel: "Project Visibility", opensAdvanced: true },
  { kind: "more", defaultLabel: "Beds & more", opensAdvanced: true },
];

function findLabel(
  options: { label: string; value: string }[],
  value: string | undefined
): string | null {
  if (!value) return null;
  return options.find((o) => o.value === value)?.label ?? null;
}

export function offPlanRailFilterChipLabel(
  kind: OffPlanRailFilterKind,
  draft: OffPlanFilterDraft,
  meta: OffPlanFilterMeta,
  districts: OffPlanDistrict[]
): string {
  const defaults = Object.fromEntries(
    OFF_PLAN_RAIL_FILTERS.map((f) => [f.kind, f.defaultLabel])
  ) as Record<OffPlanRailFilterKind, string>;

  switch (kind) {
    case "city": {
      const cities = offPlanCityOptions(districts, meta.cities);
      return findLabel(cities, draft.cityId) ?? defaults.city;
    }
    case "district": {
      const opts = offPlanDistrictOptions(districts, draft.cityId);
      return findLabel(opts, draft.districtId) ?? defaults.district;
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
    case "completion": {
      const selected = draft.completionStatus ?? [];
      if (selected.length === 0) return defaults.completion;
      if (selected.length === 1) {
        return (
          meta.completionStatuses.find((s) => s.value === selected[0])?.label ??
          selected[0]
        );
      }
      return selected
        .map(
          (v) => meta.completionStatuses.find((s) => s.value === v)?.label ?? v
        )
        .join(", ");
    }
    case "handover":
      return draft.completionDate && draft.completionDate !== "all"
        ? draft.completionDate
        : defaults.handover;
    case "price": {
      const min = draft.minPrice?.trim();
      const max = draft.maxPrice?.trim();
      const minN = min && min !== "0" ? Number(min) : 0;
      const maxN = max && max !== "0" ? Number(max) : 0;
      if (minN > 0 && maxN > 0) {
        return `${formatCompactNumber(minN)} to ${formatCompactNumber(maxN)}`;
      }
      if (minN > 0) return `${formatCompactNumber(minN)}+`;
      if (maxN > 0) return `Up to ${formatCompactNumber(maxN)}`;
      return defaults.price;
    }
    case "downPayment": {
      if (!draft.downPayment) return defaults.downPayment;
      return (
        OFF_PLAN_DOWN_PAYMENT_OPTIONS.find((o) => o.value === draft.downPayment)
          ?.label ?? draft.downPayment
      );
    }
    case "postHandover": {
      if (!draft.postHandover) return defaults.postHandover;
      return (
        OFF_PLAN_POST_HANDOVER_OPTIONS.find((o) => o.value === draft.postHandover)
          ?.label ?? draft.postHandover
      );
    }
    case "paymentBreakdown": {
      const pb = draft.paymentBreakdown ?? EMPTY_PAYMENT_BREAKDOWN;
      const count = Object.values(pb).filter((v) => v?.trim()).length;
      if (count === 0) return defaults.paymentBreakdown;
      return count === 1 ? "1 field set" : `${count} fields set`;
    }
    case "visibility": {
      const v = draft.projectVisibility ?? "all";
      if (v === "all") return defaults.visibility;
      return (
        OFF_PLAN_VISIBILITY_OPTIONS.find((o) => o.value === v)?.label ??
        defaults.visibility
      );
    }
    case "more": {
      const parts: string[] = [];
      if (draft.beds) parts.push("Beds");
      if ((draft.propertyTypes?.length ?? 0) > 0) parts.push("Type");
      if (draft.minArea || draft.maxArea) parts.push("Area");
      return parts.length ? parts.join(", ") : defaults.more;
    }
    default:
      return defaults[kind];
  }
}

export function offPlanRailFilterIsActive(
  kind: OffPlanRailFilterKind,
  draft: OffPlanFilterDraft
): boolean {
  switch (kind) {
    case "city":
      return Boolean(draft.cityId);
    case "district":
      return Boolean(draft.districtId);
    case "developer":
      return (draft.developerIds?.length ?? 0) > 0;
    case "status":
      return (draft.developmentStatus?.length ?? 0) > 0;
    case "completion":
      return (draft.completionStatus?.length ?? 0) > 0;
    case "handover":
      return Boolean(draft.completionDate && draft.completionDate !== "all");
    case "price":
      return Boolean(
        (draft.minPrice && draft.minPrice !== "0") ||
          (draft.maxPrice && draft.maxPrice !== "0")
      );
    case "downPayment":
      return Boolean(draft.downPayment);
    case "postHandover":
      return Boolean(draft.postHandover);
    case "paymentBreakdown": {
      const pb = draft.paymentBreakdown ?? EMPTY_PAYMENT_BREAKDOWN;
      return Object.values(pb).some((v) => v?.trim());
    }
    case "visibility":
      return Boolean(draft.projectVisibility && draft.projectVisibility !== "all");
    case "more":
      return Boolean(
        draft.beds ||
          (draft.propertyTypes?.length ?? 0) > 0 ||
          (draft.minArea && draft.minArea !== "0") ||
          (draft.maxArea && draft.maxArea !== "0")
      );
    default:
      return false;
  }
}
