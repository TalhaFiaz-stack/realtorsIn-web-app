import { bffRequest } from "@/lib/api/client";
import type { ScheduledPostsPage } from "@/features/feed/types/scheduled-post.types";

export async function fetchScheduledPostsRequest(input: {
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}): Promise<ScheduledPostsPage> {
  const result = await bffRequest<{ ok: true } & ScheduledPostsPage>({
    path: "posts/scheduled/list",
    method: "POST",
    data: {
      page: input.page ?? 1,
      limit: input.limit ?? 20,
    },
    signal: input.signal,
  });
  return {
    posts: result.posts,
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
    hasNextPage: result.hasNextPage,
  };
}

export async function cancelScheduledPostRequest(postId: number) {
  return bffRequest<{ ok: true; message: string }>({
    path: "posts/scheduled/cancel",
    method: "POST",
    data: { postId },
  });
}

export async function updateScheduledPostRequest(input: {
  postId: number;
  scheduledAt: string;
}) {
  return bffRequest<{ ok: true; message: string }>({
    path: "posts/scheduled/update",
    method: "POST",
    data: input,
  });
}
