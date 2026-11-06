import "server-only";

import { ApiError } from "@/lib/api/errors";
import { isOffplanSuccess, offplanRequest } from "@/lib/api/offplan.server";
import {
  fetchOffPlanDistricts,
  fetchOffPlanProjectsPage,
} from "@/features/off-plan/services/off-plan.server";
import {
  mapOffPlanPopularSearch,
  mapOffPlanSearchSuggestions,
} from "@/features/off-plan/lib/off-plan-search-map";
import type { OffPlanSearchSections } from "@/features/off-plan/types/off-plan-search.types";

function unwrapData(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload;
  const record = payload as Record<string, unknown>;
  if ("data" in record) return record.data;
  return payload;
}

const EMPTY_SECTIONS: OffPlanSearchSections = {
  featuredProjects: [],
  projects: [],
  cities: [],
  districts: [],
  developers: [],
};

async function loadOffPlanSearchProjectCatalog() {
  try {
    const page = await fetchOffPlanProjectsPage({
      page: 1,
      perPageAll: true,
      projectVisibility: "all",
      sortBy: "default",
    });
    return page.projects;
  } catch {
    return [];
  }
}

export async function fetchOffPlanPopularSearch(
  limit = 20
): Promise<OffPlanSearchSections> {
  const [districts, catalog] = await Promise.all([
    fetchOffPlanDistricts(),
    loadOffPlanSearchProjectCatalog(),
  ]);
  try {
    // Same host as mobile `NODE_BASE_URL_PROJECT` + `/api/v1/projects/search/popular`.
    const payload = await offplanRequest<unknown>({
      path: `v1/projects/search/popular?limit=${limit}`,
      method: "GET",
    });
    const data = unwrapData(payload);
    if (!data || typeof data !== "object") {
      return mapOffPlanPopularSearch({}, districts, catalog);
    }
    return mapOffPlanPopularSearch(data, districts, catalog);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return EMPTY_SECTIONS;
    }
    throw error;
  }
}

export async function fetchOffPlanSearchSuggestions(
  text: string
): Promise<OffPlanSearchSections> {
  const query = text.trim();
  if (query.length < 2) {
    return {
      featuredProjects: [],
      projects: [],
      cities: [],
      districts: [],
      developers: [],
    };
  }
  const payload = await offplanRequest<unknown>({
    path: `mobile/search-suggestions?text=${encodeURIComponent(query)}`,
    method: "GET",
  });
  if (!isOffplanSuccess(payload) && !(payload && typeof payload === "object")) {
    return mapOffPlanSearchSuggestions(null);
  }
  const data = unwrapData(payload);
  return mapOffPlanSearchSuggestions(data);
}
