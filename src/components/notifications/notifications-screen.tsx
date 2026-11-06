"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { InlineLoader } from "@/components/states/inline-loader";
import { NotificationsListSkeleton } from "@/components/states/list-row-skeleton";
import {
  notificationErrorMessage,
  useNotificationActions,
  useNotifications,
  useNotificationUnread,
} from "@/features/notifications/hooks/use-notifications";
import type { AppNotification } from "@/features/notifications/types/notification.types";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { cn } from "@/lib/utils";

function notificationHref(item: AppNotification): string | null {
  if (item.type === "message" && item.conversationId) {
    return `/messages/${item.conversationId}`;
  }
  if (item.postId) return `/posts/${item.postId}`;
  if (item.connectionId || item.canAcceptConnection) return "/connections";
  return null;
}

export function NotificationsScreen() {
  const listQuery = useNotifications();
  const unreadQuery = useNotificationUnread();
  const { markRead, markAll, remove } = useNotificationActions();

  const items = useMemo(
    () => listQuery.data?.pages.flatMap((page) => page.notifications) ?? [],
    [listQuery.data]
  );
  const unreadCount =
    unreadQuery.data?.unreadCount ?? items.filter((n) => !n.isRead).length;

  if (listQuery.isLoading) return <NotificationsListSkeleton />;

  if (listQuery.error) {
    return (
      <ErrorState
        title="Notifications unavailable"
        description={notificationErrorMessage(listQuery.error)}
        onRetry={() => void listQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
        <Button
          variant="outline"
          size="sm"
          disabled={markAll.isPending || unreadCount === 0}
          onClick={() => markAll.mutate()}
        >
          Mark all read
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="You are all caught up"
          description="Likes, comments, and connection updates will show here."
        />
      ) : (
        <ul className="divide-y divide-border" aria-label="Notifications">
          {items.map((item) => {
            const href = notificationHref(item);
            const body = (
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <Avatar className="h-10 w-10">
                  {item.avatarUrl ? (
                    <AvatarImage src={item.avatarUrl} alt="" />
                  ) : null}
                  <AvatarPlaceholderFallback />
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">
                      {item.fullName || item.userName || "Someone"}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {item.actionText || item.type}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(item.createdAt)}
                  </p>
                </div>
              </div>
            );

            return (
              <li
                key={item.id}
                className={cn(
                  "flex items-start gap-2 px-1 py-3",
                  !item.isRead && "bg-primary/5"
                )}
              >
                {href ? (
                  <Link
                    href={href}
                    className="min-w-0 flex-1"
                    onClick={() => {
                      if (!item.isRead) markRead.mutate(item.id);
                    }}
                  >
                    {body}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="locale-text min-w-0 flex-1 text-start"
                    onClick={() => {
                      if (!item.isRead) markRead.mutate(item.id);
                    }}
                  >
                    {body}
                  </button>
                )}
                <div className="flex shrink-0 flex-col gap-1">
                  {!item.isRead ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={markRead.isPending}
                      onClick={() => markRead.mutate(item.id)}
                    >
                      Read
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {listQuery.hasNextPage ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            disabled={listQuery.isFetchingNextPage}
            onClick={() => void listQuery.fetchNextPage()}
          >
            {listQuery.isFetchingNextPage ? (
              <InlineLoader className="text-primary" />
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      ) : null}

      {markAll.error || markRead.error || remove.error ? (
        <p className="text-sm text-destructive" role="alert">
          {notificationErrorMessage(
            markAll.error || markRead.error || remove.error
          )}
        </p>
      ) : null}
    </div>
  );
}
