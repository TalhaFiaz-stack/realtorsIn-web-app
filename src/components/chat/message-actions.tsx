"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, SmilePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import type { ChatMessage } from "@/features/chat/types/chat.types";
import { cn } from "@/lib/utils";

export const CHAT_REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"] as const;

export type ChatMessageActions = {
  onEdit: (message: ChatMessage, content: string) => Promise<unknown>;
  onReact: (message: ChatMessage, emoji: string) => Promise<unknown>;
  onDelete: (message: ChatMessage, forEveryone: boolean) => Promise<unknown>;
};

/** Plain text messages are the only editable type (backend rule). */
export function isEditableMessage(message: ChatMessage): boolean {
  return (
    message.isOwn &&
    message.messageType === "text" &&
    !message.isDeleted &&
    message.content.trim().length > 0
  );
}

export function MessageActionsMenu({
  message,
  actions,
}: {
  message: ChatMessage;
  actions: ChatMessageActions;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const [pending, setPending] = useState(false);

  const run = async (fn: () => Promise<unknown>, close: () => void) => {
    setPending(true);
    try {
      await fn();
      close();
    } catch {
      /* mutation hooks already toast */
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 shrink-0 rounded-full text-muted-foreground",
              "md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-within:opacity-100 data-[state=open]:opacity-100"
            )}
            aria-label="Message options"
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={message.isOwn ? "end" : "start"} className="w-56">
          <DropdownMenuLabel className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <SmilePlus className="h-3.5 w-3.5" aria-hidden />
            React
          </DropdownMenuLabel>
          <div className="flex items-center justify-between gap-0.5 px-1 pb-1">
            {CHAT_REACTION_EMOJIS.map((emoji) => (
              <DropdownMenuItem
                key={emoji}
                className="h-8 w-8 justify-center rounded-full p-0 text-base"
                aria-label={`React ${emoji}`}
                onSelect={() => void actions.onReact(message, emoji)}
              >
                {emoji}
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuSeparator />
          {isEditableMessage(message) ? (
            <DropdownMenuItem
              onSelect={() => {
                setDraft(message.content);
                setEditOpen(true);
              }}
            >
              <Pencil className="me-2 h-4 w-4" aria-hidden />
              Edit
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 className="me-2 h-4 w-4" aria-hidden />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit message</DialogTitle>
            <DialogDescription>
              Only text messages can be edited.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            maxLength={5000}
            aria-label="Message text"
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={
                pending ||
                !draft.trim() ||
                draft.trim() === message.content.trim()
              }
              onClick={() =>
                void run(
                  () => actions.onEdit(message, draft.trim()),
                  () => setEditOpen(false)
                )
              }
            >
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete message?</DialogTitle>
            <DialogDescription>
              {message.isOwn
                ? "Delete it just for you, or for everyone in this chat."
                : "This removes the message from your view only."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
            {message.isOwn ? (
              <Button
                variant="destructive"
                disabled={pending}
                onClick={() =>
                  void run(
                    () => actions.onDelete(message, true),
                    () => setDeleteOpen(false)
                  )
                }
              >
                Delete for everyone
              </Button>
            ) : null}
            <Button
              variant={message.isOwn ? "outline" : "destructive"}
              disabled={pending}
              onClick={() =>
                void run(
                  () => actions.onDelete(message, false),
                  () => setDeleteOpen(false)
                )
              }
            >
              Delete for me
            </Button>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function MessageReactions({
  message,
  onToggle,
}: {
  message: ChatMessage;
  onToggle?: (emoji: string) => void;
}) {
  if (message.reactions.length === 0) return null;
  return (
    <div
      className={cn(
        "mt-1 flex flex-wrap gap-1",
        message.isOwn ? "justify-end" : "justify-start"
      )}
    >
      {message.reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => onToggle?.(r.emoji)}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-1.5 py-0.5 text-xs shadow-sm hover:bg-muted"
          aria-label={`${r.emoji} ${r.count}`}
        >
          <span>{r.emoji}</span>
          {r.count > 1 ? (
            <span className="tabular-nums text-muted-foreground">{r.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
