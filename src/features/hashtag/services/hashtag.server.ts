import "server-only";

import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";
import {
  hashtagMessage,
  isHashtagSuccess,
  mapFollowedHashtagsPage,
} from "@/features/hashtag/lib/map-followed-hashtag";
import type { FollowedHashtagsPage } from "@/features/hashtag/types/hashtag.types";

export async function fetchFollowedHashtags(input?: {
  page?: number;
  limit?: number;
}): Promise<FollowedHashtagsPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/hashtag/follow/list",
    method: "POST",
    auth: true,
    data: {
      page: input?.page ?? 1,
      per_page: input?.limit ?? 50,
    },
  });

  if (!isHashtagSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      hashtagMessage(payload, "Unable to load followed tags"),
      502
    );
  }
  return mapFollowedHashtagsPage(payload);
}

export async function unfollowHashtag(input: {
  hashtagId?: number;
  hashtag?: string;
}) {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/hashtag/follow/remove",
    method: "POST",
    auth: true,
    data: {
      ...(input.hashtagId ? { hashtag_id: input.hashtagId } : {}),
      ...(input.hashtag ? { hashtag: input.hashtag.replace(/^#/, "") } : {}),
    },
  });

  if (!isHashtagSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      hashtagMessage(payload, "Unable to unfollow tag"),
      502
    );
  }
  return hashtagMessage(payload, "Unfollowed");
}

export async function followHashtag(input: {
  hashtagId?: number;
  hashtag?: string;
}) {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/hashtag/follow/store",
    method: "POST",
    auth: true,
    data: {
      ...(input.hashtagId ? { hashtag_id: input.hashtagId } : {}),
      ...(input.hashtag ? { hashtag: input.hashtag.replace(/^#/, "") } : {}),
    },
  });

  if (!isHashtagSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      hashtagMessage(payload, "Unable to follow tag"),
      502
    );
  }
  return hashtagMessage(payload, "Following");
}
