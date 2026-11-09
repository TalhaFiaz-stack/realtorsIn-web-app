"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SuggestionsSection } from "@/components/network/suggestions-section";
import {
  connectSuggestionWithDismiss,
  useNetworkActions,
  useNetworkList,
} from "@/features/network/hooks/use-network";
import type { NetworkPerson } from "@/features/network/types/network.types";

/** Mobile SocialProfile `SuggestionsSection` — own profile only. */
export function ProfileConnectionSuggestions() {
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

  function connectSuggestion(person: NetworkPerson) {
    if (!person.userId) return;
    connectSuggestionWithDismiss({
      mutate,
      queryClient,
      userId: person.userId,
      onDismiss: (userId) =>
        setDismissedIds((prev) => new Set(prev).add(userId)),
    });
  }

  function dismissSuggestion(person: NetworkPerson) {
    if (person.userId == null) return;
    setDismissedIds((prev) => new Set(prev).add(person.userId!));
  }

  return (
    <SuggestionsSection
      title="People you may know"
      suggestions={suggestions}
      loading={suggestionsQuery.isLoading}
      maxItems={3}
      connectPendingUserId={connectPendingUserId}
      onConnect={connectSuggestion}
      onDismiss={dismissSuggestion}
    />
  );
}
