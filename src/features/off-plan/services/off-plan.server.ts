import "server-only";

import { createHash } from "node:crypto";
import { getRemCatalogBearerToken } from "@/lib/auth/rem-catalog-token";

import {
  flattenInventoryFloors,
  mapOffPlanDistricts,
  mapOffPlanProjectDetail,
  mapOffPlanProjectsPage,
} from "@/features/off-plan/lib/map-off-plan";
import { buildOffPlanProjectsFormData } from "@/features/off-plan/lib/build-projects-form-data";
import {
  mapOffPlanFeedSections,
  type OffPlanFeedSection,
} from "@/features/off-plan/lib/off-plan-feed-sections";
import type {
  OffPlanDistrict,
  OffPlanFilterMeta,
  OffPlanInventoryUnit,
  OffPlanListFilters,
  OffPlanProjectDetail,
  OffPlanProjectSummary,
  OffPlanProjectsPage,
} from "@/features/off-plan/types/off-plan.types";
import {
  mapOffPlanFilterMeta,
} from "@/features/off-plan/lib/map-off-plan-filter-meta";
import {
  isOffplanSuccess,
  offplanRequest,
} from "@/lib/api/offplan.server";
import { ApiError } from "@/lib/api/errors";

function assertOffplan(payload: unknown, fallback: string) {
  if (!isOffplanSuccess(payload)) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof (payload as { message: unknown }).message === "string"
        ? (payload as { message: string }).message
        : fallback;
    throw new ApiError("SERVER", message, 502);
  }
}

export async function fetchOffPlanProjectsPage(
  filters: OffPlanListFilters
): Promise<OffPlanProjectsPage> {
  const form = buildOffPlanProjectsFormData(filters);
  const payload = await offplanRequest<unknown>({
    path: "rn/projects",
    method: "POST",
    data: form,
  });
  assertOffplan(payload, "Unable to load off-plan projects");
  return mapOffPlanProjectsPage(payload);
}

export async function fetchOffPlanProjectDetail(
  projectId: string
): Promise<OffPlanProjectDetail> {
  const payload = await offplanRequest<unknown>({
    path: `rn/projects/${projectId}`,
    method: "GET",
  });
  assertOffplan(payload, "Unable to load project");
  const root =
    payload && typeof payload === "object" && "data" in payload
      ? (payload as { data: unknown }).data
      : payload;
  const mapped = mapOffPlanProjectDetail(root);
  if (!mapped) {
    throw new ApiError("SERVER", "Invalid project response", 502);
  }
  return mapped;
}

export async function fetchOffPlanDistricts(): Promise<OffPlanDistrict[]> {
  const payload = await offplanRequest<unknown>({
    path: "rn/districts",
    method: "GET",
    auth: false,
  });
  if (!isOffplanSuccess(payload) && !Array.isArray(payload)) {
    return mapOffPlanDistricts(payload);
  }
  return mapOffPlanDistricts(payload);
}

export async function fetchOffPlanInventory(
  projectId: string
): Promise<OffPlanInventoryUnit[]> {
  const payload = await offplanRequest<unknown>({
    path: `rn/inventory/project/${projectId}`,
    method: "GET",
  });
  if (!isOffplanSuccess(payload)) {
    throw new ApiError("SERVER", "Unable to load units", 502);
  }
  return flattenInventoryFloors(payload);
}

export async function fetchOffPlanFiltersMeta(): Promise<OffPlanFilterMeta> {
  const payload = await offplanRequest<unknown>({
    path: "rn/filters",
    method: "GET",
  });
  if (!isOffplanSuccess(payload) && !asRecord(payload)?.data) {
    return mapOffPlanFilterMeta(payload);
  }
  return mapOffPlanFilterMeta(payload);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/**
 * The off-plan API only offers `per_page=all` for the map (one ~16s, ~1.5MB
 * response for ~2,400 projects; 30-per-page is slower overall). Cache it per
 * user + filter set and share in-flight requests so repeat visits are instant.
 */
const MAP_CACHE_TTL_MS = 10 * 60 * 1000;
const MAP_CACHE_MAX_ENTRIES = 200;
const mapCache = new Map<
  string,
  { at: number; promise: Promise<OffPlanProjectSummary[]> }
>();

function mapCacheKey(token: string, filters: object): string {
  const user = createHash("sha256").update(token).digest("hex").slice(0, 24);
  const sorted = JSON.stringify(filters, Object.keys(filters).sort());
  return `${user}:${sorted}`;
}

async function loadOffPlanProjectsForMap(
  filters: Omit<OffPlanListFilters, "page" | "perPageAll">
): Promise<OffPlanProjectSummary[]> {
  const page = await fetchOffPlanProjectsPage({
    ...filters,
    page: 1,
    perPageAll: true,
  });
  return page.projects.filter(
    (p) =>
      p.lat != null &&
      p.lng != null &&
      p.projectStatus?.toLowerCase() !== "out of stock"
  );
}

export async function fetchOffPlanProjectsForMap(
  filters: Omit<OffPlanListFilters, "page" | "perPageAll">
): Promise<OffPlanProjectSummary[]> {
  // Private projects can differ per member, so the cache is per catalog token.
  const token = await getRemCatalogBearerToken();
  const key = mapCacheKey(token, filters);
  const now = Date.now();
  const hit = mapCache.get(key);
  if (hit && now - hit.at < MAP_CACHE_TTL_MS) return hit.promise;

  const promise = loadOffPlanProjectsForMap(filters);
  mapCache.set(key, { at: now, promise });
  promise.catch(() => mapCache.delete(key)); // never cache failures
  if (mapCache.size > MAP_CACHE_MAX_ENTRIES) {
    const oldest = mapCache.keys().next().value;
    if (oldest) mapCache.delete(oldest);
  }
  return promise;
}

/** Dubai downtown — used when the browser shares no location (mobile also needs a lat/long). */
const OFF_PLAN_FEED_DEFAULT_COORDS = { lat: 25.2048, lng: 55.2708 };

/**
 * Feed "top projects" sections (`rn/projects/top`) — public catalog endpoint,
 * same call as mobile `getTopProjects(lat, long)`.
 */
export async function fetchOffPlanFeedSections(
  coords: { lat: number; lng: number } | null
): Promise<OffPlanFeedSection[]> {
  const { lat, lng } = coords ?? OFF_PLAN_FEED_DEFAULT_COORDS;
  const payload = await offplanRequest<unknown>({
    path: `rn/projects/top?lat=${encodeURIComponent(lat)}&long=${encodeURIComponent(lng)}`,
    method: "GET",
    auth: false,
  });
  assertOffplan(payload, "Unable to load top projects");
  const sections = mapOffPlanFeedSections(payload);
  // Without a real location "Projects Near You" would just be Dubai — drop it.
  return coords ? sections : sections.filter((s) => s.key !== "top_nearest");
}
