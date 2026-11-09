"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchConnections } from "@/features/network/services/network.client";
import type { NetworkPerson } from "@/features/network/types/network.types";
import {
  detectMentionQuery,
  filterMentionCandidates,
  findActiveMentionRange,
  insertMentionAtRange,
  type MentionCandidate,
} from "@/features/feed/lib/mention-query";

function toCandidate(person: NetworkPerson): MentionCandidate | null {
  if (person.userId == null || !person.name.trim()) return null;
  return {
    userId: person.userId,
    displayName: person.name.trim(),
    userName: person.userName,
    avatarUrl: person.avatarUrl,
  };
}

async function loadConnectionsCatalog(): Promise<MentionCandidate[]> {
  const merged: MentionCandidate[] = [];
  const seen = new Set<number>();
  for (let page = 1; page <= 4; page += 1) {
    const result = await fetchConnections({
      type: "all",
      page,
      limit: 50,
    });
    for (const person of result.people) {
      const candidate = toCandidate(person);
      if (!candidate || seen.has(candidate.userId)) continue;
      seen.add(candidate.userId);
      merged.push(candidate);
    }
    if (page >= result.totalPages || result.people.length === 0) break;
  }
  return merged;
}

export function useMentionComposer(options: {
  value: string;
  onChange: (next: string) => void;
  enabled?: boolean;
}) {
  const { value, onChange, enabled = true } = options;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mentionedIdsRef = useRef<Set<number>>(new Set());
  const metaByIdRef = useRef<
    Map<number, { user_id: number; display_name: string; user_name: string }>
  >(new Map());
  // Shared, cached connection list (post composer + every comment box).
  const catalogQuery = useQuery({
    queryKey: ["mention-catalog"],
    queryFn: loadConnectionsCatalog,
    enabled,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 2,
  });
  const catalog = useMemo(() => catalogQuery.data ?? [], [catalogQuery.data]);
  const catalogLoading = catalogQuery.isPending && enabled;
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [displayLabels, setDisplayLabels] = useState<string[]>([]);

  const suggestions = useMemo(() => {
    if (mentionQuery === null) return [];
    return filterMentionCandidates(catalog, mentionQuery);
  }, [catalog, mentionQuery]);

  // Text at the moment the list was dismissed (Esc/blur). Selection events
  // fire again on key-up, so stay closed until the text actually changes.
  const dismissedTextRef = useRef<string | null>(null);

  const syncQueryFromCursor = useCallback(
    (text: string, cursor: number) => {
      if (dismissedTextRef.current !== null && dismissedTextRef.current === text) return;
      dismissedTextRef.current = null;
      setMentionQuery(detectMentionQuery(text, cursor));
    },
    []
  );

  const handleChange = useCallback(
    (next: string, cursor?: number) => {
      onChange(next);
      setDisplayLabels((prev) =>
        prev.filter((label) => next.includes(label))
      );
      const pos = cursor ?? next.length;
      syncQueryFromCursor(next, pos);
    },
    [onChange, syncQueryFromCursor]
  );

  const handleSelect = useCallback(
    (candidate: MentionCandidate) => {
      const el = textareaRef.current;
      const cursor = el?.selectionStart ?? value.length;
      const range =
        findActiveMentionRange(value, cursor) ??
        findActiveMentionRange(value, value.length);
      const label = candidate.displayName;
      mentionedIdsRef.current.add(candidate.userId);
      metaByIdRef.current.set(candidate.userId, {
        user_id: candidate.userId,
        display_name: label,
        user_name: candidate.userName ?? "",
      });
      setDisplayLabels((prev) =>
        prev.includes(label) ? prev : [...prev, label]
      );

      let nextText: string;
      let nextCursor: number;
      if (range) {
        ({ nextText, nextCursor } = insertMentionAtRange(value, range, label));
      } else {
        const mentionText = `${label} `;
        const needsSpace = value.length > 0 && !/\s$/.test(value);
        nextText = `${value}${needsSpace ? " " : ""}${mentionText}`;
        nextCursor = nextText.length;
      }

      onChange(nextText);
      setMentionQuery(null);
      window.requestAnimationFrame(() => {
        const node = textareaRef.current;
        if (!node) return;
        node.focus();
        node.setSelectionRange(nextCursor, nextCursor);
      });
    },
    [onChange, value]
  );

  /** Close the suggestion list (Esc / blur) without touching the text. */
  const dismiss = useCallback(() => {
    dismissedTextRef.current = textareaRef.current?.value ?? null;
    setMentionQuery(null);
  }, []);

  const resetMentions = useCallback(() => {
    mentionedIdsRef.current = new Set();
    metaByIdRef.current = new Map();
    setDisplayLabels([]);
    setMentionQuery(null);
  }, []);

  const getMentionPayload = useCallback(() => {
    const ids = [...mentionedIdsRef.current].filter((id) => {
      const meta = metaByIdRef.current.get(id);
      if (!meta?.display_name) return false;
      return value.includes(meta.display_name);
    });
    const users = ids
      .map((id) => metaByIdRef.current.get(id))
      .filter(Boolean) as Array<{
      user_id: number;
      display_name: string;
      user_name: string;
    }>;
    return { mentionedUserIds: ids, mentionedUsers: users };
  }, [value]);

  return {
    textareaRef,
    mentionActive: mentionQuery !== null,
    mentionQuery: mentionQuery ?? "",
    suggestions,
    catalogLoading,
    catalogError: catalogQuery.isError,
    retryCatalog: () => void catalogQuery.refetch(),
    displayLabels,
    handleChange,
    handleSelect,
    dismiss,
    syncQueryFromCursor,
    resetMentions,
    getMentionPayload,
  };
}
