"use client";

import { CalendarDays, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { EventCard } from "@/components/events/event-card";
import { EventsListShimmer } from "@/components/events/event-shimmers";
import {
  HubTwoColumnGrid,
  HubTwoColumnGridItem,
} from "@/components/hub/hub-two-column-grid";
import { EventsHubDateFilter } from "@/components/events/events-hub-date-filter";
import {
  HubControlCard,
  HubControlCardBody,
  HubControlCardHeader,
} from "@/components/hub/hub-control-card";
import { HubModuleHeader } from "@/components/hub/hub-module-header";
import { HubSearchInput } from "@/components/hub/hub-search-input";
import { HubSegmentTabs } from "@/components/hub/hub-segment-tabs";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";
import { EVENTS_HUB_TABS } from "@/features/events/constants/events.constants";
import {
  eventsErrorMessage,
  useEventRsvp,
  useEventsList,
} from "@/features/events/hooks/use-events";
import type { EventsHubTab } from "@/features/events/types/event.types";

const EMPTY: Record<
  EventsHubTab,
  { title: string; description: string; showCreate?: boolean }
> = {
  upcoming: {
    title: "No upcoming events",
    description: "Create an event or check back later for new listings.",
    showCreate: true,
  },
  going: {
    title: "No registered events",
    description: "Register for an event to see it here.",
  },
  invited: {
    title: "No invitations",
    description: "When someone invites you, accept or decline here.",
  },
  hosting: {
    title: "No hosted events",
    description: "Create your first event to start hosting.",
    showCreate: true,
  },
  past: {
    title: "No past events",
    description: "Events you attended will appear here after they end.",
  },
};

const EVENT_TAB_ITEMS = EVENTS_HUB_TABS.map((item) => ({
  id: item.key,
  title: item.label,
}));

export function EventsHubScreen() {
  const [tab, setTab] = useState<EventsHubTab>("upcoming");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [actingEventId, setActingEventId] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filters = useMemo(
    () => ({
      q: search || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [endDate, search, startDate]
  );
  const query = useEventsList(tab, filters);
  const events = query.data?.events ?? [];
  const empty = EMPTY[tab];

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !query.hasNextPage || query.isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void query.fetchNextPage();
      },
      { rootMargin: "240px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [query]);

  return (
    <div className="w-full max-w-2xl space-y-4 pb-10">
      <HubControlCard>
        <HubControlCardHeader>
          <HubModuleHeader
            title="Events"
            subtitle="Discover, host and RSVP to industry events"
            icon={CalendarDays}
            action={
              <Button asChild size="sm" className="h-9 gap-1.5 rounded-full px-4 shadow-none">
                <Link href="/events/create">
                  <Plus className="h-4 w-4" aria-hidden />
                  Create event
                </Link>
              </Button>
            }
          />
        </HubControlCardHeader>

        <HubControlCardBody>
          <HubSegmentTabs
            items={EVENT_TAB_ITEMS}
            value={tab}
            onChange={setTab}
            ariaLabel="Event lists"
            gridClassName="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
          />

          <HubSearchInput
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={() => setSearch(searchInput.trim())}
            onClear={() => {
              setSearchInput("");
              setSearch("");
            }}
            placeholder="Search events"
          />

          <EventsHubDateFilter
            startDate={startDate}
            endDate={endDate}
            onChange={({ startDate: from, endDate: to }) => {
              setStartDate(from);
              setEndDate(to);
            }}
            onClear={() => {
              setStartDate("");
              setEndDate("");
            }}
          />
        </HubControlCardBody>
      </HubControlCard>

      {query.isLoading ? <EventsListShimmer /> : null}

      {query.isError ? (
        <ErrorState
          title="Could not load events"
          description={eventsErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {!query.isLoading && !query.isError && events.length === 0 ? (
        <div className="space-y-3">
          <EmptyState title={empty.title} description={empty.description} />
          {empty.showCreate ? (
            <div className="flex justify-center">
              <Button asChild size="sm" className="h-9 rounded-lg">
                <Link href="/events/create">Create event</Link>
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {!query.isLoading && events.length > 0 ? (
        <div className="space-y-3">
          <HubTwoColumnGrid>
            {events.map((event) => (
              <HubTwoColumnGridItem key={event.id}>
                <EventInviteCardWrapper
                  event={event}
                  actingEventId={actingEventId}
                  setActingEventId={setActingEventId}
                />
              </HubTwoColumnGridItem>
            ))}
          </HubTwoColumnGrid>
          {query.isFetchingNextPage ? (
            <EventsListShimmer count={2} />
          ) : null}
          <div ref={sentinelRef} className="h-px w-full" aria-hidden />
        </div>
      ) : null}
    </div>
  );
}

function EventInviteCardWrapper({
  event,
  actingEventId,
  setActingEventId,
}: {
  event: import("@/features/events/types/event.types").SocialEvent;
  actingEventId: number | null;
  setActingEventId: (id: number | null) => void;
}) {
  const rsvp = useEventRsvp(event.id);
  const showInvite =
    event.viewerInvite?.status === "pending" &&
    event.viewerRsvp?.status !== "going";

  async function respond(status: "going" | "not_going") {
    setActingEventId(event.id);
    try {
      await rsvp.mutateAsync(status);
    } catch {
      /* Toast via useEventRsvp */
    } finally {
      setActingEventId(null);
    }
  }

  return (
    <EventCard
      event={event}
      inviteActions={
        showInvite
          ? {
              loading: actingEventId === event.id || rsvp.isPending,
              onAccept: () => void respond("going"),
              onDecline: () => void respond("not_going"),
            }
          : undefined
      }
    />
  );
}
