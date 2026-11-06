import type { OffPlanFilterMeta, OffPlanFilterOption } from "@/features/off-plan/types/off-plan.types";
import { asRecord, asString } from "@/features/off-plan/lib/off-plan-parse";

function mapCityNameList(list: unknown): OffPlanFilterOption[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      if (typeof item === "string" && item.trim()) {
        const name = item.trim();
        return { label: name, value: name };
      }
      return null;
    })
    .filter((o): o is OffPlanFilterOption => o != null);
}

function mapOptions(
  list: unknown,
  labelKey = "name",
  valueKey = "id"
): OffPlanFilterOption[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      const row = asRecord(item);
      if (!row) return null;
      const label = asString(row[labelKey]) ?? asString(row.label) ?? asString(row.title);
      const value =
        asString(row[valueKey]) ??
        (row[valueKey] != null ? String(row[valueKey]) : null) ??
        asString(row.value);
      if (!label || !value) return null;
      const image = asString(row.image);
      const opt: OffPlanFilterOption = { label, value };
      if (image) opt.image = image;
      return opt;
    })
    .filter((o): o is OffPlanFilterOption => o != null);
}

/**
 * Mobile `PropertyFilterComp` builds sale statuses from `rn/filters` as:
 * `{ label: status.value, value: status.value }` — API rows are often `{ value: "On Sale" }`
 * without `name`. The previous mapper required both label and value and dropped these rows.
 */
function developmentStatusOptions(list: unknown): OffPlanFilterOption[] {
  if (!Array.isArray(list)) return [];
  const out: OffPlanFilterOption[] = [];
  const seen = new Set<string>();
  for (const item of list) {
    if (typeof item === "string" && item.trim()) {
      const v = item.trim();
      if (!seen.has(v)) {
        seen.add(v);
        out.push({ label: v, value: v });
      }
      continue;
    }
    const row = asRecord(item);
    if (!row) continue;
    const rawValue =
      asString(row.value) ??
      asString(row.name) ??
      asString(row.title) ??
      asString(row.label);
    if (!rawValue?.trim()) continue;
    const value = rawValue.trim();
    const label =
      (asString(row.name)?.trim() ||
        asString(row.label)?.trim() ||
        asString(row.title)?.trim() ||
        value);
    const dedupeKey = value.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push({ label, value });
  }
  return out;
}

function completionStatusOptions(list: unknown): OffPlanFilterOption[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      const row = asRecord(item);
      if (!row) return null;
      const name = asString(row.name);
      if (!name) return null;
      const slug = name.trim().toLowerCase().replace(/\s+/g, "_");
      return { label: name, value: slug };
    })
    .filter((o): o is OffPlanFilterOption => Boolean(o));
}

export function mapOffPlanFilterMeta(payload: unknown): OffPlanFilterMeta {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root ?? {};

  const fromMapOptions =
    mapOptions(data.statuses, "name", "value").length > 0
      ? mapOptions(data.statuses, "name", "value")
      : mapOptions(data.statuses, "name", "name");

  return {
    developers: mapOptions(data.developers, "name", "id"),
    developmentStatuses:
      fromMapOptions.length > 0
        ? fromMapOptions
        : developmentStatusOptions(data.statuses),
    completionStatuses: completionStatusOptions(data.completionStatuses),
    unitTypes: mapOptions(data.unitTypes, "name", "value").length
      ? mapOptions(data.unitTypes, "name", "value")
      : mapOptions(data.unitTypes, "name", "name"),
    cities: (() => {
      const fromData = mapOptions(data.citiesData, "name", "id");
      if (fromData.length) return fromData;
      const withIds = mapOptions(data.cities, "name", "id");
      if (withIds.length) return withIds;
      return mapCityNameList(data.cities);
    })(),
    deliveryDates: Array.isArray(data.allDeliveryDates)
      ? data.allDeliveryDates
          .map((d) => (typeof d === "string" ? d : asString(asRecord(d)?.name)))
          .filter((d): d is string => Boolean(d))
      : [],
    minPrice: asString(data.minPrice) ?? asString(data.min_price),
    maxPrice: asString(data.maxPrice) ?? asString(data.max_price),
    minArea: asString(data.minArea) ?? asString(data.min_area),
    maxArea: asString(data.maxArea) ?? asString(data.max_area),
    allowPrivateProjects: Boolean(data.allow_private_projects),
  };
}

export function emptyOffPlanFilterMeta(): OffPlanFilterMeta {
  return {
    developers: [],
    developmentStatuses: [],
    completionStatuses: [],
    unitTypes: [],
    cities: [],
    deliveryDates: [],
    minPrice: null,
    maxPrice: null,
    minArea: null,
    maxArea: null,
    allowPrivateProjects: false,
  };
}
