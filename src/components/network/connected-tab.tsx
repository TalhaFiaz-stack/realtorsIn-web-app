"use client";

import { useMemo } from "react";
import { NetworkRowActions } from "@/components/network/network-row-actions";
import { PersonRow } from "@/components/network/person-row";
import { SuggestionsSection } from "@/components/network/suggestions-section";
import { NetworkPeopleSkeleton } from "@/components/states/list-row-skeleton";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import {
  networkErrorMessage,
  type NetworkAction,
} from "@/features/network/hooks/use-network";
import type { NetworkPerson } from "@/features/network/types/network.types";

const PEOPLE_YOU_MAY_KNOW_AFTER = 9;
const SUGGESTIONS_PER_BLOCK = 4;

export function ConnectedTab({
  people,
  suggestions,
  listLoading,
  listError,
  onRetryList,
  suggestionsLoading,
  connectPendingUserId,
  mutatePending,
  mutateVariables,
  onMutate,
  onConnectSuggestion,
  onDismissSuggestion,
}: {
  people: NetworkPerson[];
  suggestions: NetworkPerson[];
  listLoading: boolean;
  listError: unknown;
  onRetryList: () => void;
  suggestionsLoading: boolean;
  connectPendingUserId: number | null;
  mutatePending: boolean;
  mutateVariables: {
    action: NetworkAction;
    connectionId?: number;
    userId?: number;
  } | null;
  onMutate: (input: {
    action: NetworkAction;
    connectionId?: number;
    userId?: number;
  }) => void;
  onConnectSuggestion: (person: NetworkPerson) => void;
  onDismissSuggestion: (person: NetworkPerson) => void;
}) {
  const blocks = useMemo(() => {
    const next: Array<
      | { type: "person"; person: NetworkPerson }
      | { type: "suggestions"; suggestions: NetworkPerson[]; key: string }
    > = [];
    let suggestionOffset = 0;
    people.forEach((person, index) => {
      next.push({ type: "person", person });
      const connectionNumber = index + 1;
      if (
        connectionNumber % PEOPLE_YOU_MAY_KNOW_AFTER === 0 &&
        suggestions.length > suggestionOffset
      ) {
        const slice = suggestions.slice(
          suggestionOffset,
          suggestionOffset + SUGGESTIONS_PER_BLOCK
        );
        suggestionOffset += SUGGESTIONS_PER_BLOCK;
        if (slice.length) {
          next.push({
            type: "suggestions",
            suggestions: slice,
            key: `suggestions-${connectionNumber}`,
          });
        }
      }
    });
    return next;
  }, [people, suggestions]);

  if (listLoading) return <NetworkPeopleSkeleton count={5} />;
  if (listError) {
    return (
      <ErrorState
        title="Unable to load"
        description={networkErrorMessage(listError)}
        onRetry={onRetryList}
      />
    );
  }
  if (people.length === 0) {
    return (
      <EmptyState
        title="Nothing here yet"
        description="Invite colleagues or discover people to connect."
      />
    );
  }

  const hasInlineSuggestions = blocks.some((b) => b.type === "suggestions");

  return (
    <div className="space-y-4">
      <ul className="overflow-hidden rounded-[var(--radius)] border border-border bg-card px-2 shadow-sm">
        {blocks.map((block) => {
          if (block.type === "person") {
            return (
              <PersonRow
                key={`${block.person.connectionId ?? block.person.userId}`}
                person={block.person}
                actions={
                  <NetworkRowActions
                    person={block.person}
                    context="all"
                    mutatePending={mutatePending}
                    mutateVariables={mutateVariables}
                    onMutate={onMutate}
                  />
                }
              />
            );
          }
          return (
            <li
              key={block.key}
              className="list-none border-b border-border py-3 last:border-b-0"
            >
              <SuggestionsSection
                suggestions={block.suggestions}
                maxItems={SUGGESTIONS_PER_BLOCK}
                showAllHref="/connections?tab=suggestions"
                connectPendingUserId={connectPendingUserId}
                onConnect={onConnectSuggestion}
                onDismiss={onDismissSuggestion}
              />
            </li>
          );
        })}
      </ul>
      {!hasInlineSuggestions && suggestions.length > 0 ? (
        <SuggestionsSection
          suggestions={suggestions}
          maxItems={SUGGESTIONS_PER_BLOCK}
          loading={suggestionsLoading}
          connectPendingUserId={connectPendingUserId}
          onConnect={onConnectSuggestion}
          onDismiss={onDismissSuggestion}
        />
      ) : null}
    </div>
  );
}
