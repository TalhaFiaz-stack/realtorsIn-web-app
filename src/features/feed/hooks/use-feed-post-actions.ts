"use client";

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { profilePostsQueryKey } from "@/features/profile/hooks/use-profile";
import {
  deletePostRequest,
  deleteRepostRequest,
  hidePostRequest,
  notInterestedRequest,
  pinPostRequest,
  storeRepostRequest,
} from "@/features/feed/services/posts.client";
import { feedHomePrefix } from "@/features/feed/hooks/use-feed";
import { postDetailKey } from "@/features/feed/hooks/use-post-detail";
import type { FeedInfiniteData } from "@/features/feed/lib/feed-optimistic";
import type { FeedPage, FeedPost } from "@/features/feed/types/post.types";
import { showAppToast } from "@/lib/toast/app-toast";

function removePostFromFeeds(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: number
) {
  queryClient.setQueriesData<FeedInfiniteData>(
    { queryKey: feedHomePrefix },
    (current) => {
      if (!current?.pages) return current;
      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          posts: page.posts.filter((post) => post.id !== postId),
        })),
      };
    }
  );
}

function patchPostInFeeds(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: number,
  updater: (post: FeedPost) => FeedPost
) {
  queryClient.setQueriesData<FeedInfiniteData>(
    { queryKey: feedHomePrefix },
    (current) => {
      if (!current?.pages) return current;
      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          posts: page.posts.map((post) =>
            post.id === postId ? updater(post) : post
          ),
        })),
      };
    }
  );
}

function patchPostInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: number,
  updater: (post: FeedPost) => FeedPost
) {
  patchPostInFeeds(queryClient, postId, updater);
  queryClient.setQueryData<FeedPost>(postDetailKey(postId), (current) =>
    current ? updater(current) : current
  );
}

function reorderPinnedFirst(posts: FeedPost[]): FeedPost[] {
  const pinned = posts.filter((post) => post.isPinned);
  const rest = posts.filter((post) => !post.isPinned);
  return [...pinned, ...rest];
}

function patchProfilePostsPin(
  queryClient: ReturnType<typeof useQueryClient>,
  userProfileId: number,
  postId: number,
  pinned: boolean
) {
  queryClient.setQueryData<InfiniteData<FeedPage>>(
    profilePostsQueryKey(userProfileId),
    (current) => {
      if (!current?.pages?.length) return current;
      return {
        ...current,
        pages: current.pages.map((page, pageIndex) => {
          const posts = page.posts.map((post) =>
            post.id === postId ? { ...post, isPinned: pinned } : post
          );
          return {
            ...page,
            posts: pageIndex === 0 ? reorderPinnedFirst(posts) : posts,
          };
        }),
      };
    }
  );
}

export function useHidePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => hidePostRequest(postId),
    onSuccess: (_r, postId) => {
      removePostFromFeeds(queryClient, postId);
      showAppToast.success("Post hidden");
    },
    onError: (error) => showAppToast.fromError(error, "Could not hide post"),
  });
}

export function useNotInterested() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => notInterestedRequest(postId),
    onSuccess: (_r, postId) => {
      removePostFromFeeds(queryClient, postId);
      showAppToast.success("We’ll show fewer posts like this");
    },
    onError: (error) =>
      showAppToast.fromError(error, "Could not update preferences"),
  });
}

export function useStoreRepost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { postId: number; repostText?: string }) =>
      storeRepostRequest(input),
    onSuccess: (result, input) => {
      patchPostInCache(queryClient, input.postId, (post) => ({
        ...post,
        isReposted: true,
      }));
      void queryClient.invalidateQueries({ queryKey: feedHomePrefix });
      showAppToast.success(
        "Success",
        result.message ?? "Post reposted successfully"
      );
    },
    onError: (error) => showAppToast.fromError(error, "Could not repost"),
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => deletePostRequest(postId),
    onSuccess: (_r, postId) => {
      removePostFromFeeds(queryClient, postId);
      showAppToast.success("Post deleted");
    },
    onError: (error) => showAppToast.fromError(error, "Could not delete post"),
  });
}

export function useDeleteRepost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => deleteRepostRequest(postId),
    onSuccess: (result, postId) => {
      patchPostInCache(queryClient, postId, (post) => ({
        ...post,
        isReposted: false,
      }));
      void queryClient.invalidateQueries({ queryKey: feedHomePrefix });
      showAppToast.success(
        "Success",
        result.message ?? "Repost removed successfully"
      );
    },
    onError: (error) =>
      showAppToast.fromError(error, "Could not undo repost"),
  });
}

export type PinPostVariables = {
  postId: number;
  pinned: boolean;
  /** When pinning from `/me` posts tab, reorder profile list like mobile. */
  profileUserId?: number;
};

export function usePinPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PinPostVariables) =>
      pinPostRequest({ postId: input.postId, pinned: input.pinned }),
    onSuccess: (_r, input) => {
      patchPostInCache(queryClient, input.postId, (post) => ({
        ...post,
        isPinned: input.pinned,
      }));
      if (input.profileUserId != null) {
        patchProfilePostsPin(
          queryClient,
          input.profileUserId,
          input.postId,
          input.pinned
        );
      }
      showAppToast.success(input.pinned ? "Post pinned" : "Post unpinned");
    },
    onError: (error) => showAppToast.fromError(error, "Could not update pin"),
  });
}
