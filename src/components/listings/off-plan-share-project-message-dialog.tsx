"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarPlaceholderFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { shareEntityInChat } from "@/features/chat/services/chat-share.client";
import { fetchConnections } from "@/features/network/services/network.client";
import type { NetworkPerson } from "@/features/network/types/network.types";
import { shareOffPlanProjectPostClient } from "@/features/off-plan/services/off-plan.client";
import { ListRowSkeleton } from "@/components/states/list-row-skeleton";
import { cn } from "@/lib/utils";

export function OffPlanShareProjectMessageDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
}) {
  const [people, setPeople] = useState<NetworkPerson[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConnections = () => {
    setLoadingPeople(true);
    setError(null);
    // BFF `networkListSchema` caps limit at 50 (same as ContentShareDialog).
    fetchConnections({ type: "all", page: 1, limit: 50 })
      .then((res) => setPeople(res.people ?? []))
      .catch((e) => {
        setPeople([]);
        setError(
          e instanceof Error
            ? e.message
            : "Unable to load connections. Sign in and try again."
        );
      })
      .finally(() => setLoadingPeople(false));
  };

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSelectedIds([]);
    setMessage("");
    loadConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter((p) => p.name.toLowerCase().includes(q));
  }, [people, query]);

  const toggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (!selectedIds.length) {
      setError("Select at least one connection.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const caption = message.trim();
      const created = await shareOffPlanProjectPostClient({
        projectId,
        description: caption || undefined,
        visibility: "connections",
      });
      let ok = 0;
      for (const receiverId of selectedIds) {
        try {
          await shareEntityInChat(
            { type: "post", postId: created.id },
            receiverId,
            caption
          );
          ok += 1;
        } catch {
          /* continue */
        }
      }
      if (ok === 0) {
        setError("Could not send to selected connections.");
        return;
      }
      onOpenChange(false);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Sign in to share this project."
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,640px)] flex-col gap-0 p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border px-5 py-4 text-start">
          <DialogTitle className="text-base font-semibold">
            Share as message
          </DialogTitle>
          <DialogDescription className="locale-text line-clamp-2 text-xs">
            {projectTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 border-b border-border/80 px-5 py-3">
          <Textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add an optional note…"
            className="resize-none text-sm"
          />
          <div className="relative">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search connections…"
              className="h-10 ps-9"
            />
          </div>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
          {loadingPeople ? (
            <li className="py-1">
              <ListRowSkeleton
                count={5}
                withAction
                label="Loading connections"
                className="rounded-lg border border-border bg-card"
              />
            </li>
          ) : error ? (
            <li className="space-y-3 py-6 text-center">
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={loadConnections}>
                Retry
              </Button>
            </li>
          ) : filtered.length === 0 ? (
            <li className="py-6 text-center text-sm text-muted-foreground">
              {query.trim()
                ? "No connections match your search."
                : "You have no connections yet. Connect with others to share projects in chat."}
            </li>
          ) : (
            filtered.map((person) => {
              if (person.userId == null) return null;
              const selected = selectedIds.includes(person.userId);
              return (
                <li key={person.userId} className="py-0.5">
                  <button
                    type="button"
                    onClick={() => toggle(person.userId!)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-start transition",
                      selected ? "bg-primary/5" : "hover:bg-muted/50"
                    )}
                  >
                    <Avatar className="h-9 w-9">
                      {person.avatarUrl ? (
                        <AvatarImage src={person.avatarUrl} alt="" />
                      ) : null}
                      <AvatarPlaceholderFallback />
                    </Avatar>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {person.name}
                    </span>
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background"
                      )}
                    >
                      {selected ? (
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        {error && !loadingPeople && people.length > 0 ? (
          <p className="px-5 pb-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <DialogFooter className="flex-row gap-2 border-t border-border bg-muted/20 px-5 py-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={pending || !selectedIds.length}
            onClick={handleSend}
          >
            {pending ? "Sending…" : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
