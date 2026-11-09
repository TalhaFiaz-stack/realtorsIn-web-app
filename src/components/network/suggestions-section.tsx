"use client";

import Link from "next/link";
import { SuggestionCard } from "@/components/network/suggestion-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { NetworkPerson } from "@/features/network/types/network.types";

const SUGGESTION_GRID = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3";

export function SuggestionsSection({
  title = "People you may know",
  suggestions,
  loading,
  maxItems = 3,
  showAllHref = "/connections?tab=suggestions",
  connectPendingUserId,
  onConnect,
  onDismiss,
}: {
  title?: string;
  suggestions: NetworkPerson[];
  loading?: boolean;
  maxItems?: number;
  showAllHref?: string | null;
  connectPendingUserId?: number | null;
  onConnect: (person: NetworkPerson) => void;
  onDismiss?: (person: NetworkPerson) => void;
}) {
  if (loading) {
    return (
      <section className="space-y-3 rounded-lg border border-border bg-card p-3 sm:p-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <div className={SUGGESTION_GRID}>
          {Array.from({ length: maxItems }).map((_, index) => (
            <Skeleton key={index} className="h-44 w-full rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (!suggestions.length) return null;

  const visible = suggestions.slice(0, maxItems);
  const showAll =
    Boolean(showAllHref) &&
    (suggestions.length > maxItems || suggestions.length >= maxItems);

  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {showAll && showAllHref ? (
          <Link
            href={showAllHref}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Show all
          </Link>
        ) : null}
      </div>
      <div className={SUGGESTION_GRID}>
        {visible.map((person) => (
          <SuggestionCard
            key={person.userId ?? person.name}
            person={person}
            connectPending={
              person.userId != null &&
              connectPendingUserId === person.userId
            }
            onConnect={() => onConnect(person)}
            onDismiss={onDismiss ? () => onDismiss(person) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
