"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  deleteNotificationRequest,
  fetchNotifications,
  fetchNotificationUnread,
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
} from "@/features/notifications/services/notifications.client";
import { ApiError } from "@/lib/api/errors";
import { normalizeNavBadgeCount } from "@/lib/navigation/nav-badge";

function canPoll() {
  if (typeof document === "undefined") return true;
  if (document.visibilityState === "hidden") return false;
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return false;
  }
  return true;
}

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: ["notifications", "list"],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => fetchNotifications(pageParam, signal),
    getNextPageParam: (last) =>
      last.hasNextPage ? last.page + 1 : undefined,
  });
}

export function useNotificationUnread() {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async ({ signal }) => {
      const result = await fetchNotificationUnread(signal);
      return {
        ...result,
        unreadCount: normalizeNavBadgeCount(result.unreadCount),
      };
    },
    refetchInterval: () => (canPoll() ? 30_000 : false),
    refetchIntervalInBackground: false,
  });
}

function patchNotificationUnreadCache(
  queryClient: QueryClient,
  unreadCount: unknown
) {
  queryClient.setQueryData(["notifications", "unread"], {
    ok: true as const,
    unreadCount: normalizeNavBadgeCount(unreadCount),
  });
}

export function useNotificationActions() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markRead = useMutation({
    mutationFn: markNotificationReadRequest,
    onSuccess: (data) => {
      patchNotificationUnreadCache(queryClient, data.unreadCount);
      invalidate();
    },
  });
  const markAll = useMutation({
    mutationFn: markAllNotificationsReadRequest,
    onSuccess: (data) => {
      patchNotificationUnreadCache(queryClient, data.unreadCount);
      invalidate();
    },
  });
  const remove = useMutation({
    mutationFn: deleteNotificationRequest,
    onSuccess: (data) => {
      patchNotificationUnreadCache(queryClient, data.unreadCount);
      invalidate();
    },
  });

  return { markRead, markAll, remove };
}

export function notificationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
