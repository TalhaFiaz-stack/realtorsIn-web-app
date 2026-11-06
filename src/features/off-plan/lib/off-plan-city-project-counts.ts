import type {
  OffPlanDistrict,
  OffPlanProjectSummary,
} from "@/features/off-plan/types/off-plan.types";

/** Approximate project counts per city id from loaded projects + district names. */
export function buildOffPlanCityProjectCounts(
  projects: OffPlanProjectSummary[],
  districts: OffPlanDistrict[]
): Map<string, number> {
  const districtToCity = new Map<string, string>();
  for (const d of districts) {
    if (d.cityId == null) continue;
    districtToCity.set(d.title.trim().toLowerCase(), String(d.cityId));
  }

  const counts = new Map<string, number>();
  for (const p of projects) {
    const districtKey = p.districtName?.trim().toLowerCase();
    if (!districtKey) continue;
    const cityId = districtToCity.get(districtKey);
    if (!cityId) continue;
    counts.set(cityId, (counts.get(cityId) ?? 0) + 1);
  }
  return counts;
}
