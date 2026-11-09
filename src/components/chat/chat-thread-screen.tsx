"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  createOptimisticChatMessage,
  isOptimisticMessageId,
} from "@/features/chat/lib/create-optimistic-message";
import { useChatThreadScroll } from "@/features/chat/hooks/use-chat-thread-scroll";
import { usePendingChatAttachment } from "@/features/chat/hooks/use-pending-chat-attachment";
import { useTranslation } from "react-i18next";
import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { AlertCircle, ArrowDown, Loader2, Paperclip, RotateCw, Send, X } from "lucide-react";
import { ChatMediaComposerPreview } from "@/components/chat/chat-media-composer-preview";
import { MessageBubble } from "@/components/chat/message-bubble";
import type { ChatMessageActions } from "@/components/chat/message-actions";
import { ChatBlockControl } from "@/components/chat/chat-block-control";
import { PostCommentsDialog } from "@/components/feed/post-comments-dialog";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversationPeerFromCache } from "@/features/chat/hooks/use-conversation-peer-from-cache";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { InlineLoader } from "@/components/states/inline-loader";
import {
  chatErrorMessage,
  useEmitTyping,
  useJoinConversationRoom,
  useMarkConversationRead,
  useMessageActions,
  useBlockActions,
  useBlockedUsers,
  useMessages,
  useSendChatMedia,
  useSendMessage,
} from "@/features/chat/hooks/use-chat";
import { useChatRealtimeContext } from "@/features/chat/hooks/chat-realtime-context";
import { chatDayLabel, isSameChatDay } from "@/features/chat/lib/chat-day-label";
import type { ChatMessage } from "@/features/chat/types/chat.types";
import { cn } from "@/lib/utils";

type OutboxItem = { message: ChatMessage; status: "sending" | "failed" };

const COMPOSER_MAX_HEIGHT_PX = 140;

export function ChatThreadScreen({
  conversationId,
  embedded = false,
}: {
  conversationId: number;
  /** Split-pane messaging: fill parent height, back only on small screens. */
  embedded?: boolean;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState("");
  const [attachError, setAttachError] = useState<string | null>(null);
  const [previewPostId, setPreviewPostId] = useState<number | null>(null);
  const [outbox, setOutbox] = useState<OutboxItem[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const {
    attachment: pendingAttachment,
    pickFiles,
    clearAttachment,
  } = usePendingChatAttachment(conversationId);

  const markRead = useMarkConversationRead();
  const realtime = useChatRealtimeContext();
  const typing = useEmitTyping(conversationId);
  useJoinConversationRoom(conversationId);

  const messagesQuery = useMessages(conversationId, {
    realtimeConnected: realtime.connected,
  });
  const cachedPeer = useConversationPeerFromCache(conversationId);
  const pages = messagesQuery.data?.pages;
  const otherUser = pages?.[0]?.otherUser ?? cachedPeer;
  const threadLoading =
    messagesQuery.isPending && messagesQuery.fetchStatus === "fetching";
  const messages = useMemo(
    () => (pages ? [...pages].reverse().flatMap((page) => page.messages) : []),
    [pages]
  );

  const displayMessages = useMemo(() => {
    if (outbox.length === 0) return messages;
    const serverIds = new Set(messages.map((m) => m.id));
    const pending = outbox
      .map((item) => item.message)
      .filter((m) => !serverIds.has(m.id));
    return pending.length ? [...messages, ...pending] : messages;
  }, [messages, outbox]);
  const failedIds = useMemo(
    () => new Set(outbox.filter((o) => o.status === "failed").map((o) => o.message.id)),
    [outbox]
  );

  const peerOnline =
    otherUser != null &&
    (realtime.isUserOnline(otherUser.id) || otherUser.isOnline);
  const peerTyping = realtime.isPeerTyping(conversationId);

  const tailKey = useMemo(() => {
    const last = displayMessages.at(-1);
    return `${last?.id ?? "empty"}:${displayMessages.length}:${peerTyping ? 1 : 0}`;
  }, [displayMessages, peerTyping]);

  const { fetchNextPage } = messagesQuery;
  const loadOlder = useCallback(() => fetchNextPage(), [fetchNextPage]);
  const { scrollerRef, contentRef, onScroll, scrollToBottom, atBottom } =
    useChatThreadScroll({
      conversationId,
      tailKey,
      ready: Boolean(messagesQuery.data),
      canLoadOlder: Boolean(messagesQuery.hasNextPage),
      loadingOlder: messagesQuery.isFetchingNextPage,
      loadOlder,
      pageCount: pages?.length ?? 0,
    });

  // Only animate messages that arrive after the thread opened.
  const seenIdsRef = useRef<{ conversationId: number; ids: Set<number> } | null>(null);
  if (messagesQuery.data && seenIdsRef.current?.conversationId !== conversationId) {
    seenIdsRef.current = {
      conversationId,
      ids: new Set(messages.map((m) => m.id)),
    };
  }

  // "Jump to latest" counter: incoming messages while scrolled up.
  const [unseenCount, setUnseenCount] = useState(0);
  const lastTailIdRef = useRef<number | null>(null);
  useEffect(() => {
    const last = displayMessages.at(-1);
    if (!last) return;
    const previous = lastTailIdRef.current;
    lastTailIdRef.current = last.id;
    if (previous == null || previous === last.id) return;
    if (!atBottom && !last.isOwn) setUnseenCount((n) => n + 1);
  }, [displayMessages, atBottom]);
  useEffect(() => {
    if (atBottom) setUnseenCount(0);
  }, [atBottom]);

  const sendMutation = useSendMessage(conversationId);
  const messageActions = useMessageActions(conversationId);
  const blockedQuery = useBlockedUsers();
  const { unblock } = useBlockActions();
  const peerBlocked =
    otherUser != null &&
    (blockedQuery.data ?? []).some((u) => u.userId === otherUser.id);
  const bubbleActions = useMemo<ChatMessageActions>(
    () => ({
      onEdit: (m, content) =>
        messageActions.edit.mutateAsync({ messageId: m.id, content }),
      onReact: (m, emoji) =>
        messageActions.react.mutateAsync({ messageId: m.id, emoji }),
      onDelete: (m, forEveryone) =>
        messageActions.remove.mutateAsync({
          messageId: m.id,
          deleteForEveryone: forEveryone,
        }),
    }),
    [messageActions.edit, messageActions.react, messageActions.remove]
  );
  const media = useSendChatMedia(conversationId);
  // Only attachments block the composer; text sends run concurrently.
  const mediaBusy = media.sendImage.isPending || media.sendDocument.isPending;

  useEffect(() => {
    markRead.mutate(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once
  }, [conversationId]);

  // Messages that arrive while this chat is open are read: tell the server
  // (otherwise the unread badge comes back and the sender never sees ✓✓).
  const lastIncomingId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (!messages[i].isOwn) return messages[i].id;
    }
    return null;
  }, [messages]);
  const readUpToRef = useRef<number | null>(null);
  useEffect(() => {
    if (lastIncomingId == null) return;
    if (readUpToRef.current == null) {
      readUpToRef.current = lastIncomingId; // already covered by the open-time mark
      return;
    }
    if (readUpToRef.current === lastIncomingId) return;
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    readUpToRef.current = lastIncomingId;
    const timer = window.setTimeout(() => markRead.mutate(conversationId), 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- markRead is stable enough
  }, [lastIncomingId, conversationId]);

  useEffect(() => {
    setOutbox([]);
    setUnseenCount(0);
    lastTailIdRef.current = null;
    readUpToRef.current = null;
  }, [conversationId]);

  // Auto-grow the composer.
  useLayoutEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, COMPOSER_MAX_HEIGHT_PX)}px`;
  }, [draft]);

  async function sendPendingAttachment(caption: string) {
    if (!pendingAttachment || !otherUser?.id || mediaBusy) return;
    setAttachError(null);
    typing.stop();
    const captionTrimmed = caption.trim();
    setDraft("");

    try {
      if (pendingAttachment.kind === "images") {
        await media.sendImage.mutateAsync({
          receiverId: otherUser.id,
          files: pendingAttachment.files,
          caption: captionTrimmed || undefined,
        });
      } else {
        for (const doc of pendingAttachment.files) {
          await media.sendDocument.mutateAsync({
            receiverId: otherUser.id,
            file: doc,
            caption: captionTrimmed || undefined,
          });
        }
      }
      clearAttachment();
      scrollToBottom("smooth", true);
    } catch (err) {
      setAttachError(chatErrorMessage(err));
      setDraft(captionTrimmed);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function deliver(optimistic: ChatMessage) {
    if (!otherUser?.id) return;
    setOutbox((prev) => {
      const without = prev.filter((o) => o.message.id !== optimistic.id);
      return [...without, { message: optimistic, status: "sending" }];
    });
    try {
      await sendMutation.mutateAsync({
        receiverId: otherUser.id,
        messageContent: optimistic.content,
        optimistic,
      });
      // The real message is already in the thread cache — drop the placeholder.
      setOutbox((prev) => prev.filter((o) => o.message.id !== optimistic.id));
    } catch {
      setOutbox((prev) =>
        prev.map((o) =>
          o.message.id === optimistic.id ? { ...o, status: "failed" } : o
        )
      );
    }
  }

  function sendText() {
    if (!otherUser?.id) return;
    const content = draft.trim();
    if (!content) return;
    typing.stop();
    setDraft("");
    const optimistic = createOptimisticChatMessage({
      tempId: -(Date.now() + Math.floor(Math.random() * 1000)),
      conversationId,
      receiverId: otherUser.id,
      content,
    });
    scrollToBottom("smooth", true);
    void deliver(optimistic);
    composerRef.current?.focus();
  }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!otherUser?.id) return;
    if (pendingAttachment) {
      await sendPendingAttachment(draft);
      return;
    }
    sendText();
  }

  function onPickFiles(fileList: FileList | null) {
    if (!fileList?.length || mediaBusy) return;
    setAttachError(null);
    pickFiles(fileList);
    if (fileRef.current) fileRef.current.value = "";
    composerRef.current?.focus();
  }

  const canSend =
    Boolean(otherUser) &&
    (pendingAttachment ? !mediaBusy : Boolean(draft.trim()));

  const shellClass = embedded
    ? "flex min-h-0 flex-1 flex-col overflow-hidden"
    : "mx-auto flex h-[calc(100dvh-8rem)] max-w-2xl flex-col overflow-hidden";

  if (threadLoading && !messagesQuery.data) {
    const statusLine = peerOnline
      ? "Online"
      : realtime.connected
        ? "Offline"
        : realtime.error || "Connecting…";

    return (
      <div className={shellClass} aria-busy aria-label="Loading chat">
        <header className="locale-chat-thread-header flex shrink-0 items-center gap-3 border-b border-border px-3 py-3">
          <ShellBackLink
            href="/messages"
            label={t("Messages")}
            className={
              embedded ? "md:hidden shrink-0 py-1 ps-1 pe-3 text-xs" : "shrink-0"
            }
          />
          <div className="relative shrink-0">
            <Avatar className="h-9 w-9">
              {otherUser?.avatarUrl ? (
                <AvatarImage src={otherUser.avatarUrl} alt="" />
              ) : null}
              <AvatarPlaceholderFallback />
            </Avatar>
            {peerOnline ? (
              <span
                className="absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500"
                aria-hidden
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            {otherUser?.name ? (
              <p className="locale-text truncate font-semibold">{otherUser.name}</p>
            ) : (
              <Skeleton className="h-4 w-32" />
            )}
            <p className="truncate text-xs text-muted-foreground">{statusLine}</p>
          </div>
        </header>

        <div className="chat-thread-scroller flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-y-auto px-3 py-3 sm:px-4">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
            <div className="flex justify-start">
              <Skeleton className="h-12 w-[55%] max-w-xs rounded-2xl rounded-bl-md" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-[45%] max-w-xs rounded-2xl rounded-br-md" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-16 w-[62%] max-w-sm rounded-2xl rounded-bl-md" />
            </div>
          </div>
        </div>

        <footer className="shrink-0 border-t border-border bg-card">
          <form className="flex items-center gap-2 px-3 py-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 flex-1 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </form>
        </footer>
      </div>
    );
  }

  if (messagesQuery.error) {
    return (
      <ErrorState
        title="Unable to open chat"
        description={chatErrorMessage(messagesQuery.error)}
        onRetry={() => void messagesQuery.refetch()}
      />
    );
  }

  const statusLine = peerTyping
    ? "typing…"
    : peerOnline
      ? "Online"
      : realtime.connected
        ? "Offline"
        : realtime.error || "Connecting…";

  const seenIds = seenIdsRef.current?.ids;

  return (
    <div className={shellClass}>
      <header className="locale-chat-thread-header flex shrink-0 items-center gap-3 border-b border-border px-3 py-3">
        <ShellBackLink
          href="/messages"
          label={t("Messages")}
          className={
            embedded ? "md:hidden shrink-0 py-1 ps-1 pe-3 text-xs" : "shrink-0"
          }
        />
        <div className="relative shrink-0">
          <Avatar className="h-9 w-9">
            {otherUser?.avatarUrl ? (
              <AvatarImage src={otherUser.avatarUrl} alt="" />
            ) : null}
            <AvatarPlaceholderFallback />
          </Avatar>
          {peerOnline ? (
            <span
              className="absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500"
              aria-hidden
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="locale-text truncate font-semibold">
            {otherUser?.name ?? "Conversation"}
          </p>
          <p
            className={cn(
              "truncate text-xs",
              peerTyping
                ? "font-medium text-primary"
                : peerOnline
                  ? "text-emerald-600"
                  : "text-muted-foreground"
            )}
          >
            {statusLine}
            {otherUser?.userName && !peerTyping
              ? ` · @${otherUser.userName}`
              : null}
          </p>
        </div>
        {otherUser ? (
          <ChatBlockControl
            userId={otherUser.id}
            name={otherUser.name}
            blocked={peerBlocked}
          />
        ) : null}
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="chat-thread-scroller h-full overflow-y-auto px-3 py-3 sm:px-4"
        >
          <div ref={contentRef} className="mx-auto flex w-full max-w-2xl flex-col gap-2">
            {messagesQuery.hasNextPage ? (
              <div className="flex h-8 items-center justify-center">
                {messagesQuery.isFetchingNextPage ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Loading earlier messages" />
                ) : (
                  <button
                    type="button"
                    className="rounded-full px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                    onClick={() => void loadOlder()}
                  >
                    Load earlier messages
                  </button>
                )}
              </div>
            ) : null}

            {displayMessages.length === 0 ? (
              <EmptyState
                title="Say hello"
                description="Send a text, photo, or document to start this conversation."
                className="min-h-40 border-none"
              />
            ) : (
              displayMessages.map((message, index) => {
                const previous = index > 0 ? displayMessages[index - 1] : null;
                const newDay = !previous || !isSameChatDay(previous.createdAt, message.createdAt);
                const isNew = seenIds != null && !seenIds.has(message.id);
                const failed = failedIds.has(message.id);
                return (
                  <Fragment key={message.id}>
                    {newDay && message.createdAt ? (
                      <div className="my-2 flex items-center justify-center" role="separator">
                        <span className="rounded-full bg-muted px-3 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {chatDayLabel(message.createdAt)}
                        </span>
                      </div>
                    ) : null}
                    <div
                      data-message-id={message.id}
                      className={cn(
                        "w-full max-w-full",
                        isNew && "chat-message-enter",
                        isOptimisticMessageId(message.id) && !failed && "opacity-90",
                      )}
                    >
                      <MessageBubble
                        message={message}
                        onOpenSharedPost={setPreviewPostId}
                        actions={bubbleActions}
                      />
                      {failed ? (
                        <div className="mt-1 flex items-center justify-end gap-2 text-[11px]">
                          <span className="inline-flex items-center gap-1 text-destructive">
                            <AlertCircle className="h-3 w-3" aria-hidden />
                            Not sent
                          </span>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                            onClick={() => void deliver(message)}
                          >
                            <RotateCw className="h-3 w-3" aria-hidden />
                            Retry
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              setOutbox((prev) => prev.filter((o) => o.message.id !== message.id))
                            }
                          >
                            <X className="h-3 w-3" aria-hidden />
                            Remove
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </Fragment>
                );
              })
            )}

            {peerTyping ? (
              <div className="chat-message-enter flex items-center gap-2 px-1 text-xs text-muted-foreground">
                <span className="inline-flex gap-1 rounded-full bg-muted px-2.5 py-1.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </span>
                <span>
                  {otherUser?.name?.split(" ")[0] ?? "They"} {`is typing…`}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {!atBottom ? (
          <button
            type="button"
            onClick={() => scrollToBottom("smooth", true)}
            className="chat-message-enter absolute bottom-3 end-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold shadow-lg hover:bg-muted"
            aria-label="Jump to latest messages"
          >
            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
            {unseenCount > 0 ? `${unseenCount} new` : "Latest"}
          </button>
        ) : null}
      </div>

      <footer className="shrink-0 border-t border-border bg-card">
        {pendingAttachment ? (
          <ChatMediaComposerPreview
            attachment={pendingAttachment}
            onRemove={() => {
              clearAttachment();
              setAttachError(null);
              if (fileRef.current) fileRef.current.value = "";
            }}
          />
        ) : null}

        {peerBlocked ? (
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              You blocked {otherUser?.name ?? "this member"}. Unblock to send
              messages.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={unblock.isPending}
              onClick={() => otherUser && unblock.mutate(otherUser.id)}
            >
              Unblock
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex items-end gap-2 px-3 py-3">
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
              multiple
              onChange={(e) => void onPickFiles(e.target.files)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full"
              disabled={!otherUser || mediaBusy}
              aria-label="Attach file"
              onClick={() => fileRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <textarea
              ref={composerRef}
              value={draft}
              rows={1}
              onChange={(e) => {
                const next = e.target.value;
                setDraft(next);
                typing.onDraftChange(next);
              }}
              onKeyDown={(e) => {
                // Enter sends, Shift+Enter adds a line; don't send mid-IME composition.
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  if (canSend) void onSubmit();
                }
              }}
              placeholder={
                pendingAttachment
                  ? "Add a caption…"
                  : otherUser
                    ? "Write a message…"
                    : "Loading recipient…"
              }
              disabled={!otherUser || mediaBusy}
              maxLength={4000}
              aria-label={pendingAttachment ? "Caption" : "Message"}
              className="min-h-10 flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-2.5 text-sm leading-5 shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60"
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0 rounded-full"
              disabled={!canSend}
              aria-label={pendingAttachment ? "Send attachment" : "Send message"}
            >
              {mediaBusy ? (
                <InlineLoader className="text-primary-foreground" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        )}
        {attachError ? (
          <p className="px-4 pb-3 pt-0 text-sm text-destructive" role="alert">
            {attachError}
          </p>
        ) : null}
      </footer>

      <PostCommentsDialog
        postId={previewPostId}
        open={previewPostId != null}
        onOpenChange={(open) => {
          if (!open) setPreviewPostId(null);
        }}
        viewerName="You"
      />
    </div>
  );
}
