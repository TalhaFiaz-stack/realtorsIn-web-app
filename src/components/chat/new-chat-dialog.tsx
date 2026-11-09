"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquarePlus, Search, Users } from "lucide-react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useStartConversation } from "@/features/chat/hooks/use-chat";
import { useNetworkList } from "@/features/network/hooks/use-network";

/**
 * "New chat" — mobile ConversationListScreen + button opens a connections
 * sheet; pick someone to open (or create) the conversation with them.
 */
export function NewChatDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const connections = useNetworkList("all");
  const start = useStartConversation();
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setPendingId(null);
    }
  }, [open]);

  const people = useMemo(() => {
    const list = (connections.data?.people ?? []).filter((p) => p.userId != null);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.userName ?? "").toLowerCase().includes(q) ||
        (p.company ?? "").toLowerCase().includes(q)
    );
  }, [connections.data, query]);

  function openChat(userId: number) {
    setPendingId(userId);
    start.mutate(userId, {
      onSuccess: (result) => {
        onOpenChange(false);
        router.push(`/messages/${result.conversationId}`);
      },
      onSettled: () => setPendingId(null),
    });
  }

  const total = connections.data?.people.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[min(80dvh,36rem)] max-w-md flex-col gap-0 overflow-hidden rounded-2xl p-0"
        closeButtonClassName="end-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <header className="flex items-start gap-3 border-b border-border/70 px-5 py-4 pe-14">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageSquarePlus className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 pt-0.5">
            <DialogTitle className="text-base font-semibold leading-tight">New message</DialogTitle>
            <DialogDescription className="mt-1 text-[13px] leading-snug">
              Choose a connection to start chatting
            </DialogDescription>
          </div>
        </header>

        <div className="border-b border-border/70 px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your connections"
              className="h-10 rounded-full bg-muted/50 ps-9"
              aria-label="Search connections"
              autoFocus
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {connections.isLoading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            </div>
          ) : total === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Users className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">No connections yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Connect with people to start chatting with them.
                </p>
              </div>
              <Button asChild size="sm" className="rounded-full" onClick={() => onOpenChange(false)}>
                <Link href="/connections?tab=suggestions">Find people</Link>
              </Button>
            </div>
          ) : people.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              No connections match “{query.trim()}”.
            </p>
          ) : (
            <ul className="py-1.5" aria-label="Connections">
              {people.map((p) => {
                const sub = [p.role, p.company].filter(Boolean).join(" · ") || (p.userName ? `@${p.userName}` : "");
                const busy = pendingId === p.userId;
                return (
                  <li key={p.userId}>
                    <button
                      type="button"
                      disabled={pendingId != null}
                      onClick={() => openChat(p.userId!)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-start transition-colors hover:bg-muted/60 disabled:opacity-60"
                    >
                      <Avatar className="h-10 w-10">
                        {p.avatarUrl ? <AvatarImage src={p.avatarUrl} alt="" /> : null}
                        <AvatarPlaceholderFallback />
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">{p.name}</span>
                        {sub ? <span className="block truncate text-xs text-muted-foreground">{sub}</span> : null}
                      </span>
                      {busy ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
                      ) : (
                        <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground/80">
                          Message
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
