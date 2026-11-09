import { mapOffPlanProjectSummary } from "@/features/off-plan/lib/map-off-plan";
import type { OffPlanProjectSummary } from "@/features/off-plan/types/off-plan.types";

/**
 * Horizontal off-plan rows in the home feed — same sections, order and copy as
 * mobile `constants/offPlanFeed.constants.js` (data from `rn/projects/top`).
 */
export const OFF_PLAN_FEED_SECTIONS = [
  { key: "top_overall", title: "Top Picks for You" },
  { key: "top_by_developers", title: "Projects by Leading Developers" },
  { key: "top_dubai", title: "Trending in Dubai" },
  { key: "top_abu_dhabi", title: "Trending in Abu Dhabi" },
  { key: "top_ajman", title: "Trending in Ajman" },
  { key: "top_sharjah", title: "Trending in Sharjah" },
  { key: "top_ras_al_khaimah", title: "Trending in Ras Al Khaimah" },
  { key: "top_nearest", title: "Projects Near You" },
] as const;

export type OffPlanFeedSectionKey = (typeof OFF_PLAN_FEED_SECTIONS)[number]["key"];

/** Shown above the first post (mobile "position 0"). */
export const OFF_PLAN_FEED_PINNED_KEY: OffPlanFeedSectionKey = "top_overall";

/** Mid-feed rows: first after post 13, then every 20 posts (mobile values). */
export const OFF_PLAN_FEED_FIRST_AT = 13;
export const OFF_PLAN_FEED_INTERVAL = 20;

/** City sections → city name used to pre-filter Listings on "Show all". */
export const OFF_PLAN_FEED_CITY_BY_KEY: Partial<Record<OffPlanFeedSectionKey, string>> = {
  top_dubai: "Dubai",
  top_abu_dhabi: "Abu Dhabi",
  top_ajman: "Ajman",
  top_sharjah: "Sharjah",
  top_ras_al_khaimah: "Ras Al Khaimah",
};

export type OffPlanFeedProject = OffPlanProjectSummary & {
  /** RealtorsIn-featured project (mobile shows a "Featured" badge). */
  featured: boolean;
};

export type OffPlanFeedSection = {
  key: OffPlanFeedSectionKey;
  title: string;
  projects: OffPlanFeedProject[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function isRealtorsInFeatured(row: Record<string, unknown>): boolean {
  const flag = row.is_featured;
  const on = flag === true || flag === 1 || flag === "1" || flag === "true";
  if (!on) return false;
  const featured = asRecord(row.featured);
  const ri = featured?.realtors_in;
  return ri === true || ri === 1 || ri === "1" || ri === "true";
}

/** Parses `rn/projects/top` `data` into the ordered, non-empty feed sections. */
export function mapOffPlanFeedSections(payload: unknown): OffPlanFeedSection[] {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  if (!data) return [];

  return OFF_PLAN_FEED_SECTIONS.map(({ key, title }) => {
    const rows = Array.isArray(data[key]) ? (data[key] as unknown[]) : [];
    const projects: OffPlanFeedProject[] = [];
    for (const raw of rows) {
      const summary = mapOffPlanProjectSummary(raw);
      const row = asRecord(raw);
      if (summary && row) projects.push({ ...summary, featured: isRealtorsInFeatured(row) });
    }
    return { key, title, projects };
  }).filter((section) => section.projects.length > 0);
}
