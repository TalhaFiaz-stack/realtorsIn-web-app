"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, BellOff, CheckCheck, MoreHorizontal, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ShellNavButton } from "@/components/layout/shell-nav-link";
import {
  NotificationAvatar,
  notificationHref,
  NotificationText,
} from "@/components/notifications/notification-row";
import { InlineLoader } from "@/components/states/inline-loader";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useNotificationActions,
  useNotifications,
  useNotificationUnread,
} from "@/features/notifications/hooks/use-notifications";
import type { AppNotification } from "@/features/notifications/types/notification.types";
import { cn } from "@/lib/utils";

const MAX_ITEMS = 12;
const NEW_WINDOW_MS = 3 * 86_400_000;

/**
 * Header bell → Facebook/LinkedIn-style popup with the latest notifications.
 * "See all" opens the full /notifications page.
 */
export function NotificationsPopover({
  label,
  icon,
  badge,
}: {
  label: string;
  icon: LucideIcon;
  badge?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const onPage = pathname === "/notifications" || pathname.startsWith("/notifications/");

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <ShellNavButton label={label} icon={icon} badge={badge} active={onPage} open={open} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        collisionPadding={12}
        className="flex max-h-[min(78dvh,40rem)] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl p-0 shadow-xl"
      >
        {open ? (
          <PopoverBody
            filter={filter}
            onFilter={setFilter}
            onNavigate={(href) => {
              setOpen(false);
              router.push(href);
            }}
          />
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PopoverBody({
  filter,
  onFilter,
  onNavigate,
}: {
  filter: "all" | "unread";
  onFilter: (f: "all" | "unread") => void;
  onNavigate: (href: string) => void;
}) {
  const listQuery = useNotifications();
  const unreadQuery = useNotificationUnread();
  const { markRead, markAll } = useNotificationActions();

  const items = useMemo(
    () => listQuery.data?.pages.flatMap((page) => page.notifications) ?? [],
    [listQuery.data]
  );
  const unreadCount = unreadQuery.data?.unreadCount ?? items.filter((n) => !n.isRead).length;
  const visible = (filter === "unread" ? items.filter((n) => !n.isRead) : items).slice(0, MAX_ITEMS);

  const { fresh, earlier } = useMemo(() => {
    const cutoff = Date.now() - NEW_WINDOW_MS;
    const freshList: AppNotification[] = [];
    const earlierList: AppNotification[] = [];
    for (const item of visible) {
      const t = item.createdAt ? new Date(item.createdAt).getTime() : 0;
      if (!item.isRead || t >= cutoff) freshList.push(item);
      else earlierList.push(item);
    }
    return { fresh: freshList, earlier: earlierList };
  }, [visible]);

  function open(item: AppNotification) {
    if (!item.isRead) markRead.mutate(item.id);
    onNavigate(notificationHref(item) ?? "/notifications");
  }

  return (
    <>
      <div className="shrink-0 px-4 pb-2 pt-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Notifications</h2>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Notification options"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                disabled={unreadCount === 0 || markAll.isPending}
                onSelect={() => markAll.mutate()}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all as read
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onNavigate("/settings/notifications")}>
                <Settings className="mr-2 h-4 w-4" />
                Notification settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onNavigate("/notifications")}>
                <Bell className="mr-2 h-4 w-4" />
                Open notifications page
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div role="tablist" aria-label="Filter notifications" className="mt-2 flex gap-1.5">
          {(["all", "unread"] as const).map((id) => {
            const active = filter === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onFilter(id)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted"
                )}
              >
                {id === "all" ? "All" : "Unread"}
                {id === "unread" && unreadCount > 0 ? (
                  <span className="rounded-full bg-destructive px-1.5 text-[11px] font-semibold tabular-nums text-destructive-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-2">
        {listQuery.isLoading ? (
          <div className="space-y-1 p-2" aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="h-11 w-11 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-11/12" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : listQuery.isError ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            Couldn’t load notifications.{" "}
            <button
              type="button"
              className="font-semibold text-primary hover:underline"
              onClick={() => void listQuery.refetch()}
            >
              Retry
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <BellOff className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-foreground">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              Likes, comments, events and connection updates will show here.
            </p>
          </div>
        ) : (
          <>
            <Section title="New" items={fresh} onOpen={open} onNavigate={onNavigate} seeAll />
            <Section title="Earlier" items={earlier} onOpen={open} onNavigate={onNavigate} />
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-border/70 p-1.5">
        <Link
          href="/notifications"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("/notifications");
          }}
          className="flex h-10 items-center justify-center rounded-xl text-sm font-semibold text-primary hover:bg-muted"
        >
          {markAll.isPending ? <InlineLoader className="text-primary" /> : "See all notifications"}
        </Link>
      </div>
    </>
  );
}

function Section({
    title,
    items: sectionItems,
    onOpen,
    onNavigate,
    seeAll,
  }: {
    title: string;
    items: AppNotification[];
    onOpen: (item: AppNotification) => void;
    onNavigate: (href: string) => void;
    seeAll?: boolean;
  }) {
    if (sectionItems.length === 0) return null;
    return (
      <section aria-label={title}>
        <div className="flex items-center justify-between px-2 pb-1 pt-2">
          <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
          {seeAll ? (
            <Link
              href="/notifications"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("/notifications");
              }}
              className="rounded-md px-1.5 py-0.5 text-sm font-medium text-primary hover:bg-primary/10"
            >
              See all
            </Link>
          ) : null}
        </div>
        {sectionItems.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onSelect={() => onOpen(item)}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2 focus:bg-muted",
              !item.isRead && "bg-primary/[0.04]"
            )}
          >
            <NotificationAvatar item={item} size="sm" />
            <NotificationText item={item} clamp={3} />
            {!item.isRead ? (
              <span className="mt-4 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </section>
    );
  }
