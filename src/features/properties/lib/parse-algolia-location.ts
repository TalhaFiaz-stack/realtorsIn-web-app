/** Mirrors mobile `parseAlgoliaSelectionForCreatePost` + `formatLocationDisplay`. */

export type AlgoliaHierarchyItem = { level: number; name: string };

export type AlgoliaLocationHit = {
  name?: string;
  id?: number | string;
  externalID?: number | string;
  building_id?: number | string;
  level?: number;
  hierarchy?: AlgoliaHierarchyItem[];
  hasBuilding?: boolean;
  _geoloc?: { lat: number; lng: number };
  geography?: { lat: number; lng: number };
  geo_point?: [number, number];
};

export type ParsedAlgoliaLocation = {
  /** Stored location name (`location.name` on mobile). */
  label: string;
  /** Full hierarchy path for display when closed. */
  displayLabel: string;
  city: string;
  community: string;
  subCommunity: string;
  latLong: string;
  neighbourhoodId?: number;
  buildingId?: number;
};

function parseNumericId(raw: unknown): number | undefined {
  if (raw == null || raw === "") return undefined;
  const n = Number(String(raw).replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

export function formatAlgoliaLocationDisplay(
  hit: Pick<AlgoliaLocationHit, "name" | "hierarchy">
): string {
  const hierarchy = hit.hierarchy ?? [];
  if (hierarchy.length === 0) {
    return hit.name?.trim() || "";
  }

  const hasLevel5 = hierarchy.some((item) => item.level === 5);
  const path = hierarchy
    .filter((item) => {
      if (item.level === 0) return false;
      if (hasLevel5 && item.level === 2) return false;
      return true;
    })
    .sort((a, b) => b.level - a.level)
    .map((item) => item.name)
    .join(", ");

  return path || hit.name?.trim() || "";
}

function parseHierarchyFields(hierarchy: AlgoliaHierarchyItem[]) {
  if (hierarchy.length === 0) {
    return { city: "", community: "", subCommunity: "" };
  }

  const hasLevel5 = hierarchy.some((item) => item.level === 5);
  const communityLevel = hasLevel5 ? 3 : 2;
  const subCommunityLevel = hasLevel5 ? 4 : 3;

  const level1 = hierarchy.find((item) => item.level === 1);
  const communityNode = hierarchy.find((item) => item.level === communityLevel);
  const subNode = hierarchy.find((item) => item.level === subCommunityLevel);

  return {
    city: level1?.name?.trim() ?? "",
    community: communityNode?.name?.trim() ?? "",
    subCommunity: subNode?.name?.trim() ?? "",
  };
}

function hitCoordinates(hit: AlgoliaLocationHit): { lat: number; lng: number } | undefined {
  if (hit._geoloc?.lat != null && hit._geoloc?.lng != null) {
    return hit._geoloc;
  }
  if (hit.geography?.lat != null && hit.geography?.lng != null) {
    return hit.geography;
  }
  if (hit.geo_point && hit.geo_point.length >= 2) {
    return { lat: hit.geo_point[1], lng: hit.geo_point[0] };
  }
  return undefined;
}

function resolveLocationIds(hit: AlgoliaLocationHit): {
  neighbourhoodId?: number;
  buildingId?: number;
} {
  const level = hit.level;
  const numericId = parseNumericId(hit.externalID ?? hit.id);

  if (level === 5 || level === 4) {
    const buildingId =
      parseNumericId(hit.building_id ?? hit.externalID ?? hit.id) ?? numericId;
    return buildingId != null ? { buildingId } : {};
  }

  if (numericId != null) {
    return { neighbourhoodId: numericId };
  }

  return {};
}

export function parseAlgoliaLocationHit(hit: AlgoliaLocationHit): ParsedAlgoliaLocation {
  const label = hit.name?.trim() || "";
  const displayLabel = formatAlgoliaLocationDisplay(hit);
  const { city, community, subCommunity } = parseHierarchyFields(hit.hierarchy ?? []);
  const coords = hitCoordinates(hit);
  const latLong =
    coords != null ? `${coords.lat},${coords.lng}` : "";

  const ids = resolveLocationIds(hit);

  return {
    label,
    displayLabel,
    city,
    community,
    subCommunity,
    latLong,
    ...ids,
  };
}
