"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createOptimisticChatMessage,
  isOptimisticMessageId,
} from "@/features/chat/lib/create-optimistic-message";
import { useChatThreadScroll } from "@/features/chat/hooks/use-chat-thread-scroll";
import { usePendingChatAttachment } from "@/features/chat/hooks/use-pending-chat-attachment";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { Paperclip, Send } from "lucide-react";
import { ChatMediaComposerPreview } from "@/components/chat/chat-media-composer-preview";
import { MessageBubble } from "@/components/chat/message-bubble";
import { PostCommentsDialog } from "@/components/feed/post-comments-dialog";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useMessages,
  useSendChatMedia,
  useSendMessage,
} from "@/features/chat/hooks/use-chat";
import { useChatRealtimeContext } from "@/features/chat/hooks/chat-realtime-context";
import { cn } from "@/lib/utils";

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
  const [outbox, setOutbox] = useState<ReturnType<typeof createOptimisticChatMessage>[]>(
    []
  );
  const fileRef = useRef<HTMLInputElement | null>(null);
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
    const pending = outbox.filter((m) => !serverIds.has(m.id));
    return pending.length ? [...messages, ...pending] : messages;
  }, [messages, outbox]);

  const peerOnline =
    otherUser != null &&
    (realtime.isUserOnline(otherUser.id) || otherUser.isOnline);
  const peerTyping = realtime.isPeerTyping(conversationId);

  const tailKey = useMemo(() => {
    const last = displayMessages.at(-1);
    return `${last?.id ?? "empty"}:${last?.createdAt ?? ""}:${outbox.length}:${peerTyping ? 1 : 0}`;
  }, [displayMessages, outbox.length, peerTyping]);

  const { scrollerRef, onScroll, scrollToBottom } = useChatThreadScroll({
    conversationId,
    tailKey,
    peerTyping,
  });

  const sendMutation = useSendMessage(conversationId);
  const media = useSendChatMedia(conversationId);
  const busy =
    sendMutation.isPending ||
    media.sendImage.isPending ||
    media.sendDocument.isPending;

  useEffect(() => {
    markRead.mutate(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once
  }, [conversationId]);

  useEffect(() => {
    setOutbox([]);
  }, [conversationId]);

  async function sendPendingAttachment(caption: string) {
    if (!pendingAttachment || !otherUser?.id || busy) return;
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!otherUser?.id || busy) return;

    if (pendingAttachment) {
      await sendPendingAttachment(draft);
      return;
    }

    const content = draft.trim();
    if (!content) return;
    typing.stop();
    setDraft("");

    const tempId = -Date.now();
    const optimistic = createOptimisticChatMessage({
      tempId,
      conversationId,
      receiverId: otherUser.id,
      content,
    });
    setOutbox((prev) => [...prev, optimistic]);
    scrollToBottom("smooth", true);

    try {
      await sendMutation.mutateAsync({
        receiverId: otherUser.id,
        messageContent: content,
      });
      setOutbox((prev) => prev.filter((m) => m.id !== tempId));
      scrollToBottom("smooth", true);
    } catch {
      setOutbox((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(content);
    }
  }

  function onPickFiles(fileList: FileList | null) {
    if (!fileList?.length || busy) return;
    setAttachError(null);
    pickFiles(fileList);
    if (fileRef.current) fileRef.current.value = "";
  }

  const canSend =
    Boolean(otherUser) &&
    !busy &&
    (Boolean(pendingAttachment) || Boolean(draft.trim()));

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
      </header>

      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="chat-thread-scroller min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4"
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          {messagesQuery.hasNextPage ? (
            <div className="flex justify-center pb-1">
              <Button
                variant="outline"
                size="sm"
                disabled={messagesQuery.isFetchingNextPage}
                onClick={() => void messagesQuery.fetchNextPage()}
              >
                {messagesQuery.isFetchingNextPage
                  ? "Loading…"
                  : "Load earlier messages"}
              </Button>
            </div>
          ) : null}

          {displayMessages.length === 0 ? (
            <EmptyState
              title="Say hello"
              description="Send a text, photo, or document to start this conversation."
              className="min-h-40 border-none"
            />
          ) : (
            displayMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "chat-message-enter w-full max-w-full",
                  isOptimisticMessageId(message.id) && "opacity-95"
                )}
              >
                <MessageBubble
                  message={message}
                  onOpenSharedPost={setPreviewPostId}
                />
              </div>
            ))
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

        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 px-3 py-3"
        >
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
          disabled={!otherUser || busy}
          aria-label="Attach file"
          onClick={() => fileRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          value={draft}
          onChange={(e) => {
            const next = e.target.value;
            setDraft(next);
            typing.onDraftChange(next);
          }}
          placeholder={
            pendingAttachment
              ? "Add a caption…"
              : otherUser
                ? "Write a message…"
                : "Loading recipient…"
          }
          disabled={!otherUser || busy}
          maxLength={4000}
          aria-label={pendingAttachment ? "Caption" : "Message"}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!canSend}
          aria-label={
            pendingAttachment ? "Send attachment" : "Send message"
          }
        >
          {busy ? (
            <InlineLoader className="text-primary-foreground" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
        </form>
        {sendMutation.error || attachError ? (
          <p className="px-4 pb-3 pt-0 text-sm text-destructive" role="alert">
            {attachError || chatErrorMessage(sendMutation.error)}
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
