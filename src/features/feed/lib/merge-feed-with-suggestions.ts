import type { SocialEvent } from "@/features/events/types/event.types";
import type { FeedPost } from "@/features/feed/types/post.types";
import type { JobPost } from "@/features/jobs/types/job.types";
import type { NetworkPerson } from "@/features/network/types/network.types";
import {
  OFF_PLAN_FEED_FIRST_AT,
  OFF_PLAN_FEED_INTERVAL,
  OFF_PLAN_FEED_PINNED_KEY,
  type OffPlanFeedSection,
} from "@/features/off-plan/lib/off-plan-feed-sections";

export type FeedSuggestionModuleType =
  | "contact_suggestions"
  | "connection_suggestions"
  | "offplan_suggestions"
  | "job_suggestions"
  | "event_suggestions";

export type FeedSuggestionModuleData = {
  contact_suggestions: NetworkPerson[];
  connection_suggestions: NetworkPerson[];
  job_suggestions: JobPost[];
  event_suggestions: SocialEvent[];
  /** Off-plan "top projects" sections (pinned + cycling), mobile order. */
  offplan_sections?: OffPlanFeedSection[];
};

export type FeedListRow =
  | { kind: "post"; post: FeedPost }
  | {
      kind: "module";
      id: string;
      moduleType: FeedSuggestionModuleType;
      people?: NetworkPerson[];
      jobs?: JobPost[];
      events?: SocialEvent[];
      offPlanSection?: OffPlanFeedSection;
    };

type ModuleSchedule = {
  type: FeedSuggestionModuleType;
  priority: number;
  firstAt: number;
  interval: number;
  data: unknown[];
};

const FEED_MODULES: Omit<ModuleSchedule, "data">[] = [
  { type: "contact_suggestions", priority: 1, firstAt: 10, interval: 10 },
  { type: "connection_suggestions", priority: 2, firstAt: 7, interval: 7 },
  {
    type: "offplan_suggestions",
    priority: 3,
    firstAt: OFF_PLAN_FEED_FIRST_AT,
    interval: OFF_PLAN_FEED_INTERVAL,
  },
  { type: "job_suggestions", priority: 4, firstAt: 5, interval: 20 },
  { type: "event_suggestions", priority: 5, firstAt: 3, interval: 15 },
];

function moduleData(
  type: FeedSuggestionModuleType,
  bundle: FeedSuggestionModuleData
): unknown[] {
  switch (type) {
    case "contact_suggestions":
      return bundle.contact_suggestions;
    case "connection_suggestions":
      return bundle.connection_suggestions;
    case "job_suggestions":
      return bundle.job_suggestions;
    case "event_suggestions":
      return bundle.event_suggestions;
    case "offplan_suggestions":
      return cyclingOffPlanSections(bundle);
  }
}

function rowFromModule(
  postCount: number,
  type: FeedSuggestionModuleType,
  data: unknown[]
): FeedListRow {
  const base = {
    kind: "module" as const,
    id: `${type}-${postCount}`,
    moduleType: type,
  };
  if (type === "job_suggestions") {
    return { ...base, jobs: data as JobPost[] };
  }
  if (type === "event_suggestions") {
    return { ...base, events: data as SocialEvent[] };
  }
  return { ...base, people: data as NetworkPerson[] };
}

function pinnedOffPlanSection(bundle: FeedSuggestionModuleData) {
  return (
    bundle.offplan_sections?.find(
      (s) => s.key === OFF_PLAN_FEED_PINNED_KEY && s.projects.length > 0
    ) ?? null
  );
}

/** Mid-feed off-plan rows rotate through every non-pinned section. */
function cyclingOffPlanSections(bundle: FeedSuggestionModuleData) {
  return (bundle.offplan_sections ?? []).filter(
    (s) => s.key !== OFF_PLAN_FEED_PINNED_KEY && s.projects.length > 0
  );
}

/**
 * Mirrors mobile `FeedListComp` suggestion slot scheduling:
 * - "Top Picks for You" off-plan row pinned above the first post
 * - events after post 3 (every 15), jobs after 5 (every 20), connections after 7
 *   (every 7), contacts after 10 (every 10), off-plan sections after 13 (every 20)
 * - when two modules want the same slot, the higher priority keeps it and the
 *   other moves to the next free slot.
 */
export function mergeFeedWithSuggestions(
  posts: FeedPost[],
  bundle: FeedSuggestionModuleData
): FeedListRow[] {
  const safePosts = Array.isArray(posts) ? posts : [];
  const modules: ModuleSchedule[] = FEED_MODULES.map((mod) => ({
    ...mod,
    data: moduleData(mod.type, bundle),
  })).filter((m) => m.data.length > 0 && safePosts.length >= m.firstAt);

  const pinned = pinnedOffPlanSection(bundle);
  const pinnedRows: FeedListRow[] = pinned
    ? [
        {
          kind: "module",
          id: `offplan_suggestions-0-${pinned.key}`,
          moduleType: "offplan_suggestions",
          offPlanSection: pinned,
        },
      ]
    : [];

  if (modules.length === 0) {
    return [...pinnedRows, ...safePosts.map((post) => ({ kind: "post" as const, post }))];
  }

  const totalPosts = safePosts.length;
  const occupied = new Set<number>();
  const schedule = new Map<number, FeedSuggestionModuleType>();

  modules.sort((a, b) => a.priority - b.priority);

  for (const mod of modules) {
    const desiredPositions: number[] = [];
    let pos = mod.firstAt;
    while (pos <= totalPosts) {
      desiredPositions.push(pos);
      pos += mod.interval;
    }

    for (const desired of desiredPositions) {
      let slot = desired;
      while (occupied.has(slot) && slot <= totalPosts) {
        slot += 1;
      }
      if (slot <= totalPosts) {
        occupied.add(slot);
        schedule.set(slot, mod.type);
      }
    }
  }

  const rows: FeedListRow[] = [...pinnedRows];
  const cycling = cyclingOffPlanSections(bundle);
  let postCount = 0;
  let offPlanIndex = 0;

  for (const post of safePosts) {
    rows.push({ kind: "post", post });
    postCount += 1;

    const moduleType = schedule.get(postCount);
    if (!moduleType) continue;

    if (moduleType === "offplan_suggestions") {
      if (cycling.length === 0) continue;
      const section = cycling[offPlanIndex % cycling.length];
      offPlanIndex += 1;
      rows.push({
        kind: "module",
        id: `offplan_suggestions-${postCount}-${section.key}`,
        moduleType,
        offPlanSection: section,
      });
      continue;
    }

    const data = moduleData(moduleType, bundle);
    if (data.length === 0) continue;
    rows.push(rowFromModule(postCount, moduleType, data));
  }

  return rows;
}

export function isDefaultFeedFilters(filters: {
  feedType?: string;
  propertyCategory?: string;
  listingTransaction?: string;
  inquiryType?: string;
}): boolean {
  return (
    !filters.feedType &&
    !filters.propertyCategory &&
    !filters.listingTransaction &&
    !filters.inquiryType
  );
}
