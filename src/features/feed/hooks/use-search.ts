"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchSearchPageRequest } from "@/features/feed/services/search.client";
import type { SearchTab } from "@/features/feed/types/search.types";

export function searchQueryKey(tab: SearchTab, searchText: string) {
  return ["search", tab, searchText.trim()] as const;
}

export function useSearch(tab: SearchTab, searchText: string, enabled = true) {
  const query = useInfiniteQuery({
    queryKey: searchQueryKey(tab, searchText),
    enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      fetchSearchPageRequest({
        page: pageParam,
        perPage: 20,
        searchText: searchText.trim() || undefined,
        searchType: tab,
        signal,
      }),
    getNextPageParam: (last) =>
      last.hasNextPage ? last.page + 1 : undefined,
  });

  const pages = query.data?.pages ?? [];
  const first = pages[0];

  return {
    kind: first?.kind ?? (tab === "account" ? "accounts" : tab === "tags" ? "tags" : "posts"),
    posts:
      pages.flatMap((page) => (page.kind === "posts" ? page.posts : [])) ?? [],
    people:
      pages.flatMap((page) =>
        page.kind === "accounts" ? page.people : []
      ) ?? [],
    tags:
      pages.flatMap((page) => (page.kind === "tags" ? page.tags : [])) ?? [],
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: Boolean(query.hasNextPage),
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
  };
}

const RECENT_KEY = "ri_recent_searches";

export function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeRecentSearch(term: string): string[] {
  const trimmed = term.trim();
  if (!trimmed) return readRecentSearches();
  const next = [
    trimmed,
    ...readRecentSearches().filter(
      (item) => item.toLowerCase() !== trimmed.toLowerCase()
    ),
  ].slice(0, 12);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

export function removeRecentSearch(term: string): string[] {
  const next = readRecentSearches().filter((item) => item !== term);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}
