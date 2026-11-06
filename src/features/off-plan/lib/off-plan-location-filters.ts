import type { OffPlanDistrict, OffPlanFilterOption } from "@/features/off-plan/types/off-plan.types";

/** Prefer district-derived cities (mobile off-plan); fall back to filter meta. */
export function offPlanCityOptions(
  districts: OffPlanDistrict[],
  metaCities: OffPlanFilterOption[]
): OffPlanFilterOption[] {
  const fromDistricts = offPlanCitiesFromDistricts(districts);
  if (fromDistricts.length > 0) return fromDistricts;
  return metaCities;
}

/** Cities derived from districts (mobile Off Plan filter behavior). */
export function offPlanCitiesFromDistricts(
  districts: OffPlanDistrict[]
): OffPlanFilterOption[] {
  const cityMap = new Map<string, string>();
  districts.forEach((d) => {
    if (d.cityName && d.cityId != null && !cityMap.has(String(d.cityId))) {
      cityMap.set(String(d.cityId), d.cityName);
    }
  });
  return Array.from(cityMap.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function offPlanDistrictOptions(
  districts: OffPlanDistrict[],
  cityId?: string
): OffPlanFilterOption[] {
  const filtered = cityId
    ? districts.filter((d) => String(d.cityId) === cityId)
    : districts;
  return filtered
    .filter((d) => d.title.trim())
    .map((d) => ({ label: d.title, value: String(d.id) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function offPlanCityOptionsForDistrict(
  districts: OffPlanDistrict[],
  districtId?: string
): OffPlanFilterOption[] {
  if (!districtId) return offPlanCitiesFromDistricts(districts);
  const district = districts.find((d) => String(d.id) === districtId);
  if (!district?.cityId || !district.cityName) {
    return offPlanCitiesFromDistricts(districts);
  }
  return [{ value: String(district.cityId), label: district.cityName }];
}
