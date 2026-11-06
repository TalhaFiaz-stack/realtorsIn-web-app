import { bffRequest } from "@/lib/api/client";
import type {
  ActivityCommentsPage,
  ActivityPostsKind,
  ActivityRepostsPage,
  ActivitySummary,
} from "@/features/activities/types/activity.types";
import type { ActivityReactionsFilter } from "@/features/activities/types/reactions.types";
import type { FeedPage } from "@/features/feed/types/post.types";

export async function fetchActivitySummaryRequest(signal?: AbortSignal) {
  return bffRequest<{ ok: true; summary: ActivitySummary }>({
    path: "activities/summary",
    method: "GET",
    signal,
  });
}

export async function fetchActivityPostsPageRequest(
  kind: ActivityPostsKind,
  page: number,
  signal?: AbortSignal
) {
  return bffRequest<{ ok: true } & FeedPage>({
    path: "activities/saved",
    method: "GET",
    params: { page },
    signal,
  });
}

export async function fetchActivityReactionsPageRequest(
  page: number,
  filter: ActivityReactionsFilter,
  signal?: AbortSignal
) {
  return bffRequest<{ ok: true } & FeedPage>({
    path: "activities/liked-posts",
    method: "GET",
    params: { page, type: filter },
    signal,
  });
}

export async function unlikeActivityPostsRequest(postIds: number[]) {
  return bffRequest<{ ok: true }>({
    path: "activities/unlike-posts",
    method: "POST",
    data: { postIds },
  });
}

export async function fetchActivityRepostsPageRequest(
  page: number,
  signal?: AbortSignal
) {
  return bffRequest<{ ok: true } & ActivityRepostsPage>({
    path: "activities/reposts",
    method: "GET",
    params: { page },
    signal,
  });
}

export async function fetchActivityCommentsPageRequest(
  page: number,
  signal?: AbortSignal
) {
  return bffRequest<{ ok: true } & ActivityCommentsPage>({
    path: "activities/comments",
    method: "GET",
    params: { page },
    signal,
  });
}
