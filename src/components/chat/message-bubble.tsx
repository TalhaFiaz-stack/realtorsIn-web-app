"use client";

import { Check, CheckCheck, Clock3, FileText } from "lucide-react";
import { isOptimisticMessageId } from "@/features/chat/lib/create-optimistic-message";
import { ChatImageGallery } from "@/components/chat/chat-image-gallery";
import {
  SharedEventCard,
  SharedJobCard,
  SharedPostCard,
  SharedProfileCard,
  SharedStoryCard,
} from "@/components/chat/chat-share-cards";
import {
  MessageActionsMenu,
  MessageReactions,
  type ChatMessageActions,
} from "@/components/chat/message-actions";
import type { ChatMessage } from "@/features/chat/types/chat.types";
import { cn } from "@/lib/utils";

function formatStamp(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatBytes(size: number | null) {
  if (size == null || size <= 0) return null;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function ReceiptIcon({ message }: { message: ChatMessage }) {
  if (!message.isOwn) return null;
  if (isOptimisticMessageId(message.id)) {
    return (
      <Clock3
        className="h-3.5 w-3.5 opacity-70"
        aria-label="Sending"
      />
    );
  }
  if (message.isRead) {
    return <CheckCheck className="h-3.5 w-3.5 text-sky-300" aria-label="Read" />;
  }
  if (message.isDelivered) {
    return (
      <CheckCheck
        className="h-3.5 w-3.5 opacity-80"
        aria-label="Delivered"
      />
    );
  }
  return <Check className="h-3.5 w-3.5 opacity-80" aria-label="Sent" />;
}

function Meta({
  message,
  tone,
}: {
  message: ChatMessage;
  tone: "own" | "peer" | "neutral";
}) {
  return (
    <span
      className={cn(
        "mt-1 inline-flex items-center gap-1 text-[10px] tabular-nums",
        tone === "own" && "text-primary-foreground/75",
        tone === "peer" && "text-muted-foreground",
        tone === "neutral" && "text-muted-foreground"
      )}
    >
      {formatStamp(message.createdAt)}
      <ReceiptIcon message={message} />
    </span>
  );
}

function BubbleShell({
  own,
  children,
  className,
  padded = true,
}: {
  own: boolean;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-fit max-w-[min(82%,20rem)] overflow-hidden text-sm leading-relaxed",
        own
          ? "rounded-[1.15rem] rounded-br-md bg-primary text-primary-foreground"
          : "rounded-[1.15rem] rounded-bl-md border border-border bg-card text-card-foreground shadow-sm",
        padded && "px-3.5 py-2",
        className
      )}
    >
      {children}
    </div>
  );
}

const SHARE_BUBBLE_WIDTH = "w-[18.75rem] max-w-[min(18.75rem,100%)]";

function ShareBubble({
  own,
  message,
  children,
}: {
  own: boolean;
  message: ChatMessage;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex w-full max-w-full",
        own ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          SHARE_BUBBLE_WIDTH,
          "shrink-0 overflow-hidden rounded-[1.15rem] border border-border bg-card p-2.5 text-card-foreground shadow-sm",
          own ? "rounded-br-md" : "rounded-bl-md"
        )}
      >
        <div className="w-full min-w-0">{children}</div>
        {message.content ? (
          <p className="mt-2 whitespace-pre-wrap break-words px-0.5 text-sm text-foreground [overflow-wrap:anywhere]">
            {message.content}
          </p>
        ) : null}
        <div className="mt-1.5 flex justify-end px-0.5">
          <Meta message={message} tone="neutral" />
        </div>
      </div>
    </div>
  );
}

export function MessageBubble({
  message,
  onOpenSharedPost,
  actions,
}: {
  message: ChatMessage;
  onOpenSharedPost?: (postId: number) => void;
  /** Edit / react / delete (mobile parity). Omit for read-only bubbles. */
  actions?: ChatMessageActions;
}) {
  const own = message.isOwn;

  if (message.isDeleted) {
    return (
      <div
        className={cn(
          "flex w-full max-w-full",
          own ? "justify-end" : "justify-start"
        )}
      >
        <span className="rounded-[1.15rem] border border-dashed border-border px-3.5 py-2 text-sm italic text-muted-foreground">
          This message was deleted
        </span>
      </div>
    );
  }

  const bubble = <MessageBubbleContent message={message} onOpenSharedPost={onOpenSharedPost} />;
  const canAct = actions != null && !isOptimisticMessageId(message.id);
  if (!canAct && message.reactions.length === 0 && !message.isEdited) {
    return bubble;
  }

  return (
    <div className="group relative flex w-full max-w-full flex-col">
      <div
        className={cn(
          "flex w-full items-center gap-1",
          own ? "flex-row-reverse" : "flex-row"
        )}
      >
        <div className="min-w-0 flex-1">{bubble}</div>
        {canAct ? <MessageActionsMenu message={message} actions={actions} /> : null}
      </div>
      {message.isEdited ? (
        <span
          className={cn(
            "mt-0.5 text-[10px] text-muted-foreground",
            own ? "text-end" : "text-start"
          )}
        >
          Edited
        </span>
      ) : null}
      <MessageReactions
        message={message}
        onToggle={
          actions ? (emoji) => void actions.onReact(message, emoji) : undefined
        }
      />
    </div>
  );
}

function MessageBubbleContent({
  message,
  onOpenSharedPost,
}: {
  message: ChatMessage;
  onOpenSharedPost?: (postId: number) => void;
}) {
  const own = message.isOwn;

  if (message.messageType === "image" || message.images.length > 0) {
    const urls =
      message.images.length > 0
        ? message.images.map((image) => image.url)
        : message.imageUrl
          ? [message.imageUrl]
          : [];

    return (
      <div
        className={cn(
          "flex w-full max-w-full",
          own ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "w-fit max-w-[min(82%,22rem)] overflow-hidden",
            own
              ? "rounded-[1.15rem] rounded-br-md bg-primary text-primary-foreground"
              : "rounded-[1.15rem] rounded-bl-md border border-border bg-card text-card-foreground shadow-sm"
          )}
        >
          <ChatImageGallery urls={urls} own={own} />
          {message.content ? (
            <p className="whitespace-pre-wrap break-words px-3.5 pt-2 text-sm">
              {message.content}
            </p>
          ) : null}
          <div className="flex justify-end px-3 pb-1.5 pt-1">
            <Meta message={message} tone={own ? "own" : "peer"} />
          </div>
        </div>
      </div>
    );
  }

  if (message.messageType === "document" || message.documentUrl) {
    return (
      <div
        className={cn(
          "flex w-full max-w-full",
          own ? "justify-end" : "justify-start"
        )}
      >
        <BubbleShell own={own}>
          <a
            href={message.documentUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors",
              own
                ? "bg-primary-foreground/10 hover:bg-primary-foreground/15"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            <span
              className={cn(
                "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                own ? "bg-primary-foreground/15" : "bg-background"
              )}
            >
              <FileText className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium">
                {message.documentName || "Document"}
              </span>
              {formatBytes(message.documentSize) ? (
                <span className="block text-[11px] opacity-75">
                  {formatBytes(message.documentSize)}
                </span>
              ) : null}
            </span>
          </a>
          {message.content ? (
            <p className="mt-2 whitespace-pre-wrap break-words">
              {message.content}
            </p>
          ) : null}
          <div className="flex justify-end">
            <Meta message={message} tone={own ? "own" : "peer"} />
          </div>
        </BubbleShell>
      </div>
    );
  }

  if (
    message.messageType === "post_share" ||
    message.messageType === "property_share"
  ) {
    return (
      <ShareBubble own={own} message={message}>
        <SharedPostCard
          post={message.sharedPost}
          onOpen={onOpenSharedPost}
        />
      </ShareBubble>
    );
  }

  if (message.messageType === "job_share") {
    return (
      <ShareBubble own={own} message={message}>
        <SharedJobCard job={message.sharedJob} />
      </ShareBubble>
    );
  }

  if (message.messageType === "event_share") {
    return (
      <ShareBubble own={own} message={message}>
        <SharedEventCard event={message.sharedEvent} />
      </ShareBubble>
    );
  }

  if (message.messageType === "profile_share") {
    return (
      <ShareBubble own={own} message={message}>
        <SharedProfileCard profile={message.sharedProfile} />
      </ShareBubble>
    );
  }

  if (message.messageType === "story_reply") {
    return (
      <ShareBubble own={own} message={message}>
        <SharedStoryCard story={message.sharedStory} />
      </ShareBubble>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full max-w-full",
        own ? "justify-end" : "justify-start"
      )}
    >
      <BubbleShell own={own}>
        <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
          {message.content || " "}
        </p>
        <div className="flex justify-end">
          <Meta message={message} tone={own ? "own" : "peer"} />
        </div>
      </BubbleShell>
    </div>
  );
}
