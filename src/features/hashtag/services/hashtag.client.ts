import { bffRequest } from "@/lib/api/client";
import type { FollowedHashtagsPage } from "@/features/hashtag/types/hashtag.types";

export async function fetchFollowedHashtagsRequest(signal?: AbortSignal) {
  return bffRequest<{ ok: true } & FollowedHashtagsPage>({
    path: "posts/hashtag/follow/list",
    method: "POST",
    data: { page: 1, limit: 50 },
    signal,
  });
}

export async function unfollowHashtagRequest(input: {
  hashtagId: number;
  hashtag: string;
}) {
  return bffRequest<{ ok: true; message: string }>({
    path: "posts/hashtag/follow/remove",
    method: "POST",
    data: input,
  });
}
