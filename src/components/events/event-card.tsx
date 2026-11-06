"use client";

import { useState } from "react";
import { CalendarDays, Images, MapPin } from "lucide-react";
import { EventDetailDialog } from "@/components/events/event-detail-dialog";
import { Button } from "@/components/ui/button";
import {
  eventCoverUrl,
  formatEventSchedule,
  formatVisibilityLabel,
  getEventLocationLabel,
} from "@/features/events/lib/format-event";
import type { SocialEvent } from "@/features/events/types/event.types";
import { RemoteImg } from "@/components/shared/remote-img";
import { cn } from "@/lib/utils";

type Props = {
  event: SocialEvent;
  /** Shorter cover + tighter text for feed carousel rows. */
  variant?: "default" | "compact";
  inviteActions?: {
    loading: boolean;
    onAccept: () => void;
    onDecline: () => void;
  };
};

export function EventCard({ event, inviteActions, variant = "default" }: Props) {
  const compact = variant === "compact";
  const [detailOpen, setDetailOpen] = useState(false);
  const cover = eventCoverUrl(event);
  const place = getEventLocationLabel(event);
  const when = formatEventSchedule(event.startAt, event.endAt, event.timezone);
  const showInvite =
    inviteActions &&
    event.viewerInvite?.status === "pending" &&
    event.viewerRsvp?.status !== "going";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_2px_7px_rgba(15,23,42,0.06)] transition-[box-shadow,border-color] hover:border-border hover:shadow-[0_4px_14px_rgba(15,23,42,0.09)] dark:shadow-none">
      <button
        type="button"
        className="block w-full flex-1 text-start"
        onClick={() => setDetailOpen(true)}
      >
        {cover ? (
          <div
            className={cn(
              "relative w-full shrink-0 overflow-hidden bg-muted",
              compact ? "h-[5.75rem]" : "aspect-[16/10]"
            )}
          >
            <RemoteImg
              src={cover}
              alt=""
              wrapperClassName="absolute inset-0 size-full"
              skeletonClassName="size-full"
              className="size-full object-cover"
            />
            {event.images.length > 1 ? (
              <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
                <Images className="h-3 w-3" aria-hidden />
                {event.images.length}
              </span>
            ) : null}
          </div>
        ) : (
          <div
            className={cn(
              "flex w-full shrink-0 items-center justify-center bg-gradient-to-br from-muted via-muted/70 to-muted/40 text-muted-foreground",
              compact ? "h-[5.75rem]" : "aspect-[16/10]"
            )}
          >
            <CalendarDays
              className={cn(compact ? "h-7 w-7" : "h-10 w-10", "opacity-35")}
              aria-hidden
            />
          </div>
        )}

        <div
          className={cn(
            compact ? "space-y-1.5 p-3" : "space-y-2 p-3.5"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {event.category || "Event"}
            </span>
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {formatVisibilityLabel(event.visibility)}
            </span>
          </div>
          <h2
            className={cn(
              "line-clamp-2 font-semibold leading-snug text-foreground",
              compact ? "text-sm" : "text-base"
            )}
          >
            {event.title}
          </h2>
          {when ? (
            <p
              className={cn(
                "text-muted-foreground",
                compact ? "text-xs" : "text-sm"
              )}
            >
              {when}
            </p>
          ) : null}
          {place ? (
            <p
              className={cn(
                "flex items-start gap-1.5 text-muted-foreground",
                compact ? "text-xs" : "text-sm"
              )}
            >
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="line-clamp-2">{place}</span>
            </p>
          ) : null}
          {event.goingCount > 0 ? (
            <p className="text-xs font-medium text-primary">
              {event.goingCount} registered
            </p>
          ) : null}
        </div>
      </button>

      <EventDetailDialog
        eventId={event.id}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        previewTitle={event.title}
      />

      {showInvite ? (
        <div className="flex gap-2 border-t border-border px-3.5 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={inviteActions.loading}
            onClick={inviteActions.onDecline}
          >
            Decline
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1"
            disabled={inviteActions.loading}
            onClick={inviteActions.onAccept}
          >
            Accept
          </Button>
        </div>
      ) : null}
    </article>
  );
}

export function EventsHubTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
