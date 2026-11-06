import "server-only";

import {
  mapActivityCommentsPage,
  mapActivityPostsPage,
  mapActivitySummary,
  mapRepostsPage,
  mapSavedPostsPage,
} from "@/features/activities/lib/map-activities";
import type {
  ActivityCommentsPage,
  ActivityRepostsPage,
  ActivitySummary,
} from "@/features/activities/types/activity.types";
import type { ActivityReactionsFilter } from "@/features/activities/types/reactions.types";
import {
  backendMessage,
  isBackendSuccess,
} from "@/features/profile/lib/map-profile";
import type { FeedPage } from "@/features/feed/types/post.types";
import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";

function assertSuccess(payload: unknown, fallback: string) {
  if (!isBackendSuccess(payload)) {
    throw new ApiError("SERVER", backendMessage(payload, fallback), 502);
  }
}

export async function fetchActivitySummary(): Promise<ActivitySummary> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/social-activities/summary",
    method: "GET",
    auth: true,
  });
  assertSuccess(payload, "Unable to load activity summary");
  return mapActivitySummary(payload);
}

export async function fetchLikedPostsPage(
  page = 1,
  type: ActivityReactionsFilter = "all"
): Promise<FeedPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/social-activities/liked-posts",
    method: "GET",
    auth: true,
    params: { page, limit: 20, type, sort: "recent" },
  });
  assertSuccess(payload, "Unable to load reactions");
  return mapActivityPostsPage(payload);
}

export async function unlikeActivityPosts(postIds: number[]) {
  const payload = await socialApiRequest<unknown>({
    path: "/api/social-activities/unlike-posts",
    method: "POST",
    auth: true,
    data: { post_ids: postIds },
  });
  assertSuccess(payload, "Unable to unlike posts");
  return payload;
}

export async function fetchRepostsPage(page = 1): Promise<ActivityRepostsPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/social-activities/reposts",
    method: "GET",
    auth: true,
    params: { page, limit: 20, sort: "recent" },
  });
  assertSuccess(payload, "Unable to load reposts");
  return mapRepostsPage(payload);
}

export async function fetchSavedPostsPage(page = 1): Promise<FeedPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/save/list",
    method: "POST",
    auth: true,
    data: { page, limit: 20 },
  });
  assertSuccess(payload, "Unable to load saved posts");
  return mapSavedPostsPage(payload);
}

export async function fetchActivityCommentsPage(
  page = 1
): Promise<ActivityCommentsPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/social-activities/comments",
    method: "GET",
    auth: true,
    params: { page, limit: 20, sort: "recent" },
  });
  assertSuccess(payload, "Unable to load comments");
  return mapActivityCommentsPage(payload);
}
