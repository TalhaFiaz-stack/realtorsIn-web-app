"use client";

import {
  AtSign,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCheck,
  Heart,
  Megaphone,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  ShieldCheck,
  Trash2,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InlineLoader } from "@/components/states/inline-loader";
import type { AppNotification } from "@/features/notifications/types/notification.types";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { resolvePushPath } from "@/lib/push/resolve-push-path";
import { cn } from "@/lib/utils";

/* ───────────────────────── routing & presentation ───────────────────────── */

export function notificationHref(item: AppNotification): string | null {
  if (item.type === "message" && item.conversationId) return `/messages/${item.conversationId}`;
  // Same rules as tapping a push notification (events, stories, campaigns…).
  const path = resolvePushPath(item.routing);
  if (path && path !== "/notifications") return path;
  if (item.postId) return `/posts/${item.postId}`;
  if (item.connectionId || item.canAcceptConnection) return "/connections";
  return null;
}

export type Kind = { icon: LucideIcon; tone: string };

export function notificationKind(item: AppNotification): Kind {
  const t = item.type.toLowerCase();
  const text = (item.actionText ?? "").toLowerCase();
  if (t.includes("mention") || text.includes("mentioned")) return { icon: AtSign, tone: "bg-violet-500" };
  if (t.includes("story")) return { icon: BookOpen, tone: "bg-pink-500" };
  if (t === "like" || t.includes("reaction") || text.includes("liked") || text.includes("reacted"))
    return { icon: Heart, tone: "bg-rose-500" };
  if (t.includes("comment") || text.includes("commented")) return { icon: MessageCircle, tone: "bg-sky-500" };
  if (t.includes("repost") || text.includes("reposted")) return { icon: Repeat2, tone: "bg-emerald-500" };
  if (t.includes("connection") || t === "follow" || text.includes("connection")) return { icon: UserPlus, tone: "bg-primary" };
  if (t.startsWith("event") || text.includes("event") || text.includes("invited you")) return { icon: CalendarDays, tone: "bg-amber-500" };
  if (t.includes("broker") || t.includes("verification")) return { icon: ShieldCheck, tone: "bg-teal-500" };
  if (t === "message") return { icon: MessageCircle, tone: "bg-indigo-500" };
  if (t.includes("campaign") || t === "view_content" || t === "unknown") return { icon: Megaphone, tone: "bg-orange-500" };
  return { icon: Bell, tone: "bg-slate-500" };
}

export function isMention(item: AppNotification) {
  return item.type.toLowerCase().includes("mention") || (item.actionText ?? "").toLowerCase().includes("mentioned");
}

export function actionLine(item: AppNotification): string {
  const text = item.actionText?.trim();
  if (text && text.toLowerCase() !== "unknown") return text;
  const t = item.type.replace(/_/g, " ").trim();
  return t && t !== "unknown" ? t : "sent you an update";
}

export function groupLabel(createdAt: string | null): string {
  if (!createdAt) return "Earlier";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Earlier";
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const t = date.getTime();
  if (t >= startOfToday) return "Today";
  if (t >= startOfToday - 86_400_000) return "Yesterday";
  if (t >= startOfToday - 6 * 86_400_000) return "This week";
  return "Earlier";
}

/** Avatar with the small coloured type badge (like / comment / event…). */
export function NotificationAvatar({ item, size = "md" }: { item: AppNotification; size?: "sm" | "md" }) {
  const kind = notificationKind(item);
  return (
    <span className="relative shrink-0">
      <Avatar className={size === "sm" ? "h-11 w-11" : "h-12 w-12"}>
        {item.avatarUrl ? <AvatarImage src={item.avatarUrl} alt="" /> : null}
        <AvatarPlaceholderFallback />
      </Avatar>
      <span
        className={cn(
          "absolute -bottom-0.5 -end-0.5 flex h-5 w-5 items-center justify-center rounded-full text-white ring-2 ring-card",
          kind.tone
        )}
        aria-hidden
      >
        <kind.icon className="h-3 w-3" />
      </span>
    </span>
  );
}

/** "Name did something" + time; shared by the page row and the header popup. */
export function NotificationText({ item, clamp = 3 }: { item: AppNotification; clamp?: 2 | 3 }) {
  const name = item.fullName || item.userName || "RealtorsIn";
  return (
    <span className="min-w-0 flex-1 pt-0.5">
      <span
        className={cn(
          "text-sm leading-snug",
          clamp === 2 ? "line-clamp-2" : "line-clamp-3",
          item.isRead ? "text-foreground/80" : "text-foreground"
        )}
      >
        <span className="font-semibold text-foreground">{name}</span> {actionLine(item)}
      </span>
      <span className={cn("mt-1 block text-xs", item.isRead ? "text-muted-foreground" : "font-semibold text-primary")}>
        {formatRelativeTime(item.createdAt)}
      </span>
    </span>
  );
}

export function NotificationRow({
  item,
  onOpen,
  onMarkRead,
  onDelete,
  deleting,
  onAccept,
  accepting,
  accepted,
}: {
  item: AppNotification;
  onOpen: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
  deleting?: boolean;
  onAccept?: () => void;
  accepting?: boolean;
  accepted?: boolean;
}) {
  return (
    <li
      className={cn(
        "group relative flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40",
        !item.isRead && "bg-primary/[0.06]",
        deleting && "pointer-events-none opacity-50"
      )}
    >
      {!item.isRead ? (
        <span className="absolute inset-y-0 start-0 w-[3px] bg-primary" aria-hidden />
      ) : null}

      <button
        type="button"
        onClick={onOpen}
        className="locale-text flex min-w-0 flex-1 items-start gap-3 text-start focus-visible:outline-none"
      >
        <NotificationAvatar item={item} />
        <NotificationText item={item} />
      </button>

      {onAccept && !accepted ? (
        <Button
          size="sm"
          className="mt-1.5 h-8 shrink-0 rounded-full px-3.5"
          disabled={accepting}
          onClick={onAccept}
        >
          {accepting ? <InlineLoader /> : <Check className="h-4 w-4" aria-hidden />}
          Accept
        </Button>
      ) : accepted ? (
        <span className="mt-2 inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <Check className="h-3.5 w-3.5" aria-hidden />
          Connected
        </span>
      ) : null}

      <div className="flex shrink-0 items-center gap-1 pt-1">
        {!item.isRead ? <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-label="Unread" /> : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground opacity-100 data-[state=open]:bg-muted sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 sm:data-[state=open]:opacity-100"
              aria-label="Notification options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {!item.isRead ? (
              <DropdownMenuItem onSelect={onMarkRead}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark as read
              </DropdownMenuItem>
            ) : null}
            {!item.isRead ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete notification
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}
