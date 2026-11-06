"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Share2 } from "lucide-react";
import { ContentShareDialog } from "@/components/chat/content-share-dialog";
import { Button } from "@/components/ui/button";
import {
  buildEventPublicUrl,
  buildEventShareMessage,
} from "@/features/events/lib/event-share";
import {
  eventsErrorMessage,
  useEventDetail,
  useEventRsvp,
} from "@/features/events/hooks/use-events";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function EventDetailQuickActions({
  eventId,
  active,
}: {
  eventId: number;
  active: boolean;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const query = useEventDetail(eventId, { enabled: active });
  const rsvp = useEventRsvp(eventId);
  const event = query.data;

  const eventUrl = useMemo(
    () => (event ? event.publicUrl || buildEventPublicUrl(event.id) : ""),
    [event]
  );
  const eventShareMessage = useMemo(
    () => (event ? buildEventShareMessage(event, eventUrl) : ""),
    [event, eventUrl]
  );

  if (!active) return null;

  if (query.isLoading) {
    return (
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    );
  }

  if (!event || event.status !== "published") {
    return (
      <Button variant="outline" size="default" className="w-full" asChild>
        <Link href={`/events/${eventId}`}>
          View full event page
          <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden />
        </Link>
      </Button>
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
      <div className="space-y-2">
        {rsvpError ? (
          <p className="text-center text-sm text-destructive" role="alert">
            {rsvpError}
          </p>
        ) : null}
        <div className="flex gap-2">
          {!event.isHost ? (
            <Button
              type="button"
              className={cn(
                "h-10 flex-1 font-semibold",
                registered &&
                  "border-emerald-600/25 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-950/35 dark:text-emerald-100"
              )}
              variant={registered ? "outline" : "default"}
              disabled={rsvp.isPending}
              onClick={() => void toggleRegister()}
            >
              {registered && !rsvp.isPending ? (
                <CheckCircle2 className="mr-1.5 h-4 w-4 shrink-0" aria-hidden />
              ) : null}
              {rsvp.isPending
                ? "Updating…"
                : registered
                  ? "Registered"
                  : "Register"}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-10 shrink-0",
              event.isHost ? "flex-1" : "px-4"
            )}
            onClick={() => setShareOpen(true)}
          >
            <Share2 className="h-4 w-4" aria-hidden />
            <span className="ml-1.5">Share</span>
          </Button>
        </div>
        {registered && !event.isHost ? (
          <button
            type="button"
            className="w-full text-center text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
            disabled={rsvp.isPending}
            onClick={() => void toggleRegister()}
          >
            Cancel registration
          </button>
        ) : null}
      </div>

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
