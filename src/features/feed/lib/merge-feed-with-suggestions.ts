import type { SocialEvent } from "@/features/events/types/event.types";
import type { FeedPost } from "@/features/feed/types/post.types";
import type { JobPost } from "@/features/jobs/types/job.types";
import type { NetworkPerson } from "@/features/network/types/network.types";

export type FeedSuggestionModuleType =
  | "contact_suggestions"
  | "connection_suggestions"
  | "job_suggestions"
  | "event_suggestions";

export type FeedSuggestionModuleData = {
  contact_suggestions: NetworkPerson[];
  connection_suggestions: NetworkPerson[];
  job_suggestions: JobPost[];
  event_suggestions: SocialEvent[];
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

/** Mirrors mobile `FeedListComp` suggestion slot scheduling (without off-plan). */
export function mergeFeedWithSuggestions(
  posts: FeedPost[],
  bundle: FeedSuggestionModuleData
): FeedListRow[] {
  const safePosts = Array.isArray(posts) ? posts : [];
  const modules: ModuleSchedule[] = FEED_MODULES.map((mod) => ({
    ...mod,
    data: moduleData(mod.type, bundle),
  })).filter((m) => m.data.length > 0 && safePosts.length >= m.firstAt);

  if (modules.length === 0) {
    return safePosts.map((post) => ({ kind: "post", post }));
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

  const rows: FeedListRow[] = [];
  let postCount = 0;

  for (const post of safePosts) {
    rows.push({ kind: "post", post });
    postCount += 1;

    const moduleType = schedule.get(postCount);
    if (!moduleType) continue;

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
