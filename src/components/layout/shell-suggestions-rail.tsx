"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { MapPin, UserPlus, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InlineLoader } from "@/components/states/inline-loader";
import { VerifiedBadgeIcon } from "@/components/profile/profile-badges";
import { ProfileHandle } from "@/components/shared/profile-handle";
import {
  connectSuggestionWithDismiss,
  useNetworkActions,
  useNetworkList,
} from "@/features/network/hooks/use-network";
import {
  formatSuggestionContext,
  formatSuggestionHeadline,
} from "@/features/network/lib/suggestion-display";
import type { NetworkPerson } from "@/features/network/types/network.types";
import { useTranslation } from "react-i18next";

function CompactSuggestionRowSkeleton() {
  return (
    <article
      className="relative flex flex-col rounded-lg border border-border bg-card p-3"
      aria-hidden
    >
      <Skeleton className="absolute end-2 top-2 h-7 w-7 rounded-full" />
      <div className="flex gap-3 pe-6">
        <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
          <Skeleton className="h-4 w-[72%] max-w-[10rem]" />
          <Skeleton className="h-3 w-[45%] max-w-[6rem]" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[88%]" />
          <div className="flex items-center gap-1.5 pt-0.5">
            <Skeleton className="h-3 w-3 shrink-0 rounded-full" />
            <Skeleton className="h-3 w-[58%]" />
          </div>
        </div>
      </div>
      <Skeleton className="mt-2.5 h-8 w-full rounded-md" />
    </article>
  );
}

function CompactSuggestionRow({
  person,
  connectPending,
  onConnect,
  onDismiss,
}: {
  person: NetworkPerson;
  connectPending?: boolean;
  onConnect: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const profileHref =
    person.userId != null ? `/profile/${person.userId}` : undefined;
  const headline = formatSuggestionHeadline(person);
  const contextLine = formatSuggestionContext(person);
  const location = person.location?.trim() ?? "";
  const status = person.status;
  const alreadyPending =
    status === "pending" ||
    status === "request_sent" ||
    status === "request_received";
  const alreadyConnected =
    status === "accepted" || status === "connected";
  const mutualCount =
    person.mutualCount ?? person.mutualConnections.length ?? 0;
  const hasMutualLink = person.userId != null && mutualCount > 0;

  return (
    <article className="relative flex flex-col rounded-lg border border-border bg-card p-3">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute end-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={`Dismiss ${person.name}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex gap-3 pe-6">
        {profileHref ? (
          <Link href={profileHref} className="shrink-0">
            <Avatar className="h-12 w-12">
              {person.avatarUrl ? (
                <AvatarImage src={person.avatarUrl} alt="" />
              ) : null}
              <AvatarPlaceholderFallback />
            </Avatar>
          </Link>
        ) : (
          <Avatar className="h-12 w-12 shrink-0">
            {person.avatarUrl ? (
              <AvatarImage src={person.avatarUrl} alt="" />
            ) : null}
            <AvatarPlaceholderFallback />
          </Avatar>
        )}

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-start gap-1">
            {profileHref ? (
              <Link
                href={profileHref}
                className="locale-text line-clamp-1 text-sm font-semibold text-foreground hover:underline"
              >
                {person.name}
              </Link>
            ) : (
              <p className="locale-text line-clamp-1 text-sm font-semibold">
                {person.name}
              </p>
            )}
            {person.isVerified ? (
              <span className="mt-0.5 shrink-0">
                <VerifiedBadgeIcon size={14} />
              </span>
            ) : null}
          </div>

          {person.userName ? (
            <ProfileHandle
              userName={person.userName}
              className="text-[11px] text-muted-foreground"
            />
          ) : null}

          {headline ? (
            <p className="locale-text line-clamp-1 text-xs text-muted-foreground">
              {headline}
            </p>
          ) : null}

          {hasMutualLink ? (
            <Link
              href={`/connections/mutual/${person.userId}?name=${encodeURIComponent(person.name)}`}
              className="locale-text line-clamp-2 text-[11px] leading-snug text-primary hover:underline"
            >
              {contextLine}
            </Link>
          ) : (
            <p className="locale-text line-clamp-2 text-[11px] leading-snug text-muted-foreground">
              {contextLine}
            </p>
          )}

          {location ? (
            <p className="locale-text flex items-center gap-1 line-clamp-1 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
              {location}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-2.5">
        {alreadyConnected ? (
          <p className="locale-text text-center text-xs font-medium text-muted-foreground">
            {t("Connected")}
          </p>
        ) : alreadyPending ? (
          <p className="locale-text text-center text-xs font-medium text-muted-foreground">
            {t("Pending")}
          </p>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 w-full gap-1.5 locale-text"
            disabled={connectPending || person.userId == null}
            onClick={onConnect}
          >
            {connectPending ? (
              <InlineLoader className="h-3.5 w-3.5" />
            ) : (
              <UserPlus className="h-3.5 w-3.5" />
            )}
            {connectPending ? t("Connecting…") : t("Connect")}
          </Button>
        )}
      </div>
    </article>
  );
}

/** LinkedIn-style people suggestions for feed / profile right rail. */
export function ShellSuggestionsRail({ maxItems = 4 }: { maxItems?: number }) {
  const { t } = useTranslation();
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();
  const suggestionsQuery = useNetworkList("suggestions");
  const mutate = useNetworkActions();

  const suggestions = useMemo(
    () =>
      (suggestionsQuery.data?.people ?? []).filter(
        (person) => person.userId == null || !dismissedIds.has(person.userId)
      ),
    [suggestionsQuery.data?.people, dismissedIds]
  );

  const connectPendingUserId =
    mutate.isPending &&
    mutate.variables?.action === "send" &&
    typeof mutate.variables.userId === "number"
      ? mutate.variables.userId
      : null;

  const visible = suggestions.slice(0, maxItems);

  return (
    <div className="space-y-3">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <h2 className="locale-text text-sm font-semibold text-foreground">
            {t("People you may know")}
          </h2>
          <Link
            href="/connections/suggestions"
            className="locale-text text-xs font-semibold text-primary hover:underline"
          >
            {t("View all")}
          </Link>
        </div>

        {suggestionsQuery.isLoading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading suggestions">
            {Array.from({ length: maxItems }).map((_, index) => (
              <CompactSuggestionRowSkeleton key={index} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              No suggestions right now. Explore Network to find people.
            </p>
            <Button asChild className="mt-3 w-full" size="sm">
              <Link href="/connections">Open Network</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((person) => (
              <CompactSuggestionRow
                key={person.userId ?? person.name}
                person={person}
                connectPending={
                  person.userId != null &&
                  connectPendingUserId === person.userId
                }
                onConnect={() => {
                  if (!person.userId) return;
                  connectSuggestionWithDismiss({
                    mutate,
                    queryClient,
                    userId: person.userId,
                    onDismiss: (userId) =>
                      setDismissedIds((prev) => new Set(prev).add(userId)),
                  });
                }}
                onDismiss={() => {
                  if (person.userId == null) return;
                  setDismissedIds((prev) => new Set(prev).add(person.userId!));
                }}
              />
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-col rounded-lg border border-border bg-card p-4">
        <h2 className="locale-text text-sm font-semibold text-foreground">
          {t("Grow faster")}
        </h2>
        <p className="locale-text mt-1 text-xs leading-relaxed text-muted-foreground">
          {t("Share an update or invite colleagues to join your network.")}
        </p>
        <Button asChild variant="outline" className="mt-3 w-full" size="sm">
          <Link href="/create" className="locale-text">
            {t("Start a post")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
