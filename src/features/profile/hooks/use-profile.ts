"use client";

import {
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import {
  fetchOwnProfileRequest,
  fetchProfileByIdRequest,
  fetchProfileByUsernameRequest,
  fetchProfilePostsRequest,
} from "@/features/profile/services/profile.client";
import { ApiError } from "@/lib/api/errors";

export const ownProfileQueryKey = ["profile", "me"] as const;

export function profileByIdQueryKey(socialProfileId: number) {
  return ["profile", "id", socialProfileId] as const;
}

export function profileByUsernameQueryKey(username: string) {
  return ["profile", "username", username.trim().toLowerCase()] as const;
}

export function profilePostsQueryKey(userProfileId: number) {
  return ["profile", "posts", userProfileId] as const;
}

export function useOwnProfile() {
  return useQuery({
    queryKey: ownProfileQueryKey,
    queryFn: ({ signal }) => fetchOwnProfileRequest(signal),
    select: (data) => data.profile,
  });
}

export function useProfileById(socialProfileId: number | null) {
  return useQuery({
    queryKey: profileByIdQueryKey(socialProfileId ?? 0),
    enabled: socialProfileId != null && socialProfileId > 0,
    queryFn: ({ signal }) => fetchProfileByIdRequest(socialProfileId!, signal),
    select: (data) => data.profile,
  });
}

export function useProfileByUsername(username: string | null) {
  const handle = username?.trim().replace(/^@/, "") || null;
  return useQuery({
    queryKey: profileByUsernameQueryKey(handle ?? ""),
    enabled: Boolean(handle),
    queryFn: ({ signal }) => fetchProfileByUsernameRequest(handle!, signal),
    select: (data) => data.profile,
  });
}

export function useProfilePosts(userProfileId: number | null) {
  return useInfiniteQuery({
    queryKey: profilePostsQueryKey(userProfileId ?? 0),
    enabled: userProfileId != null && userProfileId > 0,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      fetchProfilePostsRequest({
        userProfileId: userProfileId!,
        page: pageParam,
        signal,
      }),
    getNextPageParam: (last) =>
      last.hasNextPage ? last.page + 1 : undefined,
  });
}

export function profileErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "SESSION_EXPIRED") {
      return "Your session expired. Sign in again.";
    }
    return error.message;
  }
  return "Unable to load profile";
}
