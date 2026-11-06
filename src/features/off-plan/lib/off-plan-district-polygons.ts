import type {
  OffPlanDistrict,
  OffPlanProjectSummary,
} from "@/features/off-plan/types/off-plan.types";
import { asRecord, asString } from "@/features/off-plan/lib/off-plan-parse";

/** Outer ring `[lng, lat][]` — matches mobile `polygon.geometry.coordinates[0]`. */
export function getDistrictPolygonRing(
  district: OffPlanDistrict
): [number, number][] | null {
  const ring = district.polygon?.coordinates?.[0];
  if (!Array.isArray(ring) || ring.length < 3) return null;
  const parsed: [number, number][] = [];
  for (const point of ring) {
    if (!Array.isArray(point) || point.length < 2) continue;
    const lng = Number(point[0]);
    const lat = Number(point[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    parsed.push([lng, lat]);
  }
  return parsed.length >= 3 ? parsed : null;
}

export function districtNamesFromProjects(
  projects: OffPlanProjectSummary[]
): string[] {
  const names = new Set<string>();
  projects.forEach((p) => {
    const key = p.districtName?.toLowerCase().trim();
    if (key) names.add(key);
  });
  return Array.from(names);
}

/** Same idea as mobile: only draw polygons for districts that appear on the current project set. */
export function districtsForMapView(
  districts: OffPlanDistrict[],
  projects: OffPlanProjectSummary[],
  selectedDistrictId?: string
): OffPlanDistrict[] {
  if (selectedDistrictId) {
    return districts.filter(
      (d) => String(d.id) === selectedDistrictId && getDistrictPolygonRing(d)
    );
  }

  const projectDistrictKeys = districtNamesFromProjects(projects);
  const withPolygons = districts.filter((d) => getDistrictPolygonRing(d));

  if (!projectDistrictKeys.length) return withPolygons;

  return withPolygons.filter((d) =>
    projectDistrictKeys.includes(d.title.toLowerCase().trim())
  );
}

/** Normalize API district rows (GeoJSON Feature or bare coordinates). */
export function parseDistrictPolygon(raw: unknown): OffPlanDistrict["polygon"] {
  const row = asRecord(raw);
  if (!row) return null;

  const polygonBlock = asRecord(row.polygon) ?? row;
  const geometry = asRecord(polygonBlock.geometry);
  let coordinates = geometry?.coordinates ?? polygonBlock.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    const direct = row.coordinates;
    if (Array.isArray(direct)) coordinates = direct;
  }

  if (!Array.isArray(coordinates) || coordinates.length === 0) return null;

  return {
    type: "Polygon",
    coordinates: coordinates as number[][][],
  };
}

export function readProjectDistrictName(raw: unknown): string | null {
  const row = asRecord(raw);
  if (!row) return null;
  const districtData = asRecord(row.district_data);
  return (
    asString(districtData?.name) ??
    asString(row.district_name) ??
    asString(row.district_title)
  );
}
