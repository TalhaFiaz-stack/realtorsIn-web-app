import "server-only";

import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";
import {
  isScheduledBackendSuccess,
  mapScheduledPostsPage,
  scheduledBackendMessage,
} from "@/features/feed/lib/map-scheduled-post";
import type { ScheduledPostsPage } from "@/features/feed/types/scheduled-post.types";

export async function fetchScheduledPosts(input: {
  page?: number;
  limit?: number;
}): Promise<ScheduledPostsPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/scheduled/list",
    method: "POST",
    auth: true,
    data: {
      page: input.page ?? 1,
      limit: input.limit ?? 20,
    },
  });

  if (!isScheduledBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      scheduledBackendMessage(payload, "Unable to load scheduled posts"),
      502
    );
  }
  return mapScheduledPostsPage(payload);
}

export async function cancelScheduledPost(postId: number): Promise<string> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/scheduled/cancel",
    method: "POST",
    auth: true,
    data: { post_id: postId },
  });

  if (!isScheduledBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      scheduledBackendMessage(payload, "Unable to cancel scheduled post"),
      502
    );
  }
  return scheduledBackendMessage(payload, "Scheduled post cancelled");
}

export async function updateScheduledPost(input: {
  postId: number;
  scheduledAt: string;
}): Promise<string> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/scheduled/update",
    method: "POST",
    auth: true,
    data: {
      post_id: input.postId,
      scheduled_at: input.scheduledAt,
    },
  });

  if (!isScheduledBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      scheduledBackendMessage(payload, "Unable to update schedule"),
      502
    );
  }
  return scheduledBackendMessage(payload, "Schedule updated");
}
