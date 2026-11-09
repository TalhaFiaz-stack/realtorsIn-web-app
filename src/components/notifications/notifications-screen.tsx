"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  groupLabel,
  isMention,
  notificationHref,
  NotificationRow,
} from "@/components/notifications/notification-row";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { InlineLoader } from "@/components/states/inline-loader";
import { NotificationsListSkeleton } from "@/components/states/list-row-skeleton";
import { useNetworkActions } from "@/features/network/hooks/use-network";
import {
  notificationErrorMessage,
  useNotificationActions,
  useNotifications,
  useNotificationUnread,
} from "@/features/notifications/hooks/use-notifications";
import type { AppNotification } from "@/features/notifications/types/notification.types";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread" | "mentions";

/* ───────────────────────── screen ───────────────────────── */

export function NotificationsScreen() {
  const router = useRouter();
  const listQuery = useNotifications();
  const unreadQuery = useNotificationUnread();
  const { markRead, markAll, remove } = useNotificationActions();
  const network = useNetworkActions();
  const [filter, setFilter] = useState<Filter>("all");
  const [acceptedIds, setAcceptedIds] = useState<Set<number>>(new Set());
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const items = useMemo(
    () => listQuery.data?.pages.flatMap((page) => page.notifications) ?? [],
    [listQuery.data]
  );
  const unreadCount = unreadQuery.data?.unreadCount ?? items.filter((n) => !n.isRead).length;

  const visible = useMemo(() => {
    if (filter === "unread") return items.filter((n) => !n.isRead);
    if (filter === "mentions") return items.filter(isMention);
    return items;
  }, [items, filter]);

  const groups = useMemo(() => {
    const order = ["Today", "Yesterday", "This week", "Earlier"];
    const map = new Map<string, AppNotification[]>();
    for (const item of visible) {
      const label = groupLabel(item.createdAt);
      map.set(label, [...(map.get(label) ?? []), item]);
    }
    return order.filter((l) => map.has(l)).map((label) => ({ label, items: map.get(label)! }));
  }, [visible]);

  // Infinite scroll.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
          void listQuery.fetchNextPage();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [listQuery, visible.length]);

  function open(item: AppNotification) {
    if (!item.isRead) markRead.mutate(item.id);
    const href = notificationHref(item);
    if (href) router.push(href);
  }

  const tabs: Array<{ id: Filter; label: string; count?: number }> = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread", count: unreadCount },
    { id: "mentions", label: "Mentions" },
  ];

  return (
    <div className="space-y-3">
      <header className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bell className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">Notifications</h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0
                  ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
                  : "You're all caught up"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-full text-primary hover:bg-primary/10 hover:text-primary"
            disabled={markAll.isPending || unreadCount === 0}
            onClick={() => markAll.mutate()}
          >
            {markAll.isPending ? <InlineLoader /> : <CheckCheck className="h-4 w-4" aria-hidden />}
            <span className="hidden sm:inline">Mark all as read</span>
            <span className="sm:hidden">Read all</span>
          </Button>
        </div>

        <div role="tablist" aria-label="Filter notifications" className="mt-4 flex gap-2">
          {tabs.map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border text-foreground/80 hover:bg-muted"
                )}
              >
                {tab.label}
                {tab.count ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                      active ? "bg-white/25" : "bg-destructive text-destructive-foreground"
                    )}
                  >
                    {tab.count > 99 ? "99+" : tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </header>

      {listQuery.isLoading ? (
        <NotificationsListSkeleton />
      ) : listQuery.error ? (
        <ErrorState
          title="Notifications unavailable"
          description={notificationErrorMessage(listQuery.error)}
          onRetry={() => void listQuery.refetch()}
        />
      ) : visible.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-border bg-card shadow-sm">
          <EmptyState
            title={
              filter === "unread"
                ? "No unread notifications"
                : filter === "mentions"
                  ? "No mentions yet"
                  : "You're all caught up"
            }
            description={
              filter === "mentions"
                ? "When someone @mentions you in a post or comment, it shows up here."
                : "Likes, comments, events and connection updates will show here."
            }
            actionLabel={filter !== "all" ? "Show all" : undefined}
            onAction={filter !== "all" ? () => setFilter("all") : undefined}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm">
          {groups.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <h2 className="border-b border-border/70 bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h2>
              <ul className="divide-y divide-border/70">
                {group.items.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    onOpen={() => open(item)}
                    onMarkRead={() => markRead.mutate(item.id)}
                    onDelete={() => remove.mutate(item.id)}
                    deleting={remove.isPending && remove.variables === item.id}
                    accepted={acceptedIds.has(item.id)}
                    accepting={network.isPending && network.variables?.connectionId === item.connectionId}
                    onAccept={
                      item.canAcceptConnection && item.connectionId
                        ? () =>
                            network.mutate(
                              { action: "accept", connectionId: item.connectionId! },
                              {
                                onSuccess: () => {
                                  setAcceptedIds((prev) => new Set(prev).add(item.id));
                                  if (!item.isRead) markRead.mutate(item.id);
                                },
                              }
                            )
                        : undefined
                    }
                  />
                ))}
              </ul>
            </section>
          ))}
          <div ref={sentinelRef} aria-hidden className="h-1" />
          {listQuery.isFetchingNextPage ? (
            <div className="flex justify-center border-t border-border/70 py-4">
              <InlineLoader className="text-primary" />
            </div>
          ) : null}
        </div>
      )}

      {markAll.error || markRead.error || remove.error ? (
        <p className="px-1 text-sm text-destructive" role="alert">
          {notificationErrorMessage(markAll.error || markRead.error || remove.error)}
        </p>
      ) : null}
    </div>
  );
}

