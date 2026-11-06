"use client";

import Link from "next/link";
import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import { useState } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarPlaceholderFallback,
} from "@/components/ui/avatar";
import { EventsHubTabButton } from "@/components/events/event-card";
import { useEventAttendees } from "@/features/events/hooks/use-event-attendees";
import { useEventDetail } from "@/features/events/hooks/use-events";
import { ErrorState } from "@/components/states/error-state";
import { eventsErrorMessage } from "@/features/events/hooks/use-events";

export function EventAttendeesScreen({ eventId }: { eventId: number }) {
  const [tab, setTab] = useState<"going" | "invited">("going");
  const detail = useEventDetail(eventId);
  const query = useEventAttendees(eventId, tab);
  const rows = query.data?.rows ?? [];
  const isHost = detail.data?.isHost ?? false;

  return (
    <div className="w-full max-w-2xl space-y-4 pb-10">
      <ShellBackRow>
        <ShellBackLink href={`/events/${eventId}`} label="Event" />
      </ShellBackRow>
      <h1 className="text-xl font-semibold">Attendees</h1>
      <div className="flex gap-2">
        <EventsHubTabButton
          active={tab === "going"}
          label="Registered"
          onClick={() => setTab("going")}
        />
        {isHost ? (
          <EventsHubTabButton
            active={tab === "invited"}
            label="Invited"
            onClick={() => setTab("invited")}
          />
        ) : null}
      </div>
      {query.isError ? (
        <ErrorState
          title="Could not load list"
          description={eventsErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      ) : null}
      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {rows.map((row) => (
          <li key={`${row.id}-${row.userName}`} className="flex items-center gap-3 px-4 py-3">
            <Avatar className="h-10 w-10">
              {row.profileImage ? (
                <AvatarImage src={row.profileImage} alt="" />
              ) : null}
              <AvatarPlaceholderFallback />
            </Avatar>
            <div className="min-w-0 flex-1">
              {row.userName ? (
                <Link
                  href={`/u/${row.userName}`}
                  className="font-semibold hover:underline"
                >
                  {row.name}
                </Link>
              ) : (
                <p className="font-semibold">{row.name}</p>
              )}
              {row.status ? (
                <p className="text-xs capitalize text-muted-foreground">
                  {row.status.replace(/_/g, " ")}
                </p>
              ) : null}
            </div>
          </li>
        ))}
        {!query.isLoading && rows.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            No one here yet
          </li>
        ) : null}
      </ul>
    </div>
  );
}
