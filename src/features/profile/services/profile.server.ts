import "server-only";

import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";
import {
  backendMessage,
  isBackendSuccess,
  mapSkillsList,
  mapSocialProfile,
} from "@/features/profile/lib/map-profile";
import type { SocialProfile } from "@/features/profile/types/profile.types";
import {
  backendMessage as feedBackendMessage,
  isBackendSuccess as isFeedSuccess,
  mapFeedPage,
} from "@/features/feed/lib/map-post";
import type { FeedPage } from "@/features/feed/types/post.types";
import { searchPeople } from "@/features/network/services/network.server";

async function resolveOwnSocialProfileId(): Promise<number | null> {
  try {
    const payload = await socialApiRequest<{
      status?: boolean;
      data?: { social_profile_id?: number | string | null };
    }>({
      path: "/api/social_profile/check",
      method: "GET",
      auth: true,
    });
    const raw = payload?.data?.social_profile_id;
    const id = typeof raw === "number" ? raw : Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export async function fetchOwnSocialProfile(): Promise<SocialProfile> {
  const [profilePayload, skillsPayload] = await Promise.all([
    socialApiRequest<unknown>({
      path: "/api/social_profile",
      method: "GET",
      auth: true,
    }),
    socialApiRequest<unknown>({
      path: "/api/skills",
      method: "GET",
      auth: true,
    }).catch(() => ({ status: true, data: [] })),
  ]);

  if (!isBackendSuccess(profilePayload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(profilePayload, "Unable to load profile"),
      502
    );
  }

  const skills = isBackendSuccess(skillsPayload)
    ? mapSkillsList(skillsPayload)
    : [];

  const profile = mapSocialProfile(profilePayload, { skills, isOwn: true });
  if (!profile) {
    throw new ApiError("NOT_FOUND", "Profile not found", 404);
  }
  return profile;
}

export async function fetchProfileById(
  socialProfileId: number
): Promise<SocialProfile> {
  if (!Number.isFinite(socialProfileId) || socialProfileId <= 0) {
    throw new ApiError("VALIDATION", "Invalid profile id", 400);
  }

  const [payload, ownId] = await Promise.all([
    socialApiRequest<unknown>({
      path: "/api/social_profile",
      method: "GET",
      auth: true,
      params: { social_profile_id: socialProfileId },
    }),
    resolveOwnSocialProfileId(),
  ]);

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load profile"),
      502
    );
  }

  const profile = mapSocialProfile(payload, {
    skills: [],
    isOwn: ownId != null && ownId === socialProfileId,
  });
  if (!profile) {
    throw new ApiError("NOT_FOUND", "Profile not found", 404);
  }
  return profile;
}

/** Resolve @handle → social profile id via account search (exact username). */
export async function resolveProfileIdByUsername(
  username: string
): Promise<number> {
  const handle = username.trim().replace(/^@/, "").toLowerCase();
  if (!handle || handle.length > 64) {
    throw new ApiError("VALIDATION", "Invalid username", 400);
  }

  // Numeric path segment — treat as social profile id (mobile deep-link style).
  if (/^\d+$/.test(handle)) {
    return Number(handle);
  }

  const people = await searchPeople({
    searchText: handle,
    page: 1,
    perPage: 20,
  });
  const exact = people.find(
    (person) => person.userName?.trim().toLowerCase() === handle
  );
  if (exact?.userId != null && exact.userId > 0) {
    return exact.userId;
  }

  throw new ApiError("NOT_FOUND", "Profile not found", 404);
}

export async function fetchProfileByUsername(
  username: string
): Promise<SocialProfile> {
  const id = await resolveProfileIdByUsername(username);
  return fetchProfileById(id);
}

export async function fetchUserPostsPage(input: {
  userProfileId: number;
  page: number;
  perPage?: number;
}): Promise<FeedPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/list",
    method: "POST",
    auth: true,
    data: {
      page: input.page,
      per_page: input.perPage ?? 20,
      user_profile_id: input.userProfileId,
      algorithm: "chronological",
    },
  });

  if (!isFeedSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      feedBackendMessage(payload, "Unable to load posts"),
      502
    );
  }

  return mapFeedPage(payload);
}
