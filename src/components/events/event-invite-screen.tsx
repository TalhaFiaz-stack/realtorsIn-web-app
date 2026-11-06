"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Avatar,
  AvatarImage,
  AvatarPlaceholderFallback,
} from "@/components/ui/avatar";
import { useNetworkList } from "@/features/network/hooks/use-network";
import { useEventMutations } from "@/features/events/hooks/use-event-mutations";
import { showAppToast } from "@/lib/toast/app-toast";
import { cn } from "@/lib/utils";

export function EventInviteScreen({ eventId }: { eventId: number }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const connections = useNetworkList("all");
  const { invite } = useEventMutations(eventId);

  const people = useMemo(() => {
    const list = connections.data?.people ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.role?.toLowerCase().includes(q) ||
        p.company?.toLowerCase().includes(q)
    );
  }, [connections.data?.people, search]);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function send() {
    const ids = [...selected];
    if (!ids.length) return;
    try {
      await invite.mutateAsync(ids);
      showAppToast.success(`Invited ${ids.length} connection(s)`);
      setSelected(new Set());
    } catch (error) {
      showAppToast.fromError(error, "Invite failed");
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-4 pb-10">
      <ShellBackRow>
        <ShellBackLink href={`/events/${eventId}`} label="Event" />
      </ShellBackRow>
      <h1 className="text-xl font-semibold">Invite connections</h1>
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="ps-9"
          placeholder="Search connections"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {people.map((person) => {
          if (person.userId == null) return null;
          const active = selected.has(person.userId);
          return (
            <li key={person.userId}>
              <button
                type="button"
                className={cn(
                  "locale-text flex w-full items-center gap-3 px-4 py-3 text-start transition-colors",
                  active && "bg-primary/5"
                )}
                onClick={() => toggle(person.userId!)}
              >
                <Avatar className="h-10 w-10">
                  {person.avatarUrl ? (
                    <AvatarImage src={person.avatarUrl} alt="" />
                  ) : null}
                  <AvatarPlaceholderFallback />
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{person.name}</p>
                  {person.role || person.company ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {[person.role, person.company].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "h-5 w-5 rounded-full border-2",
                    active ? "border-primary bg-primary" : "border-muted-foreground/40"
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>
      <Button
        type="button"
        className="w-full"
        disabled={!selected.size || invite.isPending}
        onClick={() => void send()}
      >
        {invite.isPending
          ? "Sending…"
          : `Send invites (${selected.size})`}
      </Button>
    </div>
  );
}
