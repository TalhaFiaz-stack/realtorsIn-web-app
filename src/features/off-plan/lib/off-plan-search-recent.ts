import type { OffPlanSearchChoice } from "@/features/off-plan/types/off-plan-search.types";
import type {
  OffPlanDistrict,
  OffPlanFilterMeta,
} from "@/features/off-plan/types/off-plan.types";

function norm(value: string): string {
  return value.trim().toLowerCase();
}

type ResolveCtx = {
  popularCities?: OffPlanSearchChoice[];
  popularDistricts?: OffPlanSearchChoice[];
  suggestionCities?: OffPlanSearchChoice[];
  suggestionDistricts?: OffPlanSearchChoice[];
  districts: OffPlanDistrict[];
  developers: OffPlanFilterMeta["developers"];
};

/** Match mobile `resolveRecentLabelToPick` for recent chip taps. */
export function resolveOffPlanRecentLabelToPick(
  raw: string,
  ctx: ResolveCtx
): OffPlanSearchChoice | null {
  const s = raw.trim();
  if (!s) return null;

  const segments = new Set<string>([s]);
  const stripped = s.replace(/^search\s*·\s*/i, "").trim();
  if (stripped) segments.add(stripped);
  for (const part of s.split(/\s*·\s*/)) {
    const p = part.trim();
    if (p) segments.add(p);
  }

  const cityLists = [
    ...(ctx.popularCities ?? []),
    ...(ctx.suggestionCities ?? []),
  ];
  const distLists = [
    ...(ctx.popularDistricts ?? []),
    ...(ctx.suggestionDistricts ?? []),
  ];

  for (const seg of segments) {
    const lower = norm(seg);
    if (!lower) continue;

    for (const c of cityLists) {
      if (norm(c.label) === lower && c.id != null) {
        return {
          detailType: "city",
          id: c.id,
          label: c.label.trim(),
        };
      }
    }

    const citySeen = new Set<string>();
    for (const d of ctx.districts) {
      const cn = d.cityName?.trim();
      if (!cn) continue;
      const ck = norm(cn);
      if (citySeen.has(ck)) continue;
      citySeen.add(ck);
      if (ck === lower && d.cityId != null) {
        return { detailType: "city", id: d.cityId, label: cn };
      }
    }

    for (const x of distLists) {
      if (norm(x.label) === lower && x.id != null) {
        return { detailType: "district", id: x.id, label: x.label.trim() };
      }
    }

    for (const d of ctx.districts) {
      const title = (d.title ?? "").trim();
      if (title && norm(title) === lower && d.id != null) {
        return { detailType: "district", id: d.id, label: title };
      }
    }

    for (const dev of ctx.developers ?? []) {
      const name = (dev.label ?? "").trim();
      if (name && norm(name) === lower && dev.value) {
        return { detailType: "developer", id: dev.value, label: name };
      }
    }
  }

  return null;
}
