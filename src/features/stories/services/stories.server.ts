import "server-only";

import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";
import {
  backendMessage,
  isBackendSuccess,
  mapStoriesFeed,
  mapStoryItem,
  mapStoryViewers,
} from "@/features/stories/lib/map-story";
import type {
  StoriesFeed,
  StoryItem,
  StoryViewersResult,
} from "@/features/stories/types/story.types";

export async function fetchStoriesFeed(): Promise<StoriesFeed> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/stories/feed",
    method: "GET",
    auth: true,
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load stories"),
      502
    );
  }
  return mapStoriesFeed(payload);
}

export async function createStoryMultipart(
  form: FormData
): Promise<StoryItem> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/stories",
    method: "POST",
    auth: true,
    isFormData: true,
    data: form,
    timeoutMs: 120_000,
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to create story"),
      502
    );
  }
  const root = payload as { data?: unknown };
  const story = mapStoryItem(root.data);
  if (!story) {
    throw new ApiError("SERVER", "Story created without media", 502);
  }
  return story;
}

export async function markStoryViewed(storyId: number): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: `/api/stories/${storyId}/view`,
    method: "POST",
    auth: true,
    data: {},
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to mark story viewed"),
      502
    );
  }
}

export async function reactToStory(
  storyId: number,
  reaction = "heart"
): Promise<{ reacted: boolean }> {
  const payload = await socialApiRequest<unknown>({
    path: `/api/stories/${storyId}/reaction`,
    method: "POST",
    auth: true,
    data: { reaction },
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to react to story"),
      502
    );
  }
  const data = (payload as { data?: { reacted?: boolean } }).data;
  return { reacted: data?.reacted === true };
}

export async function fetchStoryViewers(
  storyId: number,
  page = 1
): Promise<StoryViewersResult> {
  const payload = await socialApiRequest<unknown>({
    path: `/api/stories/${storyId}/viewers`,
    method: "GET",
    auth: true,
    params: { page, per_page: 50 },
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load story viewers"),
      502
    );
  }
  return mapStoryViewers(payload);
}

export async function deleteStory(storyId: number): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: `/api/stories/${storyId}`,
    method: "DELETE",
    auth: true,
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to delete story"),
      502
    );
  }
}
