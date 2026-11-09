"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  BellOff,
  MoreHorizontal,
  Pin,
  PinOff,
  Search,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/common/confirm-provider";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { ConversationsListSkeleton } from "@/components/states/list-row-skeleton";
import {
  chatErrorMessage,
  useConversationActions,
  useConversations,
  usePrefetchThread,
} from "@/features/chat/hooks/use-chat";
import { useChatRealtimeContext } from "@/features/chat/hooks/chat-realtime-context";
import type { ConversationSummary } from "@/features/chat/types/chat.types";
import { CONFIRM_DELETE_CONVERSATION } from "@/constants/confirm-copy";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { cn } from "@/lib/utils";

export function ConversationsScreen({
  selectedId = null,
}: {
  selectedId?: number | null;
}) {
  const realtime = useChatRealtimeContext();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    // One request per pause in typing, not per keystroke.
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);
  const [showArchived, setShowArchived] = useState(false);
  const query = useConversations({
    realtimeConnected: realtime.connected,
    search: debouncedSearch || undefined,
  });
  const actions = useConversationActions();
  const { confirm } = useConfirm();
  const conversations = query.data?.conversations ?? [];

  const visible = useMemo(() => {
    const filtered = conversations.filter((item) =>
      showArchived ? item.isArchived : !item.isArchived
    );
    return filtered.slice().sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [conversations, showArchived]);

  function runDestructiveAction(action: () => void) {
    void (async () => {
      const ok = await confirm(CONFIRM_DELETE_CONVERSATION);
      if (ok) action();
    })();
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-2 border-b border-border px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search messages"
            className="h-9 ps-8"
            aria-label="Search conversations"
          />
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={!showArchived ? "secondary" : "ghost"}
            className="h-7 px-2 text-xs"
            onClick={() => setShowArchived(false)}
          >
            Inbox
          </Button>
          <Button
            type="button"
            size="sm"
            variant={showArchived ? "secondary" : "ghost"}
            className="h-7 px-2 text-xs"
            onClick={() => setShowArchived(true)}
          >
            Archived
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {query.isLoading ? <ConversationsListSkeleton /> : null}

        {query.error ? (
          <ErrorState
            title="Messages unavailable"
            description={chatErrorMessage(query.error)}
            onRetry={() => void query.refetch()}
          />
        ) : null}

        {!query.isLoading && !query.error && visible.length === 0 ? (
          <EmptyState
            title={showArchived ? "No archived chats" : "No conversations yet"}
            description={
              showArchived
                ? "Archived conversations will appear here."
                : "Message a connection from Network to start a chat."
            }
            actionLabel={showArchived ? undefined : "Find people"}
            onAction={
              showArchived
                ? undefined
                : () => {
                    window.location.href = "/connections";
                  }
            }
          />
        ) : null}

        {!query.isLoading && !query.error && visible.length > 0 ? (
          <ul className="divide-y divide-border" aria-label="Conversations">
            {visible.map((item) => (
              <ConversationRow
                key={item.id}
                item={item}
                selected={selectedId != null && selectedId === item.id}
                online={
                  realtime.isUserOnline(item.otherUser.id) ||
                  item.otherUser.isOnline
                }
                typing={realtime.isPeerTyping(item.id)}
                onPin={() =>
                  actions.pin.mutate({
                    conversationId: item.id,
                    isPinned: !item.isPinned,
                  })
                }
                onMute={() =>
                  actions.mute.mutate({
                    conversationId: item.id,
                    isMuted: !item.isMuted,
                  })
                }
                onArchive={() =>
                  actions.archive.mutate({
                    conversationId: item.id,
                    isArchived: !item.isArchived,
                  })
                }
                onDelete={() =>
                  runDestructiveAction(() => actions.remove.mutate(item.id))
                }
              />
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function ConversationRow({
  item,
  selected,
  online,
  typing,
  onPin,
  onMute,
  onArchive,
  onDelete,
}: {
  item: ConversationSummary;
  selected: boolean;
  online: boolean;
  typing: boolean;
  onPin: () => void;
  onMute: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const unreadCount = selected ? 0 : item.unreadCount;
  const prefetchThread = usePrefetchThread();

  return (
    <li className="group relative">
      <Link
        href={`/messages/${item.id}`}
        onMouseEnter={() => prefetchThread(item.id)}
        onFocus={() => prefetchThread(item.id)}
        className={cn(
          "flex items-center gap-3 border-s-[3px] px-3 py-3 pe-10 transition-colors hover:bg-muted/50",
          selected ? "border-s-primary bg-primary/5" : "border-s-transparent",
          !selected && unreadCount > 0 && "bg-primary/5"
        )}
        aria-current={selected ? "page" : undefined}
      >
        <div className="relative shrink-0">
          <Avatar className="h-11 w-11">
            {item.otherUser.avatarUrl ? (
              <AvatarImage src={item.otherUser.avatarUrl} alt="" />
            ) : null}
            <AvatarPlaceholderFallback />
          </Avatar>
          {online ? (
            <span
              className="absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500"
              aria-label="Online"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn(
                "inline-flex min-w-0 items-center gap-1 truncate text-sm",
                unreadCount > 0 ? "font-semibold" : "font-medium"
              )}
            >
              {item.isPinned ? (
                <Pin className="h-3 w-3 shrink-0 text-primary" aria-hidden />
              ) : null}
              {item.isMuted ? (
                <BellOff
                  className="h-3 w-3 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              ) : null}
              <span className="truncate">{item.otherUser.name}</span>
            </p>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatRelativeTime(item.lastMessageAt)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn(
                "truncate text-sm",
                typing
                  ? "font-medium text-primary"
                  : "text-muted-foreground"
              )}
            >
              {typing ? "typing…" : item.lastMessage || "No messages yet"}
            </p>
            {unreadCount > 0 ? (
              <span
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground"
                aria-label={`${unreadCount} unread`}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="absolute end-2 top-1/2 z-10 -translate-y-1/2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              aria-label="Conversation actions"
              onClick={(event) => event.preventDefault()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={onPin}>
              {item.isPinned ? (
                <PinOff className="mr-2 h-4 w-4" />
              ) : (
                <Pin className="mr-2 h-4 w-4" />
              )}
              {item.isPinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onMute}>
              <BellOff className="mr-2 h-4 w-4" />
              {item.isMuted ? "Unmute" : "Mute"}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onArchive}>
              <Archive className="mr-2 h-4 w-4" />
              {item.isArchived ? "Unarchive" : "Archive"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={onDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}
