"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Share2,
  Users,
  Video,
} from "lucide-react";
import { EventDetailHero } from "@/components/events/event-detail-hero";
import { EventHostPanel } from "@/components/events/event-host-panel";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  eventCoverUrl,
  formatEventSchedule,
  formatVisibilityLabel,
  getEventLocationLabel,
} from "@/features/events/lib/format-event";
import type { SocialEvent } from "@/features/events/types/event.types";
import { ProfileImageLightbox } from "@/components/profile/profile-image-lightbox";
import { toExternalUrl } from "@/lib/format/external-url";
import { cn } from "@/lib/utils";

type Props = {
  event: SocialEvent;
  titleAs?: "h1" | "h2";
  variant?: "page" | "embedded";
  registered: boolean;
  rsvpPending: boolean;
  rsvpError?: string | null;
  onToggleRegister: () => void;
  onShare: () => void;
};

function PageMetaRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof CalendarClock;
  label: string;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-3 rounded-lg px-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 text-sm font-medium leading-snug text-foreground">
          {children}
        </div>
      </div>
    </li>
  );
}

function EmbeddedFact({
  icon: Icon,
  children,
}: {
  icon: typeof CalendarClock;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3 py-0.5">
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
        strokeWidth={1.75}
        aria-hidden
      />
      <div className="min-w-0 text-sm leading-snug text-foreground">{children}</div>
    </div>
  );
}

export function EventDetailBody({
  event,
  titleAs = "h1",
  variant = "page",
  registered,
  rsvpPending,
  rsvpError,
  onToggleRegister,
  onShare,
}: Props) {
  const embedded = variant === "embedded";
  const [viewer, setViewer] = useState<number | null>(null);
  const cover = eventCoverUrl(event);
  const place = getEventLocationLabel(event);
  const when = formatEventSchedule(event.startAt, event.endAt, event.timezone);
  const hostName =
    [event.host?.name, event.host?.lastName].filter(Boolean).join(" ") ||
    event.host?.userName ||
    "Host";
  const TitleTag = titleAs;
  const onlineHref = toExternalUrl(event.onlineUrl);
  const canSeeOnline = event.isHost || registered;
  const showOnlineLink = Boolean(onlineHref && canSeeOnline);
  // Host sees a warning when the saved meeting link isn't a usable URL.
  const showBadOnlineLink = Boolean(event.onlineUrl && !onlineHref && event.isHost);
  const hostHref = event.host?.userName
    ? `/u/${event.host.userName}`
    : event.host?.id
      ? `/profile/${event.host.id}`
      : null;
  const spotsLeft =
    event.capacity && event.capacity > 0 ? Math.max(event.capacity - event.goingCount, 0) : null;
  const extraImages = event.images
    .map((img) => img.imageUrl)
    .filter((url): url is string => Boolean(url) && url !== cover);
  const allImages = [cover, ...extraImages].filter((u): u is string => Boolean(u));
  const metaLine = [
    event.category || "Event",
    formatVisibilityLabel(event.visibility),
  ].join(" · ");

  return (
    <article
      className={cn(
        "overflow-hidden bg-card",
        !embedded &&
          "rounded-xl border border-border/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] dark:shadow-none"
      )}
    >
      <EventDetailHero
        cover={cover}
        embedded={embedded}
        category={event.category}
        onOpen={!embedded && cover ? () => setViewer(0) : undefined}
      />
      <ProfileImageLightbox
        images={allImages}
        startIndex={viewer}
        title={event.title}
        onClose={() => setViewer(null)}
      />

      <div
        className={cn(
          embedded ? "space-y-4 px-4 pb-5 pt-4" : "space-y-5 p-5 md:p-6"
        )}
      >
        {embedded ? (
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {metaLine}
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {event.category || "Event"}
            </span>
            <span className="rounded-md border border-border/80 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {formatVisibilityLabel(event.visibility)}
            </span>
            {event.status !== "published" ? (
              <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold capitalize text-amber-800 dark:text-amber-200">
                {event.status.replace(/_/g, " ")}
              </span>
            ) : null}
          </div>
        )}

        <header className="space-y-1">
          <TitleTag
            className={cn(
              "font-semibold leading-tight tracking-tight text-foreground",
              embedded ? "text-lg" : "text-xl sm:text-2xl"
            )}
          >
            {event.title}
          </TitleTag>
          {!embedded ? (
            <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
              <span>
                <span className="font-semibold text-foreground">{event.goingCount}</span> registered
              </span>
              {spotsLeft != null ? (
                <>
                  <span aria-hidden>·</span>
                  <span className={cn(spotsLeft === 0 && "font-semibold text-destructive")}>
                    {spotsLeft === 0 ? "Fully booked" : `${spotsLeft} spots left`}
                  </span>
                </>
              ) : null}
              {event.interestedCount > 0 ? (
                <>
                  <span aria-hidden>·</span>
                  <span>{event.interestedCount} interested</span>
                </>
              ) : null}
            </p>
          ) : null}
        </header>

        {embedded ? (
          <div className="divide-y divide-border/80 border-y border-border/80">
            {when ? (
              <div className="py-2.5">
                <EmbeddedFact icon={CalendarClock}>{when}</EmbeddedFact>
              </div>
            ) : null}
            {place ? (
              <div className="py-2.5">
                <EmbeddedFact icon={MapPin}>{place}</EmbeddedFact>
              </div>
            ) : null}
            {showOnlineLink ? (
              <div className="py-2.5">
                <EmbeddedFact icon={Video}>
                  <a
                    href={onlineHref!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    Join online
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </EmbeddedFact>
              </div>
            ) : null}
            <div className="py-2.5">
              <EmbeddedFact icon={Users}>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {event.host ? (
                    <>
                      <Avatar className="h-6 w-6">
                        {event.host.profileImage ? (
                          <AvatarImage src={event.host.profileImage} alt="" />
                        ) : null}
                        <AvatarPlaceholderFallback />
                      </Avatar>
                      {event.host.userName ? (
                        <Link
                          href={`/u/${event.host.userName}`}
                          className="font-medium hover:underline"
                        >
                          {hostName}
                        </Link>
                      ) : (
                        <span className="font-medium">{hostName}</span>
                      )}
                    </>
                  ) : (
                    <span>—</span>
                  )}
                  <span className="text-muted-foreground">
                    {event.goingCount} registered
                  </span>
                </div>
              </EmbeddedFact>
            </div>
          </div>
        ) : (
          <ul className="space-y-0.5 rounded-lg border border-border/60 bg-muted/10 p-1">
            {when ? (
              <PageMetaRow icon={CalendarClock} label="When">
                {when}
              </PageMetaRow>
            ) : null}
            {place ? (
              <PageMetaRow icon={MapPin} label="Where">
                {place}
              </PageMetaRow>
            ) : null}
            {showOnlineLink ? (
              <PageMetaRow icon={Video} label="Online">
                <a
                  href={onlineHref!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Join meeting
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              </PageMetaRow>
            ) : null}
            {showBadOnlineLink ? (
              <PageMetaRow icon={Video} label="Online">
                <span className="text-amber-700 dark:text-amber-400">
                  The meeting link “{event.onlineUrl}” isn’t a valid URL — edit the event to fix it.
                </span>
              </PageMetaRow>
            ) : null}
            {!showOnlineLink && !showBadOnlineLink && event.onlineUrl && !canSeeOnline ? (
              <PageMetaRow icon={Video} label="Online">
                <span className="text-muted-foreground">Meeting link appears after you register</span>
              </PageMetaRow>
            ) : null}
            <PageMetaRow icon={Users} label="Host">
              <div className="flex flex-wrap items-center gap-2">
                {event.host ? (
                  <>
                    <Avatar className="h-7 w-7">
                      {event.host.profileImage ? (
                        <AvatarImage src={event.host.profileImage} alt="" />
                      ) : null}
                      <AvatarPlaceholderFallback />
                    </Avatar>
                    {hostHref ? (
                      <Link
                        href={hostHref}
                        className="font-semibold text-foreground hover:underline"
                      >
                        {hostName}
                      </Link>
                    ) : (
                      <span className="font-semibold">{hostName}</span>
                    )}
                    {event.isHost ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">You</span>
                    ) : null}
                  </>
                ) : (
                  <span>—</span>
                )}
              </div>
            </PageMetaRow>
          </ul>
        )}

        {event.description ? (
          <section className={cn("space-y-1.5", embedded && "pt-0.5")}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              About
            </h3>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {event.description}
            </div>
          </section>
        ) : null}

        {!embedded && extraImages.length > 0 ? (
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Photos
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allImages.map((url, i) => (
                <button
                  key={`${url}-${i}`}
                  type="button"
                  onClick={() => setViewer(i)}
                  className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60 transition hover:opacity-90"
                  aria-label={`View photo ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {!embedded && event.status === "published" ? (
          <div className="space-y-2 border-t border-border/60 pt-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {!event.isHost ? (
                registered ? (
                  <div className="flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-5 text-sm font-semibold text-emerald-800 dark:text-emerald-300 sm:w-auto">
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                    You’re registered
                  </div>
                ) : (
                  <Button
                    type="button"
                    className="h-10 w-full rounded-full px-6 font-semibold sm:w-auto"
                    disabled={rsvpPending || spotsLeft === 0}
                    onClick={onToggleRegister}
                  >
                    {rsvpPending ? "Registering…" : spotsLeft === 0 ? "Fully booked" : "Register"}
                  </Button>
                )
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full rounded-full sm:w-auto"
                onClick={onShare}
              >
                <Share2 className="mr-1.5 h-4 w-4" aria-hidden />
                Share
              </Button>
            </div>
            {registered && !event.isHost ? (
              <button
                type="button"
                disabled={rsvpPending}
                onClick={onToggleRegister}
                className="text-xs font-medium text-muted-foreground hover:text-destructive hover:underline disabled:opacity-50"
              >
                {rsvpPending ? "Cancelling…" : "Can’t make it? Cancel registration"}
              </button>
            ) : null}
            {rsvpError ? (
              <p className="text-sm text-destructive" role="alert">
                {rsvpError}
              </p>
            ) : null}
          </div>
        ) : null}

        {event.isHost ? (
          <div className={cn("border-t border-border/60 pt-4", embedded && "mt-1")}>
            <EventHostPanel event={event} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
