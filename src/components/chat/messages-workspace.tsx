"use client";

import { MessageSquare } from "lucide-react";
import { ConversationsScreen } from "@/components/chat/conversations-screen";
import { ChatThreadScreen } from "@/components/chat/chat-thread-screen";
import { MessagesSuggestionsRail } from "@/components/chat/messages-suggestions-rail";
import { useChatRealtimeContext } from "@/features/chat/hooks/chat-realtime-context";
import { cn } from "@/lib/utils";

export function MessagesWorkspace({
  conversationId,
}: {
  conversationId?: number;
}) {
  const hasChat = conversationId != null && conversationId > 0;
  const realtime = useChatRealtimeContext();

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      {!realtime.connected && realtime.error ? (
        <p
          className="mb-2 shrink-0 rounded-md border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          Reconnecting to chat… New messages will appear as soon as the
          connection is back.
        </p>
      ) : null}
      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 self-stretch overflow-hidden rounded-lg border border-border bg-card"
        )}
      >
        <section
          className={cn(
            "flex w-full flex-col md:w-[var(--rail-width)] md:shrink-0 md:border-e md:border-border",
            hasChat ? "hidden md:flex" : "flex"
          )}
          aria-label="Conversations"
        >
          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
            <h1 className="text-base font-semibold tracking-tight">Messaging</h1>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ConversationsScreen selectedId={conversationId ?? null} />
          </div>
        </section>

        <section
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
            hasChat ? "flex" : "hidden md:flex"
          )}
          aria-label="Chat"
        >
          {hasChat ? (
            <ChatThreadScreen
              conversationId={conversationId!}
              embedded
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <MessageSquare className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">
                  Select a conversation
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Choose a chat from the list to read and reply — just like your
                  mobile messaging inbox.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <aside
        className="hidden min-h-0 w-[var(--rail-width)] shrink-0 overflow-y-auto xl:block"
        aria-label="Suggestions"
      >
        <MessagesSuggestionsRail />
      </aside>
      </div>
    </div>
  );
}
