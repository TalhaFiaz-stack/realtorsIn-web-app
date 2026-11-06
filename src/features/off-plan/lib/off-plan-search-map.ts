import { asRecord, asString } from "@/features/off-plan/lib/off-plan-parse";
import type {
  OffPlanSearchChoice,
  OffPlanSearchSections,
} from "@/features/off-plan/types/off-plan-search.types";
import type {
  OffPlanDistrict,
  OffPlanProjectSummary,
} from "@/features/off-plan/types/off-plan.types";

const EMPTY: OffPlanSearchSections = {
  featuredProjects: [],
  projects: [],
  cities: [],
  districts: [],
  developers: [],
};

function pickProjectImage(row: Record<string, unknown>): string {
  const keys = [
    "image",
    "thumbnail",
    "cover_image",
    "banner_image",
    "photo",
  ] as const;
  for (const key of keys) {
    const v = asString(row[key]);
    if (v) return v;
  }
  return "";
}

function coerceId(raw: unknown): string | number | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const s = String(raw).trim();
  return s ? s : null;
}

function projectRowId(row: Record<string, unknown>): string | number | null {
  return coerceId(row.id ?? row._id ?? row.project_id);
}

function buildProjectCatalogMap(
  catalog: OffPlanProjectSummary[] | undefined
): Map<string, OffPlanProjectSummary> {
  const map = new Map<string, OffPlanProjectSummary>();
  for (const project of catalog ?? []) {
    map.set(String(project.id), project);
  }
  return map;
}

function mapProjectSearchChoice(
  row: Record<string, unknown>,
  catalog: Map<string, OffPlanProjectSummary>
): OffPlanSearchChoice | null {
  const id = projectRowId(row);
  if (id == null) return null;
  const fromCatalog = catalog.get(String(id));
  const label =
    fromCatalog?.title ??
    asString(row.title) ??
    asString(row.name) ??
    asString(row.project_name);
  if (!label) return null;

  const statusLabel =
    fromCatalog?.projectStatus ??
    asString(row.project_status) ??
    (fromCatalog?.projectCompleted || row.project_completed
      ? "Completed"
      : null);

  return {
    detailType: "project",
    id,
    label,
    subtitle: fromCatalog?.location ?? asString(row.location) ?? undefined,
    developerName:
      fromCatalog?.developerName ?? asString(row.developer_name) ?? undefined,
    statusLabel: statusLabel ?? undefined,
    imageUrl:
      pickProjectImage(row) || fromCatalog?.bannerImage || undefined,
  };
}

export function mapOffPlanSearchSuggestions(data: unknown): OffPlanSearchSections {
  const root = asRecord(data);
  if (!root) return EMPTY;

  const cities: OffPlanSearchChoice[] = [];
  for (const item of Array.isArray(root.cities) ? root.cities : []) {
    const row = asRecord(item);
    if (!row) continue;
    const id = coerceId(row.id);
    const label = asString(row.name);
    if (id == null || !label) continue;
    cities.push({
      detailType: "city",
      id,
      label,
      count: typeof row.projectCount === "number" ? row.projectCount : undefined,
    });
  }

  const districts: OffPlanSearchChoice[] = [];
  for (const item of Array.isArray(root.districts) ? root.districts : []) {
    const row = asRecord(item);
    if (!row) continue;
    const id = coerceId(row.id);
    const label = asString(row.name);
    if (id == null || !label) continue;
    districts.push({
      detailType: "district",
      id,
      label,
      count: typeof row.projectCount === "number" ? row.projectCount : undefined,
    });
  }

  const developers: OffPlanSearchChoice[] = [];
  for (const item of Array.isArray(root.developers) ? root.developers : []) {
    const row = asRecord(item);
    if (!row) continue;
    const id = coerceId(row.id);
    const label = asString(row.name);
    if (id == null || !label) continue;
    developers.push({
      detailType: "developer",
      id,
      label,
      count: typeof row.projectCount === "number" ? row.projectCount : undefined,
    });
  }

  const projects: OffPlanSearchChoice[] = [];
  for (const item of Array.isArray(root.projects) ? root.projects : []) {
    const row = asRecord(item);
    if (!row) continue;
    const choice = mapProjectSearchChoice(row, new Map());
    if (choice) projects.push(choice);
  }

  return {
    featuredProjects: [],
    cities,
    districts,
    developers,
    projects,
  };
}

export function mapOffPlanPopularSearch(
  data: unknown,
  districts: OffPlanDistrict[],
  catalog: OffPlanProjectSummary[] = []
): OffPlanSearchSections {
  const root = asRecord(data);
  if (!root) return EMPTY;

  const cityLabelById = (cityId: unknown) => {
    if (cityId == null || cityId === "") return null;
    const row = districts.find(
      (d) => d.cityId != null && String(d.cityId) === String(cityId)
    );
    return row?.cityName ?? null;
  };

  const cities: OffPlanSearchChoice[] = [];
  for (const item of Array.isArray(root.cities) ? root.cities : []) {
    const row = asRecord(item);
    if (!row) continue;
    const id = coerceId(row.id);
    const label =
      cityLabelById(id) ??
      asString(row.name) ??
      asString(row.label);
    if (id == null || !label) continue;
    cities.push({ detailType: "city", id, label });
  }

  const districtsOut: OffPlanSearchChoice[] = [];
  for (const item of Array.isArray(root.districts) ? root.districts : []) {
    const row = asRecord(item);
    if (!row) continue;
    const id = coerceId(row.id);
    const d = districts.find((x) => String(x.id) === String(id));
    const label =
      d?.title ??
      asString(row.name) ??
      asString(row.label) ??
      asString(row.title);
    if (id == null || !label) continue;
    districtsOut.push({
      detailType: "district",
      id,
      label,
      count: typeof row.count === "number" ? row.count : undefined,
    });
  }

  const developers: OffPlanSearchChoice[] = [];
  for (const item of Array.isArray(root.developers) ? root.developers : []) {
    const row = asRecord(item);
    if (!row) continue;
    const id = coerceId(row.id);
    const label = asString(row.name);
    if (id == null || !label) continue;
    developers.push({
      detailType: "developer",
      id,
      label,
      count: typeof row.count === "number" ? row.count : undefined,
    });
  }

  const featuredProjects: OffPlanSearchChoice[] = [];
  const projects: OffPlanSearchChoice[] = [];
  const featuredIds = new Set<string>();
  const catalogMap = buildProjectCatalogMap(catalog);

  const projectRows = [
    ...(Array.isArray(root.projects) ? root.projects : []),
    ...(Array.isArray(root.featured_projects) ? root.featured_projects : []),
  ];

  for (const item of projectRows) {
    const row = asRecord(item);
    if (!row) continue;
    const choice = mapProjectSearchChoice(row, catalogMap);
    if (!choice) continue;
    const featured = Boolean(row.is_featured);
    const key = String(choice.id);
    if (featured) {
      if (!featuredIds.has(key)) {
        featuredProjects.push(choice);
        featuredIds.add(key);
      }
      continue;
    }
    if (!featuredIds.has(key)) {
      projects.push(choice);
    }
  }

  const regularDeduped = projects.filter((p) => !featuredIds.has(String(p.id)));

  return {
    featuredProjects,
    projects: regularDeduped,
    cities,
    districts: districtsOut,
    developers,
  };
}
