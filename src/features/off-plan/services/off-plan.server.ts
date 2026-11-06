import "server-only";

import {
  flattenInventoryFloors,
  mapOffPlanDistricts,
  mapOffPlanProjectDetail,
  mapOffPlanProjectsPage,
} from "@/features/off-plan/lib/map-off-plan";
import { buildOffPlanProjectsFormData } from "@/features/off-plan/lib/build-projects-form-data";
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

export async function fetchOffPlanProjectsForMap(
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
