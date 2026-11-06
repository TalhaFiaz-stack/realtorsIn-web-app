"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FeedSuggestionSection } from "@/components/feed/feed-suggestion-section";
import { SuggestionCard } from "@/components/network/suggestion-card";
import type { FeedSuggestionModuleType } from "@/features/feed/lib/merge-feed-with-suggestions";
import {
  connectSuggestionWithDismiss,
  useNetworkActions,
} from "@/features/network/hooks/use-network";
import type { NetworkPerson } from "@/features/network/types/network.types";

const COPY: Record<
  "contact_suggestions" | "connection_suggestions",
  { title: string; showAllHref: string }
> = {
  contact_suggestions: {
    title: "People from your contacts",
    showAllHref: "/connections?tab=suggestions",
  },
  connection_suggestions: {
    title: "People you may know",
    showAllHref: "/connections?tab=suggestions",
  },
};

export function FeedPeopleSuggestionsRow({
  moduleType,
  people,
}: {
  moduleType: "contact_suggestions" | "connection_suggestions";
  people: NetworkPerson[];
}) {
  const queryClient = useQueryClient();
  const mutate = useNetworkActions();
  const [dismissedIds, setDismissedIds] = useState(() => new Set<number>());
  const [sectionDismissed, setSectionDismissed] = useState(false);

  const visible = useMemo(
    () =>
      people.filter(
        (p) => p.userId == null || !dismissedIds.has(p.userId)
      ),
    [people, dismissedIds]
  );

  const connectPendingUserId =
    mutate.isPending &&
    mutate.variables?.action === "send" &&
    typeof mutate.variables.userId === "number"
      ? mutate.variables.userId
      : null;

  if (sectionDismissed || visible.length === 0) return null;

  const { title, showAllHref } = COPY[moduleType];

  return (
    <FeedSuggestionSection
      title={title}
      showAllHref={showAllHref}
      onDismiss={() => setSectionDismissed(true)}
    >
      {visible.map((person) => (
        <div
          key={person.userId ?? person.name}
          className="flex w-[min(52vw,12.25rem)] shrink-0 snap-start self-stretch flex-col"
        >
          <SuggestionCard
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
            onDismiss={
              person.userId
                ? () =>
                    setDismissedIds((prev) =>
                      new Set(prev).add(person.userId!)
                    )
                : undefined
            }
          />
        </div>
      ))}
    </FeedSuggestionSection>
  );
}

export function isPeopleModule(
  type: FeedSuggestionModuleType
): type is "contact_suggestions" | "connection_suggestions" {
  return (
    type === "contact_suggestions" || type === "connection_suggestions"
  );
}
