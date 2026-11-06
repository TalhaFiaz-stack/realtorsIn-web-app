import {
  PROPERTY_HUB_CATEGORY_OPTIONS,
  SOCIAL_PROPERTY_STATUS_OPTIONS,
} from "@/features/properties/constants/property-hub.constants";
import type {
  PropertyHubFilterOption,
  PropertyHubFilterOptions,
  PropertyHubStatusOption,
} from "@/features/properties/types/property-hub-filter.types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function mapPropertyTypeOptions(raw: unknown): PropertyHubFilterOption[] {
  if (!Array.isArray(raw)) return [];
  const options: PropertyHubFilterOption[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) {
      options.push({ label: item.trim(), value: item.trim() });
      continue;
    }
    const row = asRecord(item);
    if (!row) continue;
    const name =
      (typeof row.name === "string" && row.name.trim()) ||
      (typeof row.label === "string" && row.label.trim()) ||
      (typeof row.value === "string" && row.value.trim()) ||
      null;
    if (name) options.push({ label: name, value: name });
  }
  return options;
}

function mapStatusOptions(raw: unknown): PropertyHubStatusOption[] {
  if (!Array.isArray(raw)) return [];
  const options: PropertyHubStatusOption[] = [];
  for (const item of raw) {
    const row = asRecord(item);
    if (!row) continue;
    const id = Number(row.property_status_id);
    const label =
      (typeof row.status === "string" && row.status.trim()) ||
      (typeof row.name === "string" && row.name.trim()) ||
      null;
    if (Number.isFinite(id) && label) {
      options.push({ label, value: id });
    }
  }
  return options;
}

export function fallbackPropertyHubFilterOptions(): PropertyHubFilterOptions {
  return {
    categories: [...PROPERTY_HUB_CATEGORY_OPTIONS],
    propertyTypes: [],
    statuses: SOCIAL_PROPERTY_STATUS_OPTIONS.map((opt) => ({
      label: opt.label,
      value: opt.value,
    })),
  };
}

export function mergePropertyHubFilterOptions(input: {
  propertyTypesRaw: unknown;
  statusesRaw: unknown;
}): PropertyHubFilterOptions {
  const fallback = fallbackPropertyHubFilterOptions();
  const propertyTypes = mapPropertyTypeOptions(input.propertyTypesRaw);
  const statuses = mapStatusOptions(input.statusesRaw);

  return {
    categories: fallback.categories,
    propertyTypes:
      propertyTypes.length > 0 ? propertyTypes : fallback.propertyTypes,
    statuses: statuses.length > 0 ? statuses : fallback.statuses,
  };
}
