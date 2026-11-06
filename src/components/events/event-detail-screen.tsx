"use client";

import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import { EventDetailPanel } from "@/components/events/event-detail-panel";

export function EventDetailScreen({ eventId }: { eventId: number }) {
  return (
    <div className="w-full max-w-2xl space-y-5 pb-12 pt-1">
      <ShellBackRow>
        <ShellBackLink href="/events" label="Events" />
      </ShellBackRow>
      <EventDetailPanel eventId={eventId} variant="page" />
    </div>
  );
}
