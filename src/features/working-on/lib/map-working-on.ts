import type {
  WorkingOnData,
  WorkingOnItem,
} from "@/features/working-on/types/working-on.types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function mapProject(raw: unknown): WorkingOnItem | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id) ?? asNumber(row.project_id);
  if (id == null) return null;
  const title =
    asString(row.title) ??
    asString(row.project_title) ??
    asString(row.name) ??
    `Project #${id}`;
  return {
    id,
    kind: "project",
    title,
    subtitle: asString(row.developer_name) ?? asString(row.location),
    propertyType: null,
  };
}

function mapProperty(raw: unknown): WorkingOnItem | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id) ?? asNumber(row.property_id);
  if (id == null) return null;
  const title =
    asString(row.title) ??
    asString(row.property_title) ??
    asString(row.name) ??
    `Property #${id}`;
  return {
    id,
    kind: "property",
    title,
    subtitle: asString(row.location) ?? asString(row.area),
    propertyType: asString(row.type) ?? asString(row.property_type),
  };
}

export function mapWorkingOn(payload: unknown): WorkingOnData {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const projectsRaw = data?.project_list ?? data?.projects;
  const propertiesRaw = data?.properties_list ?? data?.properties;
  const projects = Array.isArray(projectsRaw)
    ? projectsRaw.map(mapProject).filter((p): p is WorkingOnItem => Boolean(p))
    : [];
  const properties = Array.isArray(propertiesRaw)
    ? propertiesRaw
        .map(mapProperty)
        .filter((p): p is WorkingOnItem => Boolean(p))
    : [];
  return { projects, properties };
}

export function isWorkingOnSuccess(payload: unknown): boolean {
  const root = asRecord(payload);
  return root?.success === true || root?.success === "true";
}

export function workingOnMessage(payload: unknown, fallback: string) {
  const root = asRecord(payload);
  return asString(root?.message) ?? fallback;
}
