import { bffRequest } from "@/lib/api/client";
import type {
  StoriesFeed,
  StoryItem,
  StoryViewersResult,
} from "@/features/stories/types/story.types";

export async function fetchStoriesFeedRequest(signal?: AbortSignal) {
  return bffRequest<{ ok: true } & StoriesFeed>({
    path: "stories/feed",
    method: "GET",
    signal,
  });
}

export async function createStoryRequest(form: FormData) {
  return bffRequest<{ ok: true; story: StoryItem }>({
    path: "stories/create",
    method: "POST",
    data: form,
    timeoutMs: 120_000,
  });
}

export async function markStoryViewedRequest(storyId: number) {
  return bffRequest<{ ok: true }>({
    path: `stories/${storyId}/view`,
    method: "POST",
    data: {},
  });
}

export async function reactToStoryRequest(
  storyId: number,
  reaction = "heart"
) {
  return bffRequest<{ ok: true; reacted: boolean }>({
    path: `stories/${storyId}/reaction`,
    method: "POST",
    data: { reaction },
  });
}

export async function fetchStoryViewersRequest(storyId: number) {
  return bffRequest<{ ok: true } & StoryViewersResult>({
    path: `stories/${storyId}/viewers`,
    method: "GET",
  });
}

export async function sendStoryReplyRequest(input: {
  storyId: number;
  receiverId: number;
  messageContent: string;
}) {
  return bffRequest<{ ok: true }>({
    path: `stories/${input.storyId}/reply`,
    method: "POST",
    data: {
      receiverId: input.receiverId,
      messageContent: input.messageContent,
    },
  });
}

export async function deleteStoryRequest(storyId: number) {
  return bffRequest<{ ok: true }>({
    path: `stories/${storyId}/delete`,
    method: "POST",
    data: {},
  });
}
