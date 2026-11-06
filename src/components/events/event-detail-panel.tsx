"use client";

import { useEffect, useMemo, useState } from "react";
import { ContentShareDialog } from "@/components/chat/content-share-dialog";
import { EventDetailBody } from "@/components/events/event-detail-body";
import { EventDetailSkeleton } from "@/components/events/event-detail-skeleton";
import { ErrorState } from "@/components/states/error-state";
import {
  buildEventPublicUrl,
  buildEventShareMessage,
} from "@/features/events/lib/event-share";
import {
  eventsErrorMessage,
  useEventDetail,
  useEventRsvp,
  useRecordEventView,
} from "@/features/events/hooks/use-events";
import { cn } from "@/lib/utils";

export function EventDetailPanel({
  eventId,
  titleAs = "h1",
  variant = "page",
}: {
  eventId: number;
  titleAs?: "h1" | "h2";
  variant?: "page" | "embedded";
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const query = useEventDetail(eventId);
  const rsvp = useEventRsvp(eventId);
  const view = useRecordEventView(eventId);
  const event = query.data;

  const eventUrl = useMemo(
    () => (event ? event.publicUrl || buildEventPublicUrl(event.id) : ""),
    [event]
  );
  const eventShareMessage = useMemo(
    () => (event ? buildEventShareMessage(event, eventUrl) : ""),
    [event, eventUrl]
  );

  useEffect(() => {
    if (!event?.id) return;
    void view.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per loaded event
  }, [event?.id]);

  if (query.isLoading) {
    return (
      <div className={cn(variant === "page" && "w-full pb-2")}>
        <EventDetailSkeleton variant={variant} />
      </div>
    );
  }

  if (query.isError || !event) {
    return (
      <div className={cn("pb-4", variant === "page" && "w-full")}>
        <ErrorState
          title="Could not load event"
          description={eventsErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      </div>
    );
  }

  const registered = event.viewerRsvp?.status === "going";

  async function toggleRegister() {
    try {
      await rsvp.mutateAsync(registered ? "not_going" : "going");
    } catch {
      /* Toast + inline error via mutation */
    }
  }

  const rsvpError = rsvp.error ? eventsErrorMessage(rsvp.error) : null;

  return (
    <>
      <EventDetailBody
        event={event}
        titleAs={titleAs}
        variant={variant}
        registered={registered}
        rsvpPending={rsvp.isPending}
        rsvpError={rsvpError}
        onToggleRegister={() => void toggleRegister()}
        onShare={() => setShareOpen(true)}
      />

      <ContentShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        dialogTitle="Share Event"
        publicUrl={eventUrl}
        externalTitle={event.title}
        externalMessage={eventShareMessage}
        chatEntity={{ type: "event", eventId: event.id }}
      />
    </>
  );
}
