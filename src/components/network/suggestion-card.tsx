"use client";

import Link from "next/link";
import { UserPlus, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { OpenToAvatarFrame } from "@/components/profile/open-to-avatar-frame";
import { VerifiedBadgeIcon } from "@/components/profile/profile-badges";
import { RemoteImage } from "@/components/shared/remote-image";
import { InlineLoader } from "@/components/states/inline-loader";
import {
  formatSuggestionContext,
  formatSuggestionHeadline,
} from "@/features/network/lib/suggestion-display";
import type { NetworkPerson } from "@/features/network/types/network.types";
import { cn } from "@/lib/utils";

export function SuggestionCard({
  person,
  connectPending,
  onConnect,
  onDismiss,
}: {
  person: NetworkPerson;
  connectPending?: boolean;
  onConnect: () => void;
  onDismiss?: () => void;
}) {
  const profileHref =
    person.userId != null ? `/profile/${person.userId}` : undefined;
  const headline = formatSuggestionHeadline(person, " @ ");
  const contextLine = formatSuggestionContext(person);
  const status = person.status;
  const alreadyPending =
    status === "pending" ||
    status === "request_sent" ||
    status === "request_received";
  const alreadyConnected =
    status === "accepted" || status === "connected";

  const nameNode = profileHref ? (
    <Link
      href={profileHref}
      className="locale-text line-clamp-2 text-sm font-semibold leading-snug text-foreground hover:underline"
    >
      {person.name}
    </Link>
  ) : (
    <h3 className="locale-text line-clamp-2 text-sm font-semibold leading-snug text-foreground">
      {person.name}
    </h3>
  );

  return (
    <article className="relative flex h-full w-full min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute end-2 top-2 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/65"
          aria-label={`Dismiss ${person.name}`}
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      ) : null}

      <div className="relative h-9 bg-[#cfd9de]">
        {person.coverUrl ? (
          <RemoteImage
            src={person.coverUrl}
            alt=""
            fill
            sizes="196px"
            className="object-cover"
            fallbackClassName="absolute inset-0 bg-[#cfd9de]"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#b0bec5] via-[#cfd9de] to-[#dfe6ea]" />
        )}
      </div>

      <div className="relative z-10 -mt-7 flex justify-center">
        <div className="relative h-14 w-14">
          {profileHref ? (
            <Link
              href={profileHref}
              className="block h-full w-full overflow-hidden rounded-full border-2 border-card bg-muted"
            >
              <Avatar className="h-full w-full rounded-full">
                {person.avatarUrl ? (
                  <AvatarImage src={person.avatarUrl} alt="" />
                ) : null}
                <AvatarPlaceholderFallback />
              </Avatar>
            </Link>
          ) : (
            <div className="h-full w-full overflow-hidden rounded-full border-2 border-card bg-muted">
              <Avatar className="h-full w-full rounded-full">
                {person.avatarUrl ? (
                  <AvatarImage src={person.avatarUrl} alt="" />
                ) : null}
                <AvatarPlaceholderFallback />
              </Avatar>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
            <OpenToAvatarFrame openTo={person.openTo} />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center px-2.5 pb-2.5 pt-1.5 text-center">
        <div className="flex w-full flex-col items-center gap-0.5">
          <div className="flex max-w-full items-start justify-center gap-1">
            {nameNode}
            {person.isVerified ? (
              <span className="mt-0.5 shrink-0">
                <VerifiedBadgeIcon size={14} />
              </span>
            ) : null}
          </div>

          {headline ? (
            <p className="line-clamp-2 w-full text-xs leading-snug text-muted-foreground">
              {headline}
            </p>
          ) : null}
        </div>

        {person.userId &&
        (person.mutualCount ?? person.mutualConnections.length) > 0 ? (
          <Link
            href={`/connections/mutual/${person.userId}?name=${encodeURIComponent(person.name)}`}
            className="mt-1 line-clamp-2 w-full text-[11px] leading-snug text-primary hover:underline"
          >
            {contextLine}
          </Link>
        ) : (
          <p className="mt-1 line-clamp-2 w-full text-[11px] leading-snug text-muted-foreground">
            {contextLine}
          </p>
        )}

        <div className="mt-auto w-full pt-2">
          {alreadyConnected ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-full text-xs font-semibold"
              disabled
            >
              Connected
            </Button>
          ) : alreadyPending ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-full text-xs font-semibold"
              disabled
            >
              Pending
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-8 w-full border-primary text-xs font-semibold text-primary",
                "hover:bg-primary/5 hover:text-primary"
              )}
              disabled={connectPending || !person.userId}
              onClick={onConnect}
            >
              {connectPending ? (
                <InlineLoader className="mr-1.5 h-4 w-4" />
              ) : (
                <UserPlus className="mr-1.5 h-4 w-4" />
              )}
              {connectPending ? "Connecting…" : "Connect"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
